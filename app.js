
/* ===========================================================
  算術の塔 SPA（複数マップ対応 + 位置復元修正版）
  - バトルCSSをスコープ化して、マップが消える/操作不能になる問題を回避
  - 次のフロアで次のマップデータを読み込み、スタート位置から開始
  =========================================================== */

/* ------------------------------
  共通ユーティリティ
------------------------------ */
const rand = (min,max)=> Math.floor(Math.random()*(max-min+1))+min;
const resolveStat = (v)=> Array.isArray(v) ? rand(v[0], v[1]) : v;

/* ------------------------------
  設定
------------------------------ */
const CONFIG = {
  disappearSteps: 12,
  baseRespawnLimit: 3,
  score: { timeWeight: -1, killWeight: 100, floorWeight: 500, baseClearBonus: 2000 },
  // ★ GRADESに基づいて動的に生成される難易度リスト（後で生成）
  difficulties: [],
  autosave: true,
  saveSlots: 3,
  
  // ★ 追加：EXP計算設定
  levelUpExpFormula: (level) => level * 50, // レベル×50でEXP必要値を計算
  
  // ★ 追加：ダメージ計算設定
  damageCalc: {
    comboMultiplier: 0.1,          // コンボボーナス倍率（コンボ数が上がると+10%ずつ）
    ultimateStarThreshold: 30,      // 必殺技に必要な★合計
    ultimateMultiplier: 3,          // 必殺技の倍率
    paralysisChainThreshold: 4,     // 同じ操作が連続n回で特殊攻撃発動（連続した場合）
    paralysisChainDamageMultiplier: 2, // 特殊攻撃のダメージ倍率
    paralysisDuration: 5            // 麻痺時間（秒）
  },
  
  // ★ 追加：敵復活設定
  respawn: {
    delay: 30000,  // 復活までの待機時間（ミリ秒、デフォルト30秒）
    limit: 3       // 復活できる回数（デフォルト3回）
  },
  
  // ★ 追加：Gradeごとのステータスアップ数
  statusUpByGrade: {
    "初級": {
      hp: 40, atk: 6, def: 6, spd: 3
    },
    "中級": {
      hp: 35, atk: 5, def: 5, spd: 2
    },
    "上級": {
      hp: 30, atk: 4, def: 4, spd: 2
    },
    "超級": {
      hp: 25, atk: 3, def: 3, spd: 1
    },
    "極級": {
      hp: 20, atk: 2, def: 2, spd: 1
    }
  }
};

/* ------------------------------
   初期値
------------------------------ */
const DEFAULTS = {
  player: { level:1, exp:0, stats:{hp:100, atk:15, def:5, spd:5} },
  settings: {
    controlMode: 'relative',
    clickToMove: true,
    radar: { w: 5, h: 5 }
  },
  run: {
    deaths: 0,
    floorDeaths: 0,
    mode: 'quest',
    arenaIndex: 0
  }
};

const cloneDefault = (value)=> JSON.parse(JSON.stringify(value));

/* ------------------------------
  セーブ管理
------------------------------ */
const SaveSystem = (() => {
  const KEY = 'arithmetic_tower_saves_v3';
  const loadAll = ()=>{ try{return JSON.parse(localStorage.getItem(KEY))||[];}catch{return[];} };
  const saveAll = (s)=> localStorage.setItem(KEY, JSON.stringify(s.slice(0, CONFIG.saveSlots)));
  return {
    list: loadAll,
    append(data){ const s=loadAll(); s.unshift(data); if(s.length > CONFIG.saveSlots) s.pop(); saveAll(s); }
  };
})();

/* ------------------------------
  動的設定（GRADES 由来）
------------------------------ */
// ★ 追加：GRADES から難易度リストを動的に生成
if (typeof GRADES !== 'undefined' && GRADES) {
  CONFIG.difficulties = Object.keys(GRADES).map((gradeName, idx) => ({
    id: `grade_${idx}`,
    label: gradeName.toUpperCase(),
    grade: gradeName,
    seed: 100 + (idx * 101)
  }));
}

/* ------------------------------
  実行時ストア
------------------------------ */
const Store = {
  difficulty: null,
  floorIndex: 0,          // 0-based
  timerStartAt: null,
  elapsedSeconds: 0,
  totalKills: 0,
  player: cloneDefault(DEFAULTS.player),
  deaths: DEFAULTS.run.deaths,
  floorDeaths: DEFAULTS.run.floorDeaths,
  mode: DEFAULTS.run.mode,
  arenaIndex: DEFAULTS.run.arenaIndex,
  pendingEnemyIndex: null,
  lastResultStamp: null,

  // フロアごとの状態（位置・歩数・撃破記録）
  floorStates: {},
  pendingEventId: null,

  // ★ 追加：直近の遭遇・結果表示用
  lastEncounter: null,   // { stageId, enemyName, action: 'fight'|'escape' }
  lastBattle: null,      // { enemyName, result: 'win'|'lose' }

  // ★ 追加：マップの操作やレーダー表示の設定
  settings: cloneDefault(DEFAULTS.settings)

};

/* ------------------------------
  共有ヘルパー
------------------------------ */
function getMaps(){ return window.MAPS || []; }
function getMapData(floorIndex){ return getMaps()[floorIndex] || getMaps()[0]; }
function ensureFloorState(floorIndex){
  if(!Store.floorStates[floorIndex]){
    Store.floorStates[floorIndex] = {
      steps: 0,
      position: null, // nullならMapEngineがスタートへ
      defeated: {}  // eventId -> { defeatedAt, respawnDelay, respawnLimit, respawnCount }
    };
  }
  return Store.floorStates[floorIndex];
}

function startRunTimer(){ if(!Store.timerStartAt) Store.timerStartAt = Date.now(); }
function stopRunTimer(){ if(!Store.timerStartAt) return; Store.elapsedSeconds += Math.floor((Date.now()-Store.timerStartAt)/1000); Store.timerStartAt=null; }
function resetRunTimer(){ Store.elapsedSeconds = 0; Store.timerStartAt = null; }
function currentDifficulty(){ return Store.difficulty || CONFIG.difficulties[1]; }
function normalizeMode(mode){ return mode === 'arena' ? 'arena' : 'quest'; }
function modeLabel(mode){ return normalizeMode(mode) === 'arena' ? '闘技場' : 'クエスト'; }
function elapsedNow(){ return Store.elapsedSeconds + (Store.timerStartAt ? Math.floor((Date.now()-Store.timerStartAt)/1000) : 0); }
function getArenaEnemies(){
  const floors = (typeof STAGE_MASTER !== 'undefined' && STAGE_MASTER) ? STAGE_MASTER : [];
  return floors.flatMap((floor, floorIdx)=> (floor.stages || []).flatMap(stage=>
    (stage.enemies || []).map((enemy, enemyIdx)=>({
      floorIdx,
      stageId: stage.id,
      enemyIdx
    }))
  ));
}
function getArenaEnemyAt(index){
  const list = getArenaEnemies();
  return list[index] || null;
}
function setArenaEnemy(index){
  Store.arenaIndex = Math.max(0, index|0);
  const item = getArenaEnemyAt(Store.arenaIndex);
  if(!item) return null;
  Store.floorIndex = item.floorIdx;
  Store.pendingEventId = item.stageId;
  Store.pendingEnemyIndex = item.enemyIdx;
  return item;
}
function computeScore(){
  const t = Store.elapsedSeconds;
  const kills = Store.totalKills;
  const floor = Store.floorIndex + 1;
  if (typeof window !== 'undefined' && typeof window.calculateScore === 'function') {
    return window.calculateScore({
      elapsedSeconds: t,
      totalKills: kills,
      floorIndex: Store.floorIndex,
      scoreConfig: CONFIG.score
    });
  }
  return Math.max(0, Math.floor(CONFIG.score.baseClearBonus + CONFIG.score.timeWeight*t + CONFIG.score.killWeight*kills + CONFIG.score.floorWeight*floor));
}
function buildSaveData(meta={}){
  return {
    ts: Date.now(),
    difficulty: Store.difficulty?.id,
    floorIndex: Store.floorIndex,
    elapsedSeconds: elapsedNow(),
    totalKills: Store.totalKills,
    player: Store.player,
    floorStates: Store.floorStates,
    deaths: Store.deaths,
    floorDeaths: Store.floorDeaths,
    mode: Store.mode,
    arenaIndex: Store.arenaIndex,
    settings: Store.settings,
    meta
  };
}
function applySaveData(data){
  const diffId = data?.difficulty;
  Store.difficulty = CONFIG.difficulties.find(d=>d.id===diffId) || CONFIG.difficulties[1];
  Store.floorIndex = data?.floorIndex ?? 0;
  Store.elapsedSeconds = data?.elapsedSeconds ?? 0;
  Store.totalKills = data?.totalKills ?? 0;
  Store.player = data?.player || cloneDefault(DEFAULTS.player);
  Store.floorStates = data?.floorStates || {};
  Store.deaths = data?.deaths ?? DEFAULTS.run.deaths;
  Store.floorDeaths = data?.floorDeaths ?? DEFAULTS.run.floorDeaths;
  Store.mode = normalizeMode(data?.mode ?? DEFAULTS.run.mode);
  Store.arenaIndex = data?.arenaIndex ?? DEFAULTS.run.arenaIndex;
  Store.settings = data?.settings || cloneDefault(DEFAULTS.settings);
  Store.lastResultStamp = null;
  Store.pendingEnemyIndex = null;
  if(Store.mode === 'arena') setArenaEnemy(Store.arenaIndex);
  ensureFloorState(Store.floorIndex);
  Store.timerStartAt = null;
  startRunTimer();
}
function autosave(meta={}){
  if(!CONFIG.autosave) return;
  SaveSystem.append(buildSaveData(meta));
}

/* ------------------------------
   スコア管理（フロア別 Top30）
------------------------------ */
const ScoreStore = (() => {
  const KEY = 'arithmetic_tower_scores_v1';
  const loadAll = ()=>{ try{return JSON.parse(localStorage.getItem(KEY))||{};}catch{return{};} };
  const saveAll = (s)=> localStorage.setItem(KEY, JSON.stringify(s));
  const sortScores = (a,b)=> (
    (b.score - a.score) ||
    (a.elapsedSeconds - b.elapsedSeconds) ||
    (b.totalKills - a.totalKills) ||
    (a.deaths - b.deaths)
  );
  const floorKey = (entry)=> `${entry.floorIndex ?? 0}-${normalizeMode(entry.mode)}`;
  return {
    record(entry){
      const all = loadAll();
      const key = floorKey(entry);
      const list = Array.isArray(all[key]) ? all[key] : [];
      list.push(entry);
      list.sort(sortScores);
      all[key] = list.slice(0, 30);
      saveAll(all);
    },
    listByFloor(floorIndex, mode){
      const all = loadAll();
      const key = `${floorIndex ?? 0}-${normalizeMode(mode)}`;
      return (all[key] || []).slice(0, 30);
    }
  };
})();

/* ------------------------------
   MapEngine（添付マップ仕様を踏襲。mapDataを差し替え可能）
------------------------------ */
class MapEngine {
  constructor(mapData){
    this.mapData = mapData;
    this.handlers = {};
    this.hiddenEvents = new Set();
    this.steps = 0;
    this.isBusy = false;
    this.isGoal = false;
    this.timerInterval = null;
    this.VECTORS = [{x:0,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:0}];
    this.currentPos = {x:0,y:0};
    this.currentFacing = 0;
    this.startTime = 0;
  }
  on(n,h){ (this.handlers[n] ||= []).push(h); }
  emit(n,p){ (this.handlers[n]||[]).forEach(h=>h(p)); }

