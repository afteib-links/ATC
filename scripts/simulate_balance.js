// scripts/simulate_balance.js
//
// 敵バランスを「人間の解答ペース」基準で客観評価する戦闘シミュレーター。
// computerUse は解答が遅くDPSレースを人間基準で測れないため、時間駆動のモデルで
// 勝敗・撃破に要する正解数・残HPを推定する。
//
// モデル(app.js のロジックに準拠):
//  - プレイヤーは secPerAnswer 秒ごとに1問正解し、ダメージ = max(1, ATK×rank×combo − 敵DEF)。
//    rank 期待値 2.1、コンボ係数は平均 1.15 で近似。★は毎正解 +2.1 貯まり、30以上で必殺(×3, −30)。
//  - 敵は各自 spd 秒ごとに max(1, 敵ATK − 自DEF) を与える。プレイヤーは先頭から集中攻撃。
//  - 麻痺やミスは無視(プレイヤー有利側=保守的評価)。
//
// プレイヤー想定はフロア別のレベルモデル(balance_monsters.js と同じ)。
//  - underleveled(rep=2+3f): ボスに寄り道せず来た想定 / leveled(=4+3f): 全撃破で育った想定。
//
// 実行: node scripts/simulate_balance.js [secPerAnswer]

const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '..', 'monster.js'), 'utf8');
const STAGE_MASTER = (new Function(src + '\n;return STAGE_MASTER;'))();

const AVG_RANK = 2.1;
const COMBO_FACTOR = 1.15;
const ULT_THRESHOLD = 30, ULT_MULT = 3;

// プレイヤーモデル(レベル→ステータス)。balance_monsters.js と整合。
const statsAtLevel = (L) => ({ atk: 15 + (L - 1) * 10, hp: 100 + (L - 1) * 70, def: 5 + (L - 1) * 5 });

// 1戦闘をシミュレートして結果を返す
function simulate(player, enemies, secPerAnswer) {
  const es = enemies.map((e) => ({ hp: e.hp, atk: e.atk, def: e.def, spd: e.spd, t: e.spd }));
  let php = player.hp;
  let stars = 0, combo = 0;
  let answers = 0;
  let nextAnswerAt = secPerAnswer;
  const dt = 0.1;
  let time = 0;
  const maxTime = 100000; // 安全弁

  const aliveIdx = () => es.findIndex((e) => e.hp > 0);

  while (time < maxTime) {
    time += dt;
    // 敵の攻撃
    for (const e of es) {
      if (e.hp <= 0) continue;
      e.t -= dt;
      if (e.t <= 0) {
        php -= Math.max(1, e.atk - player.def);
        e.t = e.spd;
      }
    }
    if (php <= 0) {
      return { win: false, answers, timeSec: time, hpLeft: 0 };
    }
    // プレイヤーの正解
    if (time >= nextAnswerAt) {
      nextAnswerAt += secPerAnswer;
      const ti = aliveIdx();
      if (ti === -1) break;
      combo += 1;
      answers += 1;
      stars += AVG_RANK;
      // ダメージ = ATK × 平均ランク × コンボ係数(平均1.15で近似)、必殺は×3
      let dmg = player.atk * AVG_RANK * COMBO_FACTOR;
      if (stars >= ULT_THRESHOLD) { dmg *= ULT_MULT; stars -= ULT_THRESHOLD; }
      dmg = Math.max(1, dmg - es[ti].def);
      es[ti].hp -= dmg;
    }
    if (aliveIdx() === -1) {
      return { win: true, answers, timeSec: time, hpLeft: Math.round(php) };
    }
  }
  return { win: aliveIdx() === -1, answers, timeSec: time, hpLeft: Math.round(php) };
}

function roleOf(st) { return st.id === 10 ? 'boss' : st.id === 5 ? 'mid' : 'normal'; }

function main() {
  const secPerAnswer = Number(process.argv[2] || 4); // 標準的な解答ペース(秒/問)
  console.log(`戦闘シミュレーション (secPerAnswer=${secPerAnswer}s, rank平均${AVG_RANK}, combo係数${COMBO_FACTOR})`);
  console.log('各フロアの 通常(stage1) / 中BOSS(stage5) / BOSS(stage10) を、underleveled と leveled で評価');
  console.log('形式: 勝敗 手数=正解数 残HP% (時間s)');
  console.log('');

  STAGE_MASTER.forEach((fl, f) => {
    const repLo = 2 + 3 * f;      // 寄り道せず来た想定(やや低レベル)
    const repHi = 4 + 3 * f;      // 全撃破で育った想定
    const rows = [];
    ['normal', 'mid', 'boss'].forEach((role) => {
      const st = fl.stages.find((s) => roleOf(s) === role) || fl.stages.find((s) => s.id === (role === 'normal' ? 1 : role === 'mid' ? 5 : 10));
      const enemies = st.enemies;
      [['低', repLo], ['育', repHi]].forEach(([tag, L]) => {
        const ps = statsAtLevel(L);
        const player = { atk: ps.atk, def: ps.def, hp: ps.hp };
        const r = simulate(player, enemies, secPerAnswer);
        const pct = Math.round((r.hpLeft / ps.hp) * 100);
        rows.push(`${role}[${tag}L${L}]:${r.win ? '勝' : '敗'} ${r.answers}手 残${r.win ? pct : 0}%`);
      });
    });
    console.log(`f${f} ${fl.floor}`);
    console.log('   ' + rows.join(' | '));
  });
}

main();