  mount(container){
    container.innerHTML = `
      <style>
      .map-scope { background: #0d0f14; color: #e0e6ed; font-family: 'Segoe UI', sans-serif; border-radius:16px; padding: 1rem; }
      .map-scope #game-ui { width: 420px; max-width: 100%; background: #1a1d23; border-radius: 28px; padding: 30px; position: relative; border: 3px solid #00d4ff; box-shadow: 0 30px 60px rgba(0,0,0,0.8), 0 0 30px rgba(0,212,255,0.4); margin: 0 auto; }
      .map-scope #time-status { position: absolute; top: 10px; left: 20px; font-size: 14px; color: #00aaff; font-weight: bold; display: flex; align-items: center; gap: 5px; }
      .map-scope #navigation-core { position: absolute; top: -60px; right: 20px; width: 130px; height: 130px; display: flex; align-items: center; justify-content: center; z-index: 10; background: rgba(13,17,23,0.95); border: 2px solid #00aaff; border-radius: 50%; box-shadow: 0 0 20px rgba(0,170,255,0.5); }
      .map-scope #radar-grid { position: absolute; display: grid; grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(5, 1fr); width: 120px; height: 120px; gap: 4px; z-index: 11; pointer-events:none; }
      .map-scope .cell { border-radius: 4px; transition: background 0.2s; }
      .map-scope .is-room { background: rgba(255,255,255,0.25); border: 1px solid rgba(255,255,255,0.05); }
      .map-scope .is-path { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.05); }
      .map-scope .is-current { border: 2px solid #00aaff; background: rgba(0,170,255,0.3); box-shadow: inset 0 0 10px #00aaff; z-index:3; }
      .map-scope #arrow { font-size: 30px; color: #00aaff; text-shadow: 0 0 8px #00aaff; line-height:1; }
      .map-scope #log { height: 180px; overflow-y: auto; background: rgba(0,0,0,0.4); border-radius: 15px; padding: 20px; margin-bottom: 25px; border: 1px solid #2d333b; line-height: 1.6; }
      .map-scope .controls { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
      .map-scope button { background: #21262d; color: white; border: 1px solid #30363d; padding: 15px 5px; border-radius: 12px; cursor: pointer; font-weight: bold; }
      .map-scope button:hover:not(:disabled) { border-color: #00aaff; background: #30363d; }
      .map-scope button:disabled { opacity: 0.1; }
      .map-scope .back-btn { grid-column: 2; border-style: dotted; color: #8b949e; }
      .map-scope .status-bar { display:flex; justify-content: space-between; font-size: 11px; color: #00aaff; letter-spacing: 1px; margin-bottom: 10px; font-weight: bold; }
      .map-scope .score-msg { color: #f8e3a1; font-weight: bold; }
      </style>

      <div class="map-scope">
        <div id="game-ui">
          <div id="time-status">
            🕐 TIME: <span id="time-display">0.00</span>s
          </div>
          <div id="navigation-core">
            <div id="radar-grid"></div>
            <div id="arrow-wrapper"><div id="arrow">▲</div></div>
          </div>
          <div class="status-bar">
            <div>AREA: <span id="map-name-display">---</span></div>
          </div>
          <div id="log"></div>
          <div class="controls">
            <div></div><button id="btn-0">前へ</button><div></div>
            <button id="btn-3">左へ</button>
            <button id="btn-2" class="back-btn">後を向く</button>
            <button id="btn-1">右へ</button>
          </div>
        </div>
      </div>
    `;

    this.$ = {
      grid: container.querySelector('#radar-grid'),
      arrowWrap: container.querySelector('#arrow-wrapper'),
      time: container.querySelector('#time-display'),
      log: container.querySelector('#log'),
      mapName: container.querySelector('#map-name-display'),
      btns: [0,1,2,3].map(i=>container.querySelector(`#btn-${i}`))
    };

	  // ★ レーダーサイズを設定から反映
	  const { w, h } = (Store?.settings?.radar || { w:5, h:5 });
	  this.radarW = Math.max(5, w|0); // 最小5
	  this.radarH = Math.max(5, h|0);

	  // 動的グリッド
	  this.$.grid.style.display = 'grid';
	  this.$.grid.style.gridTemplateColumns = `repeat(${this.radarW}, 1fr)`;
	  this.$.grid.style.gridTemplateRows    = `repeat(${this.radarH}, 1fr)`;
	  this.$.grid.style.gap = '4px';

    this.$.mapName.textContent = this.mapData.name;
    this.findStartPosition();
    this.setInitialFacing();

    this.startTime = performance.now();
    this.startTimer();

    this.$.btns[0].addEventListener('click', ()=> this.handleAction(0));
    this.$.btns[1].addEventListener('click', ()=> this.handleAction(1));
    this.$.btns[2].addEventListener('click', ()=> this.handleAction(2));
    this.$.btns[3].addEventListener('click', ()=> this.handleAction(3));

    this.addLog(`${this.mapData.name}の探索を開始。`);
    this.updateUI();
  }

  api(){
    return {
      setEnemyVisibility: (eventId, visible)=>{
        if(visible) this.hiddenEvents.delete(String(eventId));
        else this.hiddenEvents.add(String(eventId));
      },
      resumeFromState: (state)=>{
        if(!state) return;
        if(typeof state.steps === 'number') this.steps = state.steps;
        if(state.position && typeof state.position.x==='number' && typeof state.position.y==='number'){
          this.currentPos = {x: state.position.x, y: state.position.y};
        }
        if(typeof state.elapsedSeconds === 'number'){
          this.startTime = performance.now() - state.elapsedSeconds*1000;
          this.$.time.textContent = state.elapsedSeconds.toFixed(2);
        }
        this.updateUI();
      }
      };
    }

  getRawCell(x,y){
    const layout = this.mapData.layout;
    if (y<0 || y>=layout.length || x<0 || x>=layout[y].length) return '';
    return layout[y][x];
  }
  getEventId(ch){
    const val = (ch ?? '').trim();
    if (val==='' || val===' ' || val==='x' || val==='0' || val==='S' || val==='G') return val;
    const mapped = (this.mapData.mapping && this.mapData.mapping[val] !== undefined) ? this.mapData.mapping[val] : val;
    if (this.hiddenEvents.has(String(mapped))) return 'x';
    if (/^\d+$/.test(String(mapped))) return Number(mapped);
    return mapped;
  }

  async handleAction(relDir){
    if(this.isBusy || this.isGoal) return;
    this.isBusy = true;
    this.currentFacing = (this.currentFacing + relDir) % 4;
    if(relDir === 2){
      this.addLog('進路を反転。');
      await this.animateCompass(false);
    } else {
      await this.animateCompass(true);
      await this.startAutoMove();
    }
    this.isBusy = false;
    this.updateUI();
  }

  async animateCompass(isMoving){
    const wrapper = this.$.arrowWrap;
    const angle = this.currentFacing*90;
    wrapper.style.transition = 'transform 0.3s cubic-bezier(0.4,0,0.2,1)';
    wrapper.style.transform = `rotate(${angle}deg)`;
    await this.sleep(300);
    if(isMoving){
      wrapper.style.transition = 'transform 0.15s ease-out';
      wrapper.style.transform = `rotate(${angle}deg) translate(0px, -15px)`;
      await this.sleep(150);
      wrapper.style.transition = 'transform 0.3s ease-in-out';
      wrapper.style.transform = `rotate(${angle}deg) translate(0px, 0px)`;
      await this.sleep(150);
    }
  }

  // ★ 追加：絶対移動
  async moveAbsolute(dir /* 0~3: NESW */) {
    if (this.isBusy || this.isGoal) return;
    const v = this.VECTORS[dir % 4];
    const nx = this.currentPos.x + v.x, ny = this.currentPos.y + v.y;
    const cell = this.getRawCell(nx, ny);
    if (cell === '' || cell === ' ') return; // 壁

    this.isBusy = true;
    // 向きも合わせておくと違和感がない（任意）
    this.currentFacing = dir % 4;

    // 1マスだけ進む（オートムーブにせず、クリック操作の手応えを優先）
    this.currentPos = { x: nx, y: ny };
    this.steps += 1;
    this.emit('moved', { stepsDelta: 1, pos: { ...this.currentPos } });
    this.updateUI();

    // イベント判定
    const eventId = this.getEventId(cell);
    if (eventId !== 'x') this.processEvent(eventId);

    this.isBusy = false;
  }

  async startAutoMove(){
    const dir = this.VECTORS[this.currentFacing];
    while(true){
      const nx = this.currentPos.x + dir.x;
      const ny = this.currentPos.y + dir.y;
      const cellRaw = this.getRawCell(nx, ny);
      if(cellRaw !== '' && cellRaw !== ' '){
        this.currentPos = {x:nx, y:ny};
        this.steps += 1;
        this.emit('moved', { stepsDelta:1, pos:{...this.currentPos} });
        this.updateRadar();
        const eventId = this.getEventId(cellRaw);
        if(eventId !== 'x'){
          this.processEvent(eventId);
          break;
        }
        await this.sleep(100);
      } else break;
    }
  }

  processEvent(id){
    if(id === 'G'){
      this.isGoal = true;
      this.stopTimer();
      this.addLog("<span class='score-msg'>出口にたどり着いたようだ。</span>");
      this.emit('reachedGoal');
    } else if(id === 'S'){
      this.addLog('ここはスタート地点。');
    } else if(id === '0'){
      this.addLog('道が続いている。');
    } else {
      if(typeof id === 'number'){
        this.addLog(`開けた場所にたどり着いた。`);
        this.emit('enterEvent', {eventId:id});
      } else {
        this.addLog(`開けた場所にたどり着いた。`);
      }
    }
  }

	updateRadar() {
	  const grid = this.$.grid; grid.innerHTML = '';
	  const W = this.radarW || (Store?.settings?.radar?.w || 5);
	  const H = this.radarH || (Store?.settings?.radar?.h || 5);
	  for (let dy = -Math.floor((H-1)/2); dy <= Math.floor(H/2); dy++) {
	    for (let dx = -Math.floor((W-1)/2); dx <= Math.floor(W/2); dx++) {
	      const rawCell = this.getRawCell(this.currentPos.x + dx, this.currentPos.y + dy);
	      const cellDiv = document.createElement('div');
	      cellDiv.className = 'cell';
	      // ★ クリック移動（中心の上下左右のみ受け付け）
	      if (Store?.settings?.clickToMove) {
	        if (dx === 0 && dy === -1) cellDiv.onclick = () => this.moveAbsolute(0); // 北
	        if (dx === 1 && dy === 0)  cellDiv.onclick = () => this.moveAbsolute(1); // 東
	        if (dx === 0 && dy === 1)  cellDiv.onclick = () => this.moveAbsolute(2); // 南
	        if (dx === -1 && dy === 0) cellDiv.onclick = () => this.moveAbsolute(3); // 西
	        // カーソルヒント
	        if (cellDiv.onclick) cellDiv.style.cursor = 'pointer';
	      }
	      if (dx===0 && dy===0) cellDiv.classList.add('is-current');
	      else if (rawCell !== '' && rawCell !== ' ') {
	        const id = this.getEventId(rawCell);
	        cellDiv.classList.add(id === 'x' ? 'is-path' : 'is-room');
	      }
	      grid.appendChild(cellDiv);
	    }
	  }
	}

  updateUI(){
    this.updateRadar();
    this.$.arrowWrap.style.transform = `rotate(${this.currentFacing*90}deg)`;
    [0,1,2,3].forEach(relDir=>{
      const f = (this.currentFacing + relDir) % 4;
      const cell = this.getRawCell(this.currentPos.x + this.VECTORS[f].x, this.currentPos.y + this.VECTORS[f].y);
      this.$.btns[relDir].disabled = (this.isGoal || cell === '' || cell === ' ');
    });
  }

  addLog(msg){
    const log = this.$.log;
    log.innerHTML += `<div>&gt; ${msg}</div>`;
    log.scrollTop = log.scrollHeight;
  }

  startTimer(){
    this.stopTimer();
    this.timerInterval = setInterval(()=>{
      if(!this.isGoal){
        const elapsed = ((performance.now() - this.startTime)/1000).toFixed(2);
        this.$.time.textContent = elapsed;
      }
    }, 50);
  }
  stopTimer(){ if(this.timerInterval){ clearInterval(this.timerInterval); this.timerInterval=null; } }
  sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
  findStartPosition(){
    this.mapData.layout.forEach((row,y)=>{
      const x = row.indexOf('S');
      if(x !== -1) this.currentPos = {x,y};
    });
  }
  setInitialFacing(){
    const starts=[];
    this.VECTORS.forEach((v,i)=>{
      const cell = this.getRawCell(this.currentPos.x+v.x, this.currentPos.y+v.y);
      if(cell !== '' && cell !== ' ') starts.push(i);
    });
    if(starts.length===1) this.currentFacing=starts[0];
  }
}
/* ------------------------------
  バトル画面スタイル
------------------------------ */
const BATTLE_CSS_SCOPED = `.battle-scope{ 
      --bg: #0f172a; --panel: #1e293b; --gold: #fbbf24; 
      --green: #2ecc71; --red: #ef4444; --timer: #22d3ee;
      --correct: #4ade80; --wrong: #f87171;
    }.battle-scope *{ box-sizing: border-box; -webkit-tap-highlight-color: rgba(0,0,0,0.1); }.battle-scope{ font-family: 'Helvetica Neue', Arial, sans-serif; background: var(--bg); color: #fff; margin: 0; display: flex; justify-content: center; min-height: 100%; height: 100%; overflow: hidden; padding: 0; }.battle-scope /* 背景色の遷移を滑らかにする設定 */
    #game-screen{ 
      width: min(100vw, 456px); max-width: 456px; min-height: 100%; height: 100%;
      display: flex; flex-direction: column; position: relative; 
      background: #111; border: none;
      transition: background 1.0s ease;
      box-sizing: border-box;
      padding: 0;
    }
        @media (min-width: 481px) {
            #game-screen { border: 1px solid #333; }
        }.battle-scope .overlay{ position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 5000; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px; overflow-y: auto; }.battle-scope .modal-inner{ background: var(--panel); padding: 15px; border: 3px solid var(--gold); border-radius: 15px; width: 100%; max-width: 420px; max-height: 90vh; overflow-y: auto; }.battle-scope .btn{ cursor: pointer; border: none; border-radius: 8px; font-weight: bold; color: #000; width: 100%; padding: 14px; margin: 8px 0; font-size: 16px; transition: all 0.2s; touch-action: manipulation; user-select: none; min-height: 48px; }.battle-scope .btn:active{ transform: scale(0.95); opacity: 0.8; background: rgba(251, 191, 36, 0.8); }.battle-scope .btn-main{ background: var(--gold); color: #000; }.battle-scope /* セレクトボックスのスタイル */
        .select-style{
            width: 100%; padding: 12px; border-radius: 8px; background: #334155; color: white;
            border: 1px solid var(--gold); font-size: 16px; margin-bottom: 10px; appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat; background-position: right 10px center; background-size: 1em;
        }.battle-scope #enemy-field{ flex: 2.7; display: flex; flex-direction: row; justify-content: center; align-items: center; flex-wrap: wrap; gap: 3px; padding: 0 3px 3px; background: rgba(0,0,0,0.4); overflow: hidden; }.battle-scope .enemy-unit{ flex: 1; min-width: 70px; max-width: 110px; border: 2px solid #555; border-radius: 10px; padding: 6px; display: flex; flex-direction: column; align-items: center; background: var(--panel); cursor: pointer; position: relative; transition: 0.2s; min-height: 120px; touch-action: manipulation; }.battle-scope .enemy-unit:active{ transform: scale(0.97); background: rgba(30, 41, 59, 0.9); }.battle-scope .enemy-unit.target{ border-color: var(--gold); box-shadow: 0 0 15px var(--gold); transform: scale(1.05); z-index: 10; }.battle-scope .target-indicator{ display: none !important; }.battle-scope .bar-outer{ width: 100%; height: 18px; background: #000; border-radius: 7px; overflow: hidden; position: relative; border: 1px solid #444; margin: 4px 0; }.battle-scope .bar-inner{ height: 100%; position: absolute; left: 0; transition: width 0.3s; }.battle-scope .hp-text{ position: absolute; width: 100%; text-align: center; font-size: 12px; font-weight: bold; line-height: 14px; z-index: 10; color: #fff; text-shadow: 1px 1px 1px #000; }.battle-scope #p-panel{ flex: 0.7; padding: 3px; background: var(--panel); border-top: 2px solid #333; }.battle-scope #stats-grid{ display: grid; grid-template-columns: repeat(3, 1fr); font-size: 13px; gap: 3px; margin-top: 3px; color: #94a3b8; }.battle-scope #hand-row{ flex: 1.0; display: flex; justify-content: space-between; gap: 4px; padding: 10px 4px 8px; border-top: 2px solid #333; background: #0f172a; }.battle-scope .card-container{ flex: 1; display: flex; flex-direction: column; gap: 4px; }.battle-scope .card{ height: 50px; min-height: 50px; border: 2px solid #fff; border-radius: 3px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; touch-action: manipulation; }.battle-scope .card:active{ transform: scale(0.95); opacity: 0.9; }.battle-scope .card.locked{ opacity: 0.3; cursor: not-allowed; filter: grayscale(1); }.battle-scope .card.active{ border-color: var(--gold); box-shadow: 0 0 10px var(--gold); transform: scale(1.05); }.battle-scope .plus{ background: #991b1b; }.battle-scope .minus{ background: #1e3a8a; }.battle-scope .mul{ background: #5b21b6; }.battle-scope .div{ background: #065f46; }.battle-scope .nan{ background: #431407; }.battle-scope .discard-btn{ font-size: 8px; background: #450a0a; color: #f87171; border: 1px solid #991b1b; border-radius: 4px; padding: 2px 0; min-height: 14px; text-align: center; cursor: pointer; touch-action: manipulation; }.battle-scope .discard-btn:active{ background: #7f1d1d; transform: scale(1); }.battle-scope #keypad{ flex: 1.5; display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; padding: 3px 3px; background: #1e293b; margin-bottom: 8px; }.battle-scope .key{ background: #334155; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; cursor: pointer; border-bottom: 4px solid #0f172a; min-height: 35px; touch-action: manipulation; user-select: none; }.battle-scope .key:active{ background: #475569; transform: translateY(2px); border-bottom: 2px solid #0f172a; }.battle-scope #feedback{ position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); font-size: 22px; font-weight: bold; z-index: 100; pointer-events: none; opacity: 0; text-align: center; width: 90%; text-shadow: 2px 2px 4px #000; }.battle-scope .show{ opacity: 1 !important; transition: 0.2s; }@media (min-width: 900px){ .battle-scope #enemy-field{ flex: 2.7; } .battle-scope #p-panel{ flex: 0.7; } }`;

/* ------------------------------
  BattleEngine
------------------------------ */
class BattleEngine {
  constructor(){ this.handlers={}; this.tickInterval=null; this._pendingEnd = null; this._primaryEnemyName = '???';}
  on(n,h){ (this.handlers[n] ||= []).push(h); }
  emit(n,p){ (this.handlers[n]||[]).forEach(h=>h(p)); }

  mount(container){
    const effectStyles = `
      /* バトル画面全体のスケーリングとカード幅調整 */
      .battle-scope #game-screen {
        max-width: 480px;
        margin: 0 auto;
        width: 100vw;
        height: 100%;
        box-sizing: border-box;
        /* 画面幅が狭い場合は縮小 */
        transform-origin: top center;
        transform: scale(0.97);
      }
      @media (max-width: 520px) {
        .battle-scope #game-screen {
          max-width: 100vw;
          transform: scale(calc((100vw / 480) * 0.97));
          /* 480px基準で縮小 */
        }
      }
      .battle-scope #hand-row {
        flex: 1;
        min-height: 50px;
        max-height: 200px;
        align-items: flex-end;
        gap: 8px;
      }
      .battle-scope .card-container {
        min-width: 50px;
        max-width: 500px;
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .battle-scope .card {
        width: 100%;
        height: 1rem;
        min-height: 50px;
        max-width: 500px;
        border: 2px solid #fff;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: 0.2s;
        touch-action: manipulation;
      }
      @media (max-width: 600px) {
        .battle-scope #hand-row { min-height: 50px; max-height: 200px; gap: 4px; }
        .battle-scope .card-container { min-width: 70px; max-width: 500px; }
        .battle-scope .card { min-height: 50px; height: 50px; max-width: 500px; }
      }
      /* 問題・答え欄の強調とレイアウト調整 */
      .battle-scope #prob-txt {
        font-size: 2.2rem;
        color: #ffe066;
        font-weight: bold;
        margin-bottom: 0.5em;
        text-align: center;
        line-height: 1.2;
        letter-spacing: 0.02em;
      }
      .battle-scope #ans-display {
        font-size: 1.6rem;
        color: var(--gold);
        min-height: 1.8em;
        max-height: 2.6em;
        font-family: monospace;
        text-align: center;
        word-break: break-all;
        overflow: hidden;
        margin-bottom: 0.2em;
        line-height: 1.1;
      }
      .battle-scope #hand-row {
        flex: 1;
        min-height: 70px;
        max-height: 200px;
        overflow-y: visible;
        align-items: flex-end;
      }
      .battle-scope .card-container {
        min-width: 60px;
        max-width: 180px;
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .battle-scope .discard-btn {
        font-size: 0.6rem;
        min-height: 10px;
        padding: 0px 0;
        margin-top: 0px;
        width: 100%;
        box-sizing: border-box;
      }
      @media (max-width: 600px) {
        .battle-scope #prob-txt { font-size: 1.3rem; }
        .battle-scope #ans-display { font-size: 1.6rem; min-height: 1.8em; max-height: 2.6em; }
        .battle-scope #hand-row { min-height: 70px; max-height: 110px; }
        .battle-scope .card-container { min-width: 44px; max-width: 70px; }
        .battle-scope .discard-btn { font-size: 0.6rem; min-height: 8px; }
      }
      /* 破棄ボタンが隠れないように余白を調整 */
      .battle-scope #game-screen > div:nth-child(4) { margin-bottom: 0.2em; }
      .battle-scope #keypad { margin-bottom: 0.2em; }

      .battle-scope .effect { position: absolute; pointer-events: none; font-size: 60px; font-weight: bold; animation: effectFloat 1.5s ease-out forwards; z-index: 1000 !important; }
      .battle-scope .effect-small { font-size: 40px; }
      .battle-scope .effect-flame { color: #ff6b1a; text-shadow: 0 0 20px #ff6b1a, 0 0 40px #ff6b1a; }
      .battle-scope .effect-ice { color: #4dd9ff; text-shadow: 0 0 20px #4dd9ff, 0 0 40px #4dd9ff; }
      .battle-scope .effect-thunder { color: #ffd700; text-shadow: 0 0 20px #ffd700, 0 0 40px #ffd700; }
      .battle-scope .effect-wind { color: #2e8e38; text-shadow: 0 0 20px #2e8e38, 0 0 40px #2e8e38; }
      .battle-scope .effect-light { color: #fff; text-shadow: 0 0 20px #fbbf24, 0 0 40px #fbbf24; }
      @keyframes effectFloat { 
        0% { opacity: 1; transform: translateY(0) scale(1.2) rotate(0deg); } 
        50% { opacity: 1; transform: translateY(-40px) scale(1.5) rotate(180deg); } 
        100% { opacity: 0; transform: translateY(-100px) scale(0.3) rotate(360deg); } 
      }
      @keyframes damageShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
      @keyframes damageFlash { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(2) hue-rotate(-30deg); } }
      .battle-scope .enemy-unit.damaged { animation: damageShake 0.3s, damageFlash 0.5s; }
      .battle-scope .enemy-unit.defeated { opacity: 0.3; filter: grayscale(100%); pointer-events: none; transform: scale(0.9); transition: all 0.5s; }
      @keyframes defeatedFade { to { opacity: 0; transform: scale(0.5) rotate(180deg); } }
      .battle-scope .enemy-unit.defeated { animation: defeatedFade 1.5s ease-out forwards; }
    `;
      container.innerHTML = `
      <div class="battle-scope">
        <style>${BATTLE_CSS_SCOPED}${effectStyles}</style>
        <div id="game-screen">
          <div id="enemy-field"></div>
          <div id="p-panel">
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px;">
              <b id="p-floor-name">---</b>
              <b>STAGE: <span id="p-stage-count">1</span> / 10 (<span id="p-grade-name">-</span>)</b>
              <b style="color:#00aaff;">TIME: <span id="battle-timer">0.00</span>s</b>
            </div>
            <div class="bar-outer">
              <div id="p-hp-txt" class="hp-text">100 / 100</div>
              <div id="p-hp-bar" class="bar-inner" style="background:var(--green); width:100%;"></div>
            </div>
            <div id="stats-grid">
              <span>Lv:<b id="p-lv">1</b></span> <span>NEXT:<b id="p-next">50</b></span> <span>BP:<b id="p-bp">0</b></span>
              <span>ATK:<b id="p-atk">15</b></span> <span>DEF:<b id="p-def">5</b></span> <span>SPD:<b id="p-spd">5</b></span>
              <span>★合計:<b id="p-stars">0</b></span> <span>コンボ:<b id="p-combo">0</b></span> <span>ミス:<b id="p-miss-ui">0</b>/3</span>
            </div>
          </div>
          <div id="feedback"></div>
          <div style="flex:1.0; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(0,0,0,0.6); border-top: 1px solid #333;">
            <div id="prob-txt" style="color:#94a3b8; font-weight:bold; font-size:28px; margin-bottom:4px;">カードを選択してください</div>
            <div id="ans-display" style="font-size:32px; font-weight:bold; color:var(--gold); min-height:40px; font-family: monospace;"></div>
          </div>
          <div id="keypad">
            <div class="key">1</div><div class="key">2</div><div class="key">3</div>
            <div class="key">4</div><div class="key">5</div><div class="key">6</div>
            <div class="key">7</div><div class="key">8</div><div class="key">9</div>
            <div class="key" style="background:#991b1b">DEL</div><div class="key">0</div><div class="key" style="background:var(--green)">OK</div>
          </div>
          <div id="hand-row"></div>
        </div>
        <div id="lvup-modal" class="overlay" style="display:none;">
          <div class="modal-inner">
            <h2 style="color:var(--gold); text-align:center; margin-top:0;">LEVEL UP!</h2>
            <div style="text-align:center; font-size:18px; margin-bottom:15px;">BP: <b id="m-bp" style="color:var(--gold);">0</b></div>
            <div id="lvup-rows"></div>
            <button class="btn btn-main" id="lv-commit" style="margin-top:15px; font-size:18px;">能力を確定</button>
          </div>
        </div>
      </div>
    `;
    this._bind(container);
  }

  _bind(container){

    this.GRADES = typeof GRADES !== 'undefined' ? GRADES : {};
    this.STAGE_MASTER = typeof STAGE_MASTER !== 'undefined' ? STAGE_MASTER : [];

    this.p = { lv:1, exp:0, next:50, hp:100, mhp:100, atk:15, def:5, spd:5, bp:0, stars:0 };

    this.enemies = []; this.targetIdx=0; this.floorIdx=0; this.currentStage=1; this.currentGrade='初級';
    this.combo=0; this.lastOp=''; this.input=''; this.isPaused=true; this.missCount=0;
    // ★ 追加：特殊攻撃用のプロパティ
    this.opChainCount=0; // 同じoperatorの連続使用回数
    this.curProb={ a:null, rank:0, cardIdx:null, op:'', q:'' };
    this.baseStats={};

    const $ = (sel)=> container.querySelector(sel);
    this.dom = {
      battleScope: $('.battle-scope'),
      screen: $('#game-screen'),
      enemyField: $('#enemy-field'),
      pFloor: $('#p-floor-name'),
      pStage: $('#p-stage-count'),
      pGrade: $('#p-grade-name'),
      pHpBar: $('#p-hp-bar'),
      pHpTxt: $('#p-hp-txt'),
      stats: { lv: $('#p-lv'), next: $('#p-next'), bp: $('#p-bp'), atk: $('#p-atk'), def: $('#p-def'), spd: $('#p-spd'), stars: $('#p-stars'), combo: $('#p-combo'), miss: $('#p-miss-ui') },
      probTxt: $('#prob-txt'),
      ansDisp: $('#ans-display'),
      keypad: $('#keypad'),
      handRow: $('#hand-row'),
      lvModal: $('#lvup-modal'),
      lvRows: $('#lvup-rows'),
      lvCommit: $('#lv-commit'),
      mBp: $('#m-bp'),
      feedback: $('#feedback'),
      battleTimer: $('#battle-timer')
    };

    // 敵フィールドを相対配置にして、エフェクトの絶対配置表示に対応
    if (this.dom.enemyField) this.dom.enemyField.style.position = 'relative';

    Array.from(this.dom.keypad.querySelectorAll('.key')).forEach(el=>{
      const label = el.textContent.trim();
      if(label === 'DEL') el.addEventListener('click', ()=> this.del());
      else if(label === 'OK') el.addEventListener('click', ()=> this.ok());
      else el.addEventListener('click', ()=> this.tap(label));
    });
    this.dom.lvCommit.addEventListener('click', ()=> this.closeLvUp());

    this._resolveStat = resolveStat;
    this.renderHand();
    this.updateUI();
  }

  startBattle({ player, floorIdx, stageId, grade, overrideEnemies }){
    this.currentGrade = grade || '初級';
    this.floorIdx = Math.max(0, Math.min(floorIdx ?? 0, this.STAGE_MASTER.length-1));
    this.currentStage = Math.max(1, Math.min(stageId ?? 1, 10));
    this.overrideEnemies = Array.isArray(overrideEnemies) ? overrideEnemies : null;
    if(player){
      this.p.lv = player.level ?? this.p.lv;
      this.p.atk = player.stats?.atk ?? this.p.atk;
      this.p.def = player.stats?.def ?? this.p.def;
      this.p.spd = player.stats?.spd ?? this.p.spd;
      this.p.mhp = player.stats?.hp ?? this.p.mhp;
      this.p.hp = this.p.mhp;
      this.p.exp = player.exp ?? this.p.exp;
      // ★ 次のレベルアップまでのEXPを計算
      this.p.next = CONFIG.levelUpExpFormula(this.p.lv);
    }
    this.isPaused = false;
    this.battleInit();
    
    // ★ 先頭敵名を保持（描画前でも取れるように）
    const floorData = this.STAGE_MASTER[floorIdx] || this.STAGE_MASTER[0];
    const stageData = (floorData.stages || []).find(s => s.id === this.currentStage) || floorData.stages?.[0] || {};
    const enemiesForName = this.overrideEnemies || stageData.enemies || [];
    this._primaryEnemyName = enemiesForName[0]?.name || '???';

    if (!this.tickInterval) this.tickInterval = setInterval(() => this.tick(), 100);
  }

  // ★ 取得API
  getPrimaryEnemyName() {
    return this._primaryEnemyName || '???';
  }

  // --- battle logic (same behavior as original) ---
  generateCardData(){
    const gData = this.GRADES[this.currentGrade];
    let r=Math.random(), cumulative=0, op=gData.ops[0];
    for(let i=0;i<gData.ops.length;i++){ cumulative += (gData.ratios[i]||0); if(r<=cumulative){ op=gData.ops[i]; break; } }
    const rankRatios=[0.40,0.30,0.15,0.10,0.05];
    let rr=Math.random(), rc=0, rank=1;
    for(let i=0;i<rankRatios.length;i++){ rc+=rankRatios[i]; if(rr<=rc){ rank=i+1; break; } }
    const probFunc = (gData.logic[op] && gData.logic[op][rank]) ? gData.logic[op][rank] : gData.logic[op][1];
    const prob = probFunc();
    return { op, rank, q: prob.q, a: prob.a };
  }
  createCardUI(data, idx){
    const cls = data.op==='+'?'plus':data.op==='-'?'minus':data.op==='×'?'mul':data.op==='÷'?'div':'nan';
    const card = document.createElement('div');
    card.className = `card ${cls}`;
    card.id = `card-obj-${idx}`;
    card.innerHTML = `<span style="color:var(--gold);font-size:10px">${'★'.repeat(data.rank)}</span><b style="font-size:24px">${data.op}</b>`;
    card.onclick = ()=> this.selectCard(data, idx);
    return card;
  }
  renderHand(){
    const r = this.dom.handRow; r.innerHTML='';
    for(let i=0;i<5;i++){
      const cont = document.createElement('div'); cont.className='card-container'; cont.id=`card-cont-${i}`;
      const data = this.generateCardData();
      cont.appendChild(this.createCardUI(data, i));
      const dBtn = document.createElement('div'); dBtn.className='discard-btn'; dBtn.innerText='破棄';
      dBtn.onclick = (e)=>{ e.stopPropagation(); this.discardCard(i); };
      cont.appendChild(dBtn);
      r.appendChild(cont);
    }
  }
  selectCard(data, idx){
    if(this.curProb.cardIdx !== null && this.curProb.cardIdx !== idx) return;
    this.curProb = { ...data, cardIdx: idx };
    this.input='';
    this.dom.ansDisp.innerText='';
    this.dom.probTxt.innerText = data.q + ' = ?';
    this.dom.handRow.querySelectorAll('.card').forEach((c,i)=>{
      c.classList.remove('active','locked');
      if(i===idx) c.classList.add('active'); else c.classList.add('locked');
    });
  }
  discardCard(idx){
    const penalty = Math.max(5, Math.floor(this.p.atk*0.5));
    this.p.hp = Math.max(1, this.p.hp - penalty);
    this.showFeed(`破棄ダメージ: ${penalty}`, 'var(--red)');
    const cont = this.dom.handRow.querySelector(`#card-cont-${idx}`);
    const newData = this.generateCardData();
    cont.replaceChild(this.createCardUI(newData, idx), this.dom.handRow.querySelector(`#card-obj-${idx}`));
    // ★ カード破棄時もコンボをリセット
    this.combo = 0;
    this.opChainCount = 0;
    if(this.curProb.cardIdx === idx) this.resetTurn();
    this.updateUI();
  }
  tap(n){ if(this.curProb.cardIdx!==null){ this.input += String(n); this.dom.ansDisp.innerText = this.input; } }
  del(){ this.input = this.input.slice(0,-1); this.dom.ansDisp.innerText = this.input; }
  ok(){
    if(this.curProb.a === null || this.input === '') return;
    if(parseInt(this.input) === this.curProb.a){
      // ★ コンボ計算と特殊攻撃カウント（lastOp更新前に処理）
      if(this.curProb.op === this.lastOp) {
        this.combo++;
        this.opChainCount++;
      } else {
        this.combo = 1;
        this.opChainCount = 1;
      }
      this.lastOp = this.curProb.op;
      
      if(this.enemies[this.targetIdx].cur<=0) {
        this.targetIdx = this.enemies.findIndex(e=>e.cur>0);
      }
      if (this.targetIdx === -1) this.handleVictory();
      else {
        // ★ calculateDamage()を使用してダメージ計算
        const damageInfo = calculateDamage(
          { atk: this.p.atk, spd: this.p.spd },
          this.curProb,
          this.enemies[this.targetIdx],
          this.combo,
          this.p.stars,
          CONFIG
        );
        
        // ★ 特殊攻撃: 同じoperatorが4回連続で5回目のダメージを2倍
        let finalDmg = damageInfo.damage;
        if (this.opChainCount >= 5) {
          finalDmg *= CONFIG.damageCalc.paralysisChainDamageMultiplier || 2;
          this.showFeed(`⚡ 連続攻撃！ダメージ${CONFIG.damageCalc.paralysisChainDamageMultiplier}倍！`, 'var(--gold)');
          this.opChainCount = 0; // リセット
        }
        
        this.enemies[this.targetIdx].cur -= finalDmg;
        this.p.stars += this.curProb.rank;
        
        // ★ 必殺技を使用した場合、★を消費
        if (damageInfo.isUltimate) {
          this.p.stars -= damageInfo.starConsumed;
          this.showFeed(`⚡⚡ 必殺技 ${CONFIG.damageCalc.ultimateMultiplier}倍！`, 'var(--gold)');
        }
        
        this.showFeed(`${this.enemies[this.targetIdx].name}に ${finalDmg}ダメージ！+${this.curProb.rank}★`, 'var(--correct)');
        
        // ★ ダメージエフェクトを表示
        this.showDamageEffect(this.enemies[this.targetIdx], this.curProb.op, this.curProb.rank);
        
        // ★ 麻痺判定（連続麻痺で時間短縮）
        if (damageInfo.paralysisInfo && damageInfo.paralysisInfo.isParalyzed) {
          const paralysisChainCount = this.enemies[this.targetIdx].paralysisChainCount || 0;
          const paralysisDuration = Math.max(0, 5 - paralysisChainCount);
          
          // 麻痺時間が0になったら麻痺しない
          if (paralysisDuration > 0) {
            this.enemies[this.targetIdx].paralyzed = true;
            this.enemies[this.targetIdx].paralysisTimer = paralysisDuration;
            this.enemies[this.targetIdx].paralysisChainCount += 1;
            this.showFeed(`${this.enemies[this.targetIdx].name}は麻痺した！(${paralysisDuration}秒)`, 'var(--gold)');
          }
        }
        
        if(this.enemies[this.targetIdx].cur <= 0){
          const enemy = this.enemies[this.targetIdx];
          enemy.cur = 0;
          enemy.defeated = true; // ★ 倒れた状態をマーク
          Store.totalKills += 1;
          
          // ★ エフェクトが見えるように1.5秒後に非表示処理
          setTimeout(() => {
            enemy.defeatedAndHidden = true;
            const alive = this.enemies.findIndex(e=>e.cur>0 && !e.defeated);
            if(alive === -1) this.handleVictory(); else this.targetIdx = alive;
            this.renderEnemies();
          }, 1500);
        }
      }
      const idx = this.curProb.cardIdx;
      const cont = this.dom.handRow.querySelector(`#card-cont-${idx}`);
      cont.replaceChild(this.createCardUI(this.generateCardData(), idx), this.dom.handRow.querySelector(`#card-obj-${idx}`));
      this.resetTurn();
    } else {
      this.missCount++;
      // ★ ミスするとコンボがリセット
      this.combo = 0;
      this.opChainCount = 0;
      this.showFeed(`MISS! (残り:${3-this.missCount})`, 'var(--wrong)');
      if(this.missCount >= 3){
        const penalty = Math.max(5, Math.floor(this.p.atk*0.5));
        this.p.hp = Math.max(1, this.p.hp - penalty);
        this.showFeed(`3ミス！正解は ${this.curProb.a}<br>ペナルティ: ${penalty}`, 'var(--red)');
        this.resetTurn();
      }
    }
    this.updateUI();
    this.renderEnemies();
  }
  resetTurn(){
    this.input=''; this.missCount=0; this.curProb.a=null; this.curProb.cardIdx=null;
    this.dom.probTxt.innerText='カードを選択してください';
    this.dom.ansDisp.innerText='';
    this.dom.handRow.querySelectorAll('.card').forEach(c=>c.classList.remove('active','locked'));
  }
	handleVictory() {
	  const totalExp = this.enemies.reduce((s,e)=>s+(e.exp||0),0);
	  const rewards = { exp: totalExp };

	  // ★ 勝利時にタイマーを停止
	  stopRunTimer();

	  // 現在のレベルやBPを基準に、勝利→EXP加算→必要ならLV UPを開く
	  this.gainExp(totalExp);

	  // ★変更点：
	  // レベルアップでBPが発生してモーダルが開いている間は end を保留し、閉じたら emit します。
	  // openLvUp() 内では isPaused=true, モーダル表示中
	  if (this.p.bp > 0 && this.dom.lvModal && this.dom.lvModal.style.display !== 'none') {
	    // LV UPモーダルが開いているケース → end を保留
	    this._pendingEnd = { result: 'win', rewards };
	  } else {
	    // LV UPなし（または即時に必要BP0でモーダルなし） → 従来通り
	    this.emit('end', { result:'win', rewards });
	  }

	  // 戦闘ロジックの進行は止めておく
	  this.isPaused = true;
	}
  gainExp(amt){
    this.p.exp += amt;
    while(this.p.exp >= this.p.next){
      this.p.lv++; this.p.bp += 5; this.p.exp -= this.p.next;
      // ★ 変更：EXP計算を level × 50 に変更
      this.p.next = CONFIG.levelUpExpFormula(this.p.lv);
      this.p.hp = this.p.mhp;
      this.openLvUp();
    }
  }
  openLvUp(){
    this.isPaused = true;
    this.baseStats = { mhp:this.p.mhp, atk:this.p.atk, def:this.p.def, spd:this.p.spd };
    const rows = this.dom.lvRows; rows.innerHTML='';
    
    // ★ 変更：Grade に応じてステータスアップ数を変更
    const gradeConfig = CONFIG.statusUpByGrade[this.currentGrade] || { hp: 20, atk: 2, def: 2, spd: 1 };
    const stats = [
      {k:'hp',n:`HP(+${gradeConfig.hp})`,inc:gradeConfig.hp},
      {k:'atk',n:`ATK(+${gradeConfig.atk})`,inc:gradeConfig.atk},
      {k:'def',n:`DEF(+${gradeConfig.def})`,inc:gradeConfig.def},
      {k:'spd',n:`SPD(+${gradeConfig.spd})`,inc:gradeConfig.spd}
    ];
    
    stats.forEach(s=>{
      const div = document.createElement('div');
      div.style = 'display:flex; justify-content:space-between; margin:10px 0; align-items:center; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 8px;';
      div.innerHTML = `<span style="font-size:14px;">${s.n}</span><div style="display:flex; gap:12px; align-items:center;">
        <button class="btn" style="width:50px; height:50px; padding:0; font-size:24px; background:#ef4444;" data-dec="${s.k}" data-inc="${s.inc}">-</button>
        <b id="lv-${s.k}" style="font-size:18px; min-width:40px; text-align:center;">${s.k==='hp'?this.p.mhp:this.p[s.k]}</b>
        <button class="btn" style="width:50px; height:50px; padding:0; font-size:24px; background:#10b981;" data-add="${s.k}" data-inc="${s.inc}">+</button>
      </div>`;
      rows.appendChild(div);
    });
    this.dom.mBp.innerText = this.p.bp;
    rows.querySelectorAll('[data-add]').forEach(btn=>btn.onclick=()=>this.adjBP(btn.dataset.add, +1, parseInt(btn.dataset.inc)));
    rows.querySelectorAll('[data-dec]').forEach(btn=>btn.onclick=()=>this.adjBP(btn.dataset.dec, -1, parseInt(btn.dataset.inc)));
    this.dom.lvModal.style.display='flex';
  }
  
  adjBP(k,d,inc){
    if(d>0 && this.p.bp>0){
      this.p.bp--; if(k==='hp'){ this.p.mhp += inc; this.p.hp += inc; } else this.p[k] += inc;
    } else if(d<0){
      const min = k==='hp' ? this.baseStats.mhp : this.baseStats[k];
      if((k==='hp'?this.p.mhp:this.p[k]) > min){
        this.p.bp++; if(k==='hp'){ this.p.mhp -= inc; this.p.hp -= inc; } else this.p[k] -= inc;
      }
    }
    this.dom.lvRows.querySelector(`#lv-${k}`).innerText = (k==='hp'?this.p.mhp:this.p[k]);
    this.dom.mBp.innerText = this.p.bp;
  }

closeLvUp() {
  // BPが余っている場合はクローズ不可のまま
  if (this.p.bp > 0) {
    alert('BPを使い切ってください');
    return;
  }

  // モーダルを閉じる
  this.dom.lvModal.style.display='none';

  // ★追加：保留していた end をここで emit
  if (this._pendingEnd) {

	Store.player.level = this.p.lv;
	Store.player.stats.atk = this.p.atk;
	Store.player.stats.def = this.p.def;
	Store.player.stats.spd = this.p.spd;
	Store.player.stats.hp = this.p.mhp;
	Store.player.exp = this.p.exp;

    const payload = this._pendingEnd;
    this._pendingEnd = null;
    this.emit('end', payload);
    return; // ここで BattleScreen 側が /map に戻す
  }

  // end の保留が無い（= レベルアップが発生していなかった）場合だけ戦闘続行に戻す
  this.isPaused = false;
}

  tick(){
    if(this.isPaused || this.p.hp<=0) return;
    // ★ 戦闘中のタイマー表示を更新
    if(this.dom.battleTimer && Store.timerStartAt){
      const elapsed = Store.elapsedSeconds + (Date.now()-Store.timerStartAt)/1000;
      this.dom.battleTimer.textContent = elapsed.toFixed(2);
    }
    this.enemies.forEach((e,i)=>{
      // ★ 麻痺している敵のタイマーを更新
      if (e.paralyzed) {
        e.paralysisTimer -= 0.1;
        if (e.paralysisTimer <= 0) {
          e.paralyzed = false;
          this.showFeed(`${e.name}は麻痺から回復した！`, 'var(--gold)');
        }
        return; // 麻痺している敵は攻撃しない
      }
      
      if(e.cur>0){
        e.t -= 0.1;
        if(e.t<=0){
          const dmg = Math.max(1, e.atk - this.p.def);
          this.p.hp -= dmg; e.t = e.spd;
          // ★ 敵が攻撃したタイミングで麻痺チェーンカウントをリセット
          e.paralysisChainCount = 0;
          this.showFeed(`被弾！ ${dmg}ダメージ`, 'var(--red)');
          this.updateUI();
          if(this.p.hp<=0){
            alert('敗北...');
            this.emit('end', { result:'lose', rewards:{ exp: 0 } });
            this.isPaused = true;
          }
        }
        const bar = this.dom.enemyField.querySelector(`#en-t-b-${i}`);
        if(bar) bar.style.width = (Math.max(0,e.t)/e.spd*100) + '%';
      }
    });
  }
  updateUI(){
    this.dom.pHpBar.style.width = (this.p.hp/this.p.mhp*100) + '%';
    this.dom.pHpTxt.textContent = `${Math.max(0, Math.ceil(this.p.hp))} / ${this.p.mhp}`;
    this.dom.stats.lv.textContent = this.p.lv;
    this.dom.stats.stars.textContent = this.p.stars;
    this.dom.stats.combo.textContent = this.combo;
    this.dom.stats.miss.textContent = this.missCount;
    this.dom.pStage.textContent = this.currentStage;
    this.dom.pGrade.textContent = this.currentGrade;
    this.dom.stats.atk.textContent = this.p.atk;
    this.dom.stats.def.textContent = this.p.def;
    this.dom.stats.spd.textContent = this.p.spd;
    this.dom.stats.next.textContent = this.p.next;
    this.dom.stats.bp.textContent = this.p.bp;
  }
  renderEnemies(){
    const f = this.dom.enemyField; f.innerHTML='';
    this.enemies.forEach((e,i)=>{
      if(e.cur<=0 && e.defeatedAndHidden) return; // ★ 完全に倒れて非表示の敵はスキップ
      const div = document.createElement('div');
      div.id = `enemy-unit-${i}`;
      // ★ 倒れた敵は視覚的に薄く表示
      const defeatedClass = e.defeated ? ' defeated' : '';
      div.className = `enemy-unit ${i===this.targetIdx?'target':''}${defeatedClass}`;
      div.onclick = ()=>{ if(e.cur>0 && !e.defeated){ this.targetIdx=i; this.renderEnemies(); } };
      const timerPercent = (Math.max(0,e.t)/e.spd)*100;
      // ★ 麻痺状態の敵は視覚的に表示
      const paralysisLabel = e.paralyzed ? '<div style="color:var(--gold); font-size:8px; font-weight:bold;">⚡麻痺中</div>' : '';
      div.innerHTML = `
        <div class="target-indicator">▼ TARGET</div>
        <div style="font-size:10px; font-weight:bold;">${e.name}</div>
        ${paralysisLabel}
        <div style="font-size:32px; margin:5px 0;">${e.sprite}</div>
        <div class="bar-outer">
          <div class="hp-text">${Math.floor(e.cur)} / ${e.hp}</div>
          <div class="bar-inner" style="background:var(--red); width:${(e.cur/e.hp*100)}%;"></div>
        </div>
        <div class="bar-outer" style="height:6px"><div id="en-t-b-${i}" class="bar-inner" style="background:var(--timer); width:${timerPercent}%"></div></div>
      `;
      f.appendChild(div);
    });
  }
  battleInit(){
    const floorData = this.STAGE_MASTER[this.floorIdx] || this.STAGE_MASTER[0];
    this.dom.screen.style.background = floorData.bg || '#111';
    this.dom.pFloor.textContent = floorData.floor || '';
    const stageData = (floorData.stages||[]).find(s=>s.id===this.currentStage) || (floorData.stages||[])[0];
    const enemiesSource = this.overrideEnemies || stageData.enemies || [];
    const resolveStat = this._resolveStat;
    this.enemies = enemiesSource.map(en => ({
      ...en,
      hp: resolveStat(en.hp),
      cur: 0,
      atk: resolveStat(en.atk),
      def: resolveStat(en.def),
      spd: resolveStat(en.spd),
      exp: resolveStat(en.exp),
      paralyzed: false,
      paralysisTimer: 0,
      paralysisChainCount: 0
    }));
    this.enemies.forEach(e=>{ e.cur=e.hp; e.t=e.spd; });
    this.targetIdx=0;
    this.renderEnemies();
    this.renderHand();
    this.updateUI();
  }
  showFeed(t,c){
    const f=this.dom.feedback;
    f.innerHTML=t; f.style.color=c;
    f.classList.add('show');
    setTimeout(()=>f.classList.remove('show'), 1200);
  }

  showDamageEffect(enemy, op, rank) {
    // エフェクトのシンボルとクラスを決定
    const effectMap = {
      '+': { symbol: '🔥', class: 'effect-flame' },
      '-': { symbol: '❄️', class: 'effect-ice' },
      '×': { symbol: '⚡', class: 'effect-thunder' },
      '÷': { symbol: '💨', class: 'effect-wind' }
    };
    const effect = effectMap[op] || { symbol: '✨', class: 'effect-light' };

    // レベルに応じた表示回数と大きさを決定
    let effectConfigs = [];
    if (rank === 1) {
      effectConfigs = [{ size: 'small', delay: 0 }];
    } else if (rank === 2) {
      effectConfigs = [{ size: 'small', delay: 0 }, { size: 'small', delay: 0.2 }];
    } else if (rank === 3) {
      effectConfigs = [{ size: 'large', delay: 0 }];
    } else if (rank === 4) {
      effectConfigs = [{ size: 'large', delay: 0 }, { size: 'large', delay: 0.2 }];
    } else if (rank >= 5) {
      // ランク5以上：ランダムに小×大を5回
      for (let i = 0; i < 5; i++) {
        const isSmall = Math.random() < 0.5;
        effectConfigs.push({ size: isSmall ? 'small' : 'large', delay: i * 0.2 });
      }
    }

    // エフェクトを表示
    const enemyIdx = this.enemies.indexOf(enemy);
    const enemyField = this.dom.enemyField;
    
    // ★ 重要：エフェクトの親コンテナをbattle-scopeにする（enemyFieldのinnerHTMLで消えないように）
    const battleScope = this.dom.battleScope;
    
    if (!enemyField || !battleScope) return;
    
    const enemyEl = enemyField.querySelector(`#enemy-unit-${enemyIdx}`);
    
    if (!enemyEl) return;
    
    // 敵ユニットに被ダメージエフェクトを追加
    enemyEl.classList.add('damaged');
    setTimeout(() => {
      const currentEnemyEl = enemyField.querySelector(`#enemy-unit-${enemyIdx}`);
      if (currentEnemyEl) currentEnemyEl.classList.remove('damaged');
    }, 500);
    
    effectConfigs.forEach((config, idx) => {
      setTimeout(() => {
        // 毎回敵要素を再取得（renderEnemiesで再描画される可能性があるため）
        const currentEnemyEl = enemyField.querySelector(`#enemy-unit-${enemyIdx}`);
        if (!currentEnemyEl) return;
        
        const effectEl = document.createElement('div');
        effectEl.className = `effect ${config.size === 'small' ? 'effect-small' : ''} ${effect.class}`;
        effectEl.textContent = effect.symbol;
        effectEl.style.position = 'fixed'; // ★ fixedに変更してビューポート基準で配置
        effectEl.style.zIndex = '1000';
        effectEl.style.pointerEvents = 'none';
        
        // 敵アイコン（sprite）の画面上での中心位置を計算
        const rect = currentEnemyEl.getBoundingClientRect();
        
        // 敵ユニット内のアイコン部分（おおよそ中央）に配置
        // エフェクトのサイズを考慮して中心に配置
        const effectSize = config.size === 'small' ? 40 : 60;
        const centerX = rect.left + rect.width / 2 - effectSize / 2;
        const centerY = rect.top + rect.height / 2 - effectSize / 2;
        
        // ランダムな微調整でエフェクトに動きを出す
        const randomOffset = () => (Math.random() - 0.5) * 20;
        
        const finalX = centerX + randomOffset();
        const finalY = centerY + randomOffset();
        
        effectEl.style.left = finalX + 'px';
        effectEl.style.top = finalY + 'px';
        
        // ★ battle-scopeに追加（enemyFieldではなく）
        battleScope.appendChild(effectEl);
        
        // アニメーション終了後にDOM削除
        setTimeout(() => effectEl.remove(), 1500);
      }, config.delay * 1000);
    });
  }
}

/* ------------------------------
   画面：タイトル
------------------------------ */
function TitleScreen(){}
TitleScreen.title = '算術の塔 v1.2.17';
TitleScreen.render = () => {
  const saves = SaveSystem.list();
  const diffBtns = CONFIG.difficulties.map(d=>`<button class="button" data-diff="${d.id}">${d.label}</button>`).join('');
  const currentMode = normalizeMode(Store.mode || DEFAULTS.run.mode);
  const modeBtns = `
    <button class="button mode-btn${currentMode==='quest' ? ' is-selected' : ''}" data-mode="quest" aria-pressed="${currentMode==='quest'}">クエスト</button>
    <button class="button mode-btn${currentMode==='arena' ? ' is-selected' : ''}" data-mode="arena" aria-pressed="${currentMode==='arena'}">闘技場</button>
  `;
  const saveList = saves.length ? `
    <table class="table"><thead><tr><th>スロット</th><th>モード</th><th>難易度</th><th>フロア</th><th>経過秒</th><th>更新</th><th></th></tr></thead><tbody>
      ${saves.map((s,i)=>`<tr><td>${i+1}</td><td>${modeLabel(s.mode)}</td><td>${s.difficulty}</td><td>${(s.floorIndex??0)+1}</td><td>${s.elapsedSeconds}</td><td>${new Date(s.ts).toLocaleString()}</td><td><button class="button" data-continue="${i}">続きから</button></td></tr>`).join('')}
    </tbody></table>` : `<p class="small">セーブデータはありません</p>`;

  return `
    <section class="panel">
      <h2>ゲームスタート</h2>
      <div class="panel"><h3>ゲームモード</h3><div class="flex">${modeBtns}</div></div>
      <div class="grid grid-2">
        <div class="panel"><h3>難易度選択</h3><div class="flex">${diffBtns}</div></div>
        <div class="panel"><h3>コンティニュー</h3>${saveList}</div>
      </div>
      <div class="panel" style="margin-top:1rem">
        <h3>セーブ/ロード</h3>
        <div class="flex">
          <button class="button" id="btn-save-local">ローカル保存</button>
          <button class="button" id="btn-export-json">JSON出力</button>
          <button class="button" id="btn-import-json">JSON読込</button>
          <input type="file" id="input-import-json" accept="application/json" style="display:none" />
        </div>
        <p class="small">JSON出力は他端末への移行用データです。</p>
      </div>
      <p class="small">※ マップは maps.js の MAPS 配列に複数登録できます。</p>
    </section>`;
};
TitleScreen.afterRender = () => {
  let selectedMode = Store.mode || DEFAULTS.run.mode;
  const syncModeButtons = () => {
    document.querySelectorAll('[data-mode]').forEach(btn=>{
      const isActive = normalizeMode(btn.getAttribute('data-mode')) === normalizeMode(selectedMode);
      btn.classList.toggle('is-selected', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  };
  document.querySelectorAll('[data-mode]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      selectedMode = normalizeMode(btn.getAttribute('data-mode'));
      Store.mode = selectedMode;
      syncModeButtons();
    });
  });
  syncModeButtons();
  document.querySelectorAll('[data-diff]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-diff');
      Store.difficulty = CONFIG.difficulties.find(d=>d.id===id) || CONFIG.difficulties[1];
      Store.floorIndex = 0;
      Store.totalKills = 0;
      Store.floorStates = {};
      Store.deaths = DEFAULTS.run.deaths;
      Store.floorDeaths = DEFAULTS.run.floorDeaths;
      Store.lastResultStamp = null;
      Store.player = cloneDefault(DEFAULTS.player);
      Store.settings = cloneDefault(DEFAULTS.settings);
      Store.mode = normalizeMode(selectedMode);
      Store.arenaIndex = DEFAULTS.run.arenaIndex;
      Store.pendingEnemyIndex = null;
      if(Store.mode === 'arena'){
        const item = setArenaEnemy(0);
        if(!item){
          alert('闘技場データがありません');
          return;
        }
      }
      ensureFloorState(0);
      resetRunTimer(); startRunTimer();
      autosave({reason:'new'});
      location.hash = Store.mode === 'arena' ? '/battle' : '/map';
    });
  });
  document.querySelectorAll('[data-continue]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = Number(btn.getAttribute('data-continue'));
      const s = SaveSystem.list()[idx];
      if(!s) return;
      applySaveData(s);
      if(normalizeMode(Store.mode) === 'arena'){
        const item = getArenaEnemyAt(Store.arenaIndex) || setArenaEnemy(Store.arenaIndex);
        if(!item){
          location.hash = '/result';
          return;
        }
        location.hash = '/battle';
        return;
      }
      location.hash = '/map';
    });
  });

  const saveLocalBtn = document.getElementById('btn-save-local');
  const exportBtn = document.getElementById('btn-export-json');
  const importBtn = document.getElementById('btn-import-json');
  const importInput = document.getElementById('input-import-json');
  const hasSaveManager = typeof window !== 'undefined' && window.SaveManager;

  saveLocalBtn?.addEventListener('click', ()=>{
    SaveSystem.append(buildSaveData({reason:'manual'}));
  });

  if (!hasSaveManager) {
    if(exportBtn) exportBtn.disabled = true;
    if(importBtn) importBtn.disabled = true;
  }

  exportBtn?.addEventListener('click', ()=>{
    if(!hasSaveManager) return;
    const data = buildSaveData({reason:'manual-export'});
    window.SaveManager.downloadJson(data, `arithmetic_tower_save_${Date.now()}.json`);
  });

  importBtn?.addEventListener('click', ()=>{
    if(!hasSaveManager) return;
    importInput?.click();
  });

  importInput?.addEventListener('change', async ()=>{
    if(!hasSaveManager) return;
    const file = importInput.files?.[0];
    if(!file) return;
    try{
      const data = await window.SaveManager.readJsonFile(file);
      applySaveData(data);
      location.hash = '/map';
    } catch (err){
      alert('JSON読み込みに失敗しました');
    } finally {
      importInput.value = '';
    }
  });
};

/* ------------------------------
   画面：マップ
------------------------------ */
function MapScreen(){}
MapScreen.title = 'マップ';
MapScreen.render = () => {
  if(normalizeMode(Store.mode) === 'arena'){
    return `
      <section class="panel">
        <h2>闘技場を準備中...</h2>
        <p class="small">読み込み後にバトルへ移動します。</p>
      </section>
    `;
  }
  const mapData = getMapData(Store.floorIndex);
  return `
    <section class="panel">
      <div class="flex">
        <h2>フロア ${Store.floorIndex+1}: ${mapData?.name || '---'}</h2>
        <span class="badge">難易度: ${currentDifficulty().label}</span>
        <span class="badge">モード: ${modeLabel(Store.mode)}</span>
        <span class="badge">経過: ${elapsedNow()} 秒</span>
        <span class="badge">撃破: ${Store.totalKills}</span>
        <span class="right small">Lv ${Store.player.level} / EXP ${Store.player.exp}</span>
      </div>
      <div id="map-root"></div>
      
	<!-- MapScreen.render に簡易セレクトを追加 -->
	<select id="radar-size">
	  <option value="3x3">3×3</option>
	  <option value="5x5">5×5</option>
	  <option value="5x3">5×3</option>
	</select>

	<div class="right">
	  <select id="ctl-mode">
	    <option value="relative" ${Store.settings.controlMode==='relative'?'selected':''}>相対</option>
	    <option value="absolute" ${Store.settings.controlMode==='absolute'?'selected':''}>方位</option>
	  </select>
	  <label class="small"><input type="checkbox" id="click-move" ${Store.settings.clickToMove?'checked':''}/> クリック移動</label>
	</div>

    <!-- ★ 遭遇オーバーレイ -->
    <div id="pre-battle-overlay" style="display:none;
         position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,.6);">
      <div style="background:#111827; border:1px solid #334155; border-radius:12px; padding:16px; width:min(560px, 92vw); position:absolute; bottom:120px; left:50%; transform:translateX(-50%);">
        <div id="encounter-text" style="margin-bottom:12px; line-height:1.6"></div>
        <div class="flex" style="justify-content:flex-end; gap:8px;">
          <button class="button" id="btn-escape">逃げる</button>
          <button class="button" id="btn-fight" style="background:#2563eb;">戦う</button>
        </div>
      </div>
    </div>

      <p class="small"></p>
    </section>
  `;
};
MapScreen.afterRender = () => {
  if(normalizeMode(Store.mode) === 'arena'){
    const item = getArenaEnemyAt(Store.arenaIndex) || setArenaEnemy(Store.arenaIndex);
    if(!item){
      location.hash = '/result';
      return;
    }
    if(typeof Store.pendingEventId !== 'number') setArenaEnemy(Store.arenaIndex);
    location.hash = '/battle';
    return;
  }
  // ★ 敗北時のフロアリセット処理
  if (Store.lastBattle?.result === 'lose') {
    ensureFloorState(Store.floorIndex);
    Store.floorStates[Store.floorIndex].position = null; // スタート地点に戻す
    Store.lastBattle = null; // 処理済みフラグ
  }

  const root = document.getElementById('map-root');
  const mapData = getMapData(Store.floorIndex);
  const floorState = ensureFloorState(Store.floorIndex);

  // ★ マップ画面に戻ったらタイマーを再開
  startRunTimer();

  const map = new MapEngine(mapData);
  map.mount(root);

  map.api().resumeFromState({ steps: floorState.steps, position: floorState.position, elapsedSeconds: elapsedNow() });

	// MapScreen.afterRender で反映
	document.getElementById('radar-size')?.addEventListener('change', (e)=>{
	  const [w,h] = e.target.value.split('x').map(n=>parseInt(n,10)||3);
	  Store.settings.radar = { w, h };
	  // 再描画（簡易にハッシュを再設定）
	  location.hash = '/map';
	});

  // ★ マップレベルの敵復活管理システムは enterEvent ハンドラで実装済み
  // （敵戦闘後、battle.on('end')で Store.floorStates[floorIdx].defeated に復活情報を記録）
	
	// MapScreen.afterRender() 内で値の反映
	document.getElementById('ctl-mode')?.addEventListener('change', (e)=>{
	  Store.settings.controlMode = e.target.value;
	});
	document.getElementById('click-move')?.addEventListener('change', (e)=>{
	  Store.settings.clickToMove = !!e.target.checked;
	});

  // ★ 遭遇処理：戦闘イベントに入る前に “戦う/逃げる” を出す
  map.on('enterEvent', ({ eventId }) => {
    const floorIdx = Store.floorIndex;
    const floorState = Store.floorStates[floorIdx];
    
    // ★ 復活待機中のイベントをチェック
    if (floorState?.defeated?.[eventId]) {
      const defeated = floorState.defeated[eventId];
      const now = performance.now();
      const elapsedTime = now - defeated.defeatedAt;
      
      // 復活クールダウン中の場合、イベント無視
      if (elapsedTime < defeated.respawnDelay) {
        const remainSecs = Math.ceil((defeated.respawnDelay - elapsedTime) / 1000);
        map.addLog(`<span style="color:#fca5a5">黒いもやが残っている。あと（${remainSecs}秒は何もなさそうだ）...</span>`);
        return;
      }
      
      // 復活回数を超えた場合、イベント無視（二度と出現しない）
      if (defeated.respawnCount >= defeated.respawnLimit) {
        map.addLog(`<span style="color:#93c5fd">ここには何も残っていない。完全に消し去った。</span>`);
        return;
      }
      
      // 復活回数をインクリメント
      defeated.respawnCount++;
    }
    
    const floorData = (typeof STAGE_MASTER !== 'undefined' ? STAGE_MASTER[Store.floorIndex] : null) || {};
    const stageData = (floorData.stages || []).find(s => s.id === eventId) || {};
    const stageLabel = stageData.title || floorData.floor || `Stage ${eventId}`;
    const enemyName = (stageData.enemies && stageData.enemies[0]?.name) || '???';
    
    // ★ ボスキャラの判定
    const isBoss = enemyName.includes('BOSS') || enemyName.includes('ボス');
    console.log(`[DEBUG] Enemy: ${enemyName}, isBoss: ${isBoss}`);

    // テキスト生成（複数敵は “先頭の敵の名 など” 表記）
    const encText = `（<b>${stageLabel}</b>）にたどり着くと、<b>「${enemyName}${(stageData.enemies?.length||0) > 1 ? '」 など' : '」'}</b>が現れた。<br>どうする？`;

    const $ov = document.getElementById('pre-battle-overlay');
    const $tx = document.getElementById('encounter-text');
    const $fight = document.getElementById('btn-fight');
    const $escape = document.getElementById('btn-escape');
    $tx.innerHTML = encText;
    $ov.style.display = 'flex';

    // ★ 「戦う」→ バトル遷移
    $fight.onclick = () => {
      $ov.style.display = 'none';
      Store.pendingEventId = eventId;
      // 遭遇情報（戦う選択）
      Store.lastEncounter = { stageId: eventId, enemyName, action: 'fight' };
      location.hash = '/battle';
    };

    // ★ 「逃げる」→ バトル回避（ログへ）
    // ボスキャラからは逃げられない
    $escape.onclick = () => {
      if (isBoss) {
        map.addLog(`<span style="color:#fca5a5">${enemyName}の強力なオーラに支配されて逃げられない！</span>`);
        return;
      }
      $ov.style.display = 'none';
      Store.lastEncounter = { stageId: eventId, enemyName, action: 'escape' };
      // すぐ再トリガーされるのが嫌なら、数ステップだけ隠すなどの処理を入れてもOK
      // 例: 逃げたら 1 ステップ必ず進まないと再出現しない等のルールを付けてもよい

      // マップのログにメッセージを残す
      map.addLog(`<span style="color:#93c5fd">…${enemyName} から逃げた。</span>`);
    };
    
    // ★ ボスの場合は逃げボタンを視覚的に無効化
    if (isBoss) {
      $escape.style.opacity = '0.5';
      $escape.style.cursor = 'not-allowed';
    } else {
      $escape.style.opacity = '1';
      $escape.style.cursor = 'pointer';
    }
  });

  // 直前の戦闘結果（win/lose）があればログ表示してクリア
  if (Store.lastBattle) {
    const { enemyName, result } = Store.lastBattle;
    map.addLog(`<span style="color:${result==='win' ? '#f8e3a1' : '#fca5a5'}">${enemyName} を${result==='win' ? '倒した' : 'に倒されてしまった。<br>輝く光に包まれ飛ばされた'}。</span>`);
    Store.lastBattle = null;
  }

  // 直前の遭遇で「逃げた」だけの場合もログ表示（上で表示しているが、遷移を跨いだとき用）
  if (Store.lastEncounter?.action === 'escape') {
    map.addLog(`<span style="color:#93c5fd">…${Store.lastEncounter.enemyName} から逃げた。</span>`);
    Store.lastEncounter = null;
  }

  map.on('moved', ({stepsDelta, pos})=>{
    floorState.steps += stepsDelta;
    floorState.position = pos;
    autosave({reason:'moved'});
  });

  map.on('reachedGoal', ()=>{
    stopRunTimer();
    location.hash = '/result';
  });
};

/* ------------------------------
   画面：バトル
------------------------------ */
function BattleScreen(){}
BattleScreen.title = 'バトル';
BattleScreen.render = () => `
  <section class="panel panel--battle">  <!-- panel の余白が嫌なら専用クラスで調整 -->
    <div id="battle-root"></div>
  </section>
`;

BattleScreen.afterRender = () => {
  const root = document.getElementById('battle-root');
  const battle = new BattleEngine();
  battle.mount(root);

  battle.on('end', ({ result, rewards }) => {
    // ★ 戦闘相手（先頭敵）の名前を BattleEngine 側から取得できるようにしておく
    const enemyName = battle.getPrimaryEnemyName?.() || '???';
    
    // ★ ボスキャラの判定
    const isBoss = enemyName.includes('BOSS') || enemyName.includes('ボス');
    console.log(`[DEBUG] Battle End - Enemy: ${enemyName}, isBoss: ${isBoss}, result: ${result}`);

    // 結果を保存（MapScreen.afterRenderでログ表示＆クリア）
    Store.lastBattle = { enemyName, result }; // result: 'win'|'lose'

    if (rewards?.exp) Store.player.exp += rewards.exp;
    
    // ★ 追加：敗北時のマップリセット処理
    if (result === 'lose') {
      Store.deaths += 1;
      Store.floorDeaths += 1;
      // ステータスはそのまま、秒数を+10秒する
      Store.elapsedSeconds += 10;
      // フロアの最初にリセット（特定のマップデータを保全しつつリセット）
      ensureFloorState(Store.floorIndex);
      // フロアの開始地点に戻す処理はMapScreenで実施
    } else if (result === 'win' && typeof Store.pendingEventId === 'number') {
      // ★ 敷詰：バトル勝利時に敵の復活情報をStore.floorStates に記録
      // ボスキャラは復活しない
      if (!isBoss) {
        const stageId = Math.max(1, Math.min(parseInt(Store.pendingEventId, 10), 10));
        const floorIdx = Store.floorIndex;
        ensureFloorState(floorIdx);
        
        if (!Store.floorStates[floorIdx].defeated) {
          Store.floorStates[floorIdx].defeated = {};
        }
        
        // 復活情報を記録
        Store.floorStates[floorIdx].defeated[stageId] = {
          defeatedAt: performance.now(),
          respawnDelay: CONFIG.respawn?.delay || 30000, // デフォルト30秒
          respawnLimit: CONFIG.respawn?.limit || 3,      // デフォルト3回
          respawnCount: 0
        };
        console.log(`[DEBUG] Respawn info recorded for stageId: ${stageId}`);
      } else {
        console.log(`[DEBUG] Boss defeated - No respawn info recorded`);
      }
    }
    
    // ★ 重要：戦闘終了後に pendingEventId をクリア（敵が複数回戦えてしまう問題を修正）
    Store.pendingEventId = null;

    if(normalizeMode(Store.mode) === 'arena'){
      if(result === 'win'){
        Store.arenaIndex += 1;
        const nextItem = setArenaEnemy(Store.arenaIndex);
        if(nextItem){
          if(location.hash.replace(/^#/, '') === '/battle'){
            router();
          } else {
            location.hash = '/battle';
          }
          return;
        }
      }
      location.hash = '/result';
      return;
    }

    location.hash = '/map';
  });

  // ★ BattleEngine.startBattle() を呼ぶ前に、先頭敵名を引けるよう
  // BattleEngine に “現在のステージ情報” を持たせておく
  let stageId = Math.max(1, Math.min(parseInt(Store.pendingEventId || 1, 10), 10));
  let floorIdx = Math.max(0, Store.floorIndex);
  let overrideEnemies = null;
  if(normalizeMode(Store.mode) === 'arena'){
    const item = getArenaEnemyAt(Store.arenaIndex) || setArenaEnemy(Store.arenaIndex);
    if(item){
      stageId = item.stageId;
      floorIdx = item.floorIdx;
      const floorData = (typeof STAGE_MASTER !== 'undefined' ? STAGE_MASTER[floorIdx] : null) || {};
      const stageData = (floorData.stages || []).find(s => s.id === stageId) || {};
      const enemy = (stageData.enemies || [])[item.enemyIdx];
      if(enemy) overrideEnemies = [{ ...enemy }];
    }
  }
  const grade = currentDifficulty().grade;

  console.log(`[DEBUG] Starting battle - floorIdx: ${floorIdx}, stageId: ${stageId}`);
  battle.startBattle({ player: Store.player, floorIdx, stageId, grade, overrideEnemies });
  
  console.log(`[DEBUG] Starting battle - floorIdx: ${floorIdx}, stageId: ${stageId}`);
};


/* ------------------------------
   画面：結果
------------------------------ */
function ResultScreen(){}
ResultScreen.title = '結果';
ResultScreen.render = () => {
  const score = computeScore();
  const entry = {
    ts: Date.now(),
    floorIndex: Store.floorIndex,
    score,
    elapsedSeconds: Store.elapsedSeconds,
    totalKills: Store.totalKills,
    deaths: Store.floorDeaths,
    mode: normalizeMode(Store.mode)
  };
  const stamp = `${entry.floorIndex}-${entry.elapsedSeconds}-${entry.totalKills}-${entry.deaths}-${score}`;
  if (Store.lastResultStamp !== stamp) {
    ScoreStore.record(entry);
    Store.lastResultStamp = stamp;
  }

  const scoreList = ScoreStore.listByFloor(Store.floorIndex, Store.mode);
  const scoreRows = scoreList.length ? scoreList.map((s, idx)=>{
    const date = new Date(s.ts).toLocaleString();
    return `<tr>
      <td>${idx+1}</td>
      <td>${modeLabel(s.mode)}</td>
      <td>${s.score}</td>
      <td>${s.elapsedSeconds}</td>
      <td>${s.totalKills}</td>
      <td>${s.deaths}</td>
      <td>${date}</td>
    </tr>`;
  }).join('') : `<tr><td colspan="7">データがありません</td></tr>`;

  const maps = getMaps();
  const nextExists = (Store.floorIndex + 1) < maps.length;
  const isQuest = normalizeMode(Store.mode) === 'quest';
  const disabled = (isQuest && nextExists) ? '' : 'disabled';
  return `
    <section class="panel">
      <h2>フロア ${Store.floorIndex+1} クリア！</h2>
      <ul>
        <li>モード: <strong>${modeLabel(Store.mode)}</strong></li>
        <li>クリアタイム: <strong>${Store.elapsedSeconds} 秒</strong></li>
        <li>撃破数: <strong>${Store.totalKills}</strong></li>
        <li>死亡数: <strong>${Store.floorDeaths}</strong></li>
        <li>スコア: <strong>${score}</strong></li>
      </ul>
      <h3>フロア別スコア一覧 (Top 30)</h3>
      <table class="table">
        <thead>
          <tr><th>順位</th><th>モード</th><th>スコア</th><th>時間</th><th>撃破</th><th>死亡</th><th>日時</th></tr>
        </thead>
        <tbody>${scoreRows}</tbody>
      </table>
      <div class="flex" style="margin-top:1rem">
        <button class="button" id="next-floor" ${disabled}>次のフロアへ</button>
        <a class="button" href="#/title" data-link>タイトルへ</a>
      </div>
      <p class="small">次フロアへ進むと、maps.js の次のマップを読み込み、スタート位置から開始します。</p>
    </section>
  `;
};
ResultScreen.afterRender = () => {
  const btn = document.getElementById('next-floor');
  if(!btn || btn.disabled) return;
  btn.addEventListener('click', ()=>{
    if(normalizeMode(Store.mode) !== 'quest') return;
    Store.floorIndex += 1;
    const st = ensureFloorState(Store.floorIndex);
    st.position = null; // スタート位置
    st.steps = 0;
    st.defeated = {};
    Store.floorDeaths = DEFAULTS.run.floorDeaths;
    resetRunTimer(); startRunTimer();
    autosave({reason:'next-floor'});
    location.hash = '/map';
  });
};

/* ------------------------------
   ルーティング & 起動
------------------------------ */
const routes = { '/title': TitleScreen, '/map': MapScreen, '/battle': BattleScreen, '/result': ResultScreen };
function router(){
  const app = document.getElementById('app');
  const path = location.hash.replace(/^#/, '') || '/title';
  const page = routes[path] || TitleScreen;

  // ★ 追加：戦闘ルートのみヘッダー等を隠すフラグ
  document.body.classList.toggle('battle-mode', path === '/battle');

  app.setAttribute('aria-busy','true');
  app.innerHTML = page.render();
  page.afterRender?.();
  document.title = `${page.title} - 算術の塔 v1.2.17`;
  // （ナビの aria-current の付け替え等は既存通り）
  app.removeAttribute('aria-busy');
}

function initFooterSettings(){
  const settingsBtn = document.getElementById('footer-settings');
  const modal = document.getElementById('settings-modal');
  if(!settingsBtn || !modal) return;

  const closeBtn = modal.querySelector('[data-close]');
  const radarSelect = modal.querySelector('#settings-radar');
  const controlSelect = modal.querySelector('#settings-control');

  const getRoute = ()=> location.hash.replace(/^#/, '') || '/title';

  const syncFromStore = ()=>{
    const radar = Store?.settings?.radar || { w:5, h:5 };
    const radarValue = `${radar.w}x${radar.h}`;
    if(radarSelect){
      radarSelect.value = ['3x3','5x5','5x3'].includes(radarValue) ? radarValue : '5x5';
    }
    if(controlSelect){
      controlSelect.value = Store?.settings?.controlMode || 'relative';
    }
  };

  const closeModal = ()=>{
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
  };

  settingsBtn.addEventListener('click', ()=>{
    syncFromStore();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
  });
  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=>{
    if(e.target === modal) closeModal();
  });

  radarSelect?.addEventListener('change', (e)=>{
    const [w,h] = e.target.value.split('x').map(n=>parseInt(n,10)||5);
    Store.settings.radar = { w, h };
    if(getRoute()==='/map') router();
  });
  controlSelect?.addEventListener('change', (e)=>{
    Store.settings.controlMode = e.target.value;
    if(getRoute()==='/map') router();
  });
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', ()=>{
  router();
  initFooterSettings();
});

