// scripts/balance_monsters.js
//
// 敵ステータス(monster.js の STAGE_MASTER)を、プレイヤーのレベル上昇を加味して
// 再バランスするスクリプト。名前・絵文字・敵数・spd(攻撃間隔)など"個性"は保持し、
// hp / atk / def / exp のみをフロア別の想定レベルに合わせて再計算する。
//
// 設計の考え方:
//  - レベル曲線: 全ステージを1回ずつ倒すと約 +3レベル/フロア 進む前提。
//    経験値必要量は level×50 なので、floorEXP(f)=300+450f を各フロアの合計EXPに
//    すると、フロア開始レベルが 1,4,7,10,... と綺麗に +3 ずつ上がる(自己整合)。
//  - 想定戦闘レベル Lf = 2 + 3f(フロア中盤の代表レベル)。
//  - プレイヤー基準(中級・ATK/HP寄りの標準的な振り分けを想定):
//      ATK = 15 + (Lf-1)*10 / HP = 100 + (Lf-1)*70 / DEF = 5 + (Lf-1)*5
//  - 1回の正解の期待ダメージ ≈ ATK×2.0(平均ランク+軽いコンボ、敵DEFで微減)。
//  - 撃破に必要な正解数の目安: 通常=3 / 中BOSS=8 / BOSS=16。
//  - 敵ATKは「1発でプレイヤー最大HPの 通常8% / 中BOSS13% / BOSS18% を削る」目安。
//  - フロア内の通常敵は、元データの相対差(硬い/柔らかい等)を平均で正規化して保持。
//
// RTA(タイムトライアル)観点: 戦闘を避ける(逃走/スキップ)とレベルが上がらず
// ボスが重くなる、という緊張感は上記モデル(全撃破前提のレベル)から自然に生じる。
//
// 実行: node scripts/balance_monsters.js  (monster.js を上書き生成)

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'monster.js');
const src = fs.readFileSync(SRC, 'utf8');
// monster.js は `let STAGE_MASTER = [...]` 形式。Function内で評価して取り出す。
const STAGE_MASTER = (new Function(src + '\n;return STAGE_MASTER;'))();

const round = (x) => Math.max(0, Math.round(x));
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// ---- プレイヤー想定モデル ----
const repLevel = (f) => 2 + 3 * f;                 // フロア代表レベル
const pATK = (f) => 15 + (repLevel(f) - 1) * 10;
const pHP  = (f) => 100 + (repLevel(f) - 1) * 70;
const pDEF = (f) => 5 + (repLevel(f) - 1) * 5;
const dmgPerAns = (f) => pATK(f) * 2.0;            // 1正解の期待ダメージ

// ---- 敵の役割 ----
const roleOf = (stage) => (stage.id === 10 ? 'boss' : stage.id === 5 ? 'mid' : 'normal');

// ---- フロア別ターゲット ----
const ANSWERS = { normal: 3, mid: 8, boss: 16 };
const DEF_RATIO = { normal: 0.25, mid: 0.30, boss: 0.35 };   // 対プレイヤーATK比
const ATK_HP_RATIO = { normal: 0.08, mid: 0.13, boss: 0.18 }; // 1発=対プレイヤーHP比

const hpTarget  = (f, role) => dmgPerAns(f) * ANSWERS[role];
const defTarget = (f, role) => pATK(f) * DEF_RATIO[role];
const atkTarget = (f, role) => pDEF(f) + pHP(f) * ATK_HP_RATIO[role];

// 通常敵の個体差(元データ比)を圧縮して、極端な硬さ/柔らかさを緩和する係数。
// 0=個体差なし(全員フロア平均) / 1=元の個体差をそのまま保持。
const COMPRESS = 0.5;
const flex = (ratio) => 1 + COMPRESS * (ratio - 1);

// ---- EXP ----
const floorEXP = (f) => 300 + 450 * f;             // フロア合計EXP(=約+3Lv)
const EXP_WEIGHT = { normal: 1, mid: 6, boss: 12 };

function balanceFloor(floor, f) {
  // まず通常敵の元データ平均(相対差の正規化用)
  const normals = [];
  floor.stages.forEach((st) => {
    if (roleOf(st) === 'normal') st.enemies.forEach((e) => normals.push(e));
  });
  const mean = (arr, key) => (arr.length ? arr.reduce((s, e) => s + (Number(e[key]) || 0), 0) / arr.length : 0);
  const avgHp = mean(normals, 'hp') || 1;
  const avgAtk = mean(normals, 'atk') || 1;
  const avgDef = mean(normals, 'def'); // 0 の場合あり

  // EXP 配分の総重み
  let sumW = 0;
  floor.stages.forEach((st) => {
    const role = roleOf(st);
    st.enemies.forEach(() => { sumW += EXP_WEIGHT[role]; });
  });

  const newStages = floor.stages.map((st) => {
    const role = roleOf(st);
    const enemies = st.enemies.map((e) => {
      let hp, atk, def;
      if (role === 'normal') {
        // 元データの相対差を"圧縮して"保ちつつ、フロア目標へ正規化(HP/ATK)。
        // DEF は素の比率を使い、装甲0の敵は0のまま(個性維持)。
        hp  = hpTarget(f, role)  * flex((Number(e.hp)  || avgHp) / avgHp);
        atk = atkTarget(f, role) * flex((Number(e.atk) || avgAtk) / avgAtk);
        def = avgDef > 0 ? defTarget(f, role) * ((Number(e.def) || 0) / avgDef) : 0;
      } else {
        // 中BOSS / BOSS は単体。目標値を直接設定。
        hp = hpTarget(f, role);
        atk = atkTarget(f, role);
        def = defTarget(f, role);
      }
      const spd = clamp(round(Number(e.spd) || 10), 2, 30); // 攻撃間隔は元の個性を維持
      const exp = round(floorEXP(f) * EXP_WEIGHT[role] / sumW);
      return {
        name: e.name,
        sprite: e.sprite,
        hp: Math.max(10, round(hp)),
        atk: Math.max(1, round(atk)),
        def: Math.max(0, round(def)),
        spd,
        exp,
      };
    });
    return { id: st.id, name: st.name, enemies };
  });

  return { floor: floor.floor, bg: floor.bg, stages: newStages };
}

// ---- monster.js 出力 ----
function emit(master) {
  const q = (s) => JSON.stringify(s);
  let out = '// monster.js\n';
  out += '// scripts/balance_monsters.js により再バランス生成(プレイヤーのレベル上昇を加味)。\n';
  out += '// 名前/絵文字/敵数/spd は保持し、hp/atk/def/exp をフロア別の想定レベルに合わせて再計算。\n';
  out += 'let STAGE_MASTER = [\n';
  master.forEach((fl, fi) => {
    out += '\t{\n';
    out += `\t\tfloor: ${q(fl.floor)},\n`;
    out += `\t\tbg: ${q(fl.bg)},\n`;
    out += '\t\tstages: [\n';
    fl.stages.forEach((st, si) => {
      out += `\t\t\t{ id: ${st.id}, name: ${q(st.name)},\n`;
      out += '\t\t\t\tenemies: [\n';
      st.enemies.forEach((e, ei) => {
        out += `\t\t\t\t\t{ name: ${q(e.name)}, sprite: ${q(e.sprite)}, hp: ${e.hp}, atk: ${e.atk}, def: ${e.def}, spd: ${e.spd}, exp: ${e.exp} }`;
        out += (ei < st.enemies.length - 1 ? ',' : '') + '\n';
      });
      out += '\t\t\t\t] }';
      out += (si < fl.stages.length - 1 ? ',' : '') + '\n';
    });
    out += '\t\t] }';
    out += (fi < master.length - 1 ? ',' : '') + '\n';
  });
  out += '];\n';
  return out;
}

function main() {
  const balanced = STAGE_MASTER.map((fl, f) => balanceFloor(fl, f));
  fs.writeFileSync(SRC, emit(balanced), 'utf8');

  console.log('再バランス完了: monster.js');
  console.log('');
  console.log('== プレイヤー想定モデル / フロア別ターゲット ==');
  console.log('  f: フロア(0始まり) / Lv=代表レベル / pATK,pHP,pDEF=想定プレイヤー / 通常,中B,BOSS=敵HP目安 / EXP=フロア合計');
  balanced.forEach((fl, f) => {
    const norm = fl.stages.find((s) => s.id === 1).enemies[0];
    const mid = fl.stages.find((s) => s.id === 5).enemies[0];
    const boss = fl.stages.find((s) => s.id === 10).enemies[0];
    console.log(
      `  f${f} Lv${repLevel(f)} pATK=${pATK(f)} pHP=${pHP(f)} pDEF=${pDEF(f)} | ` +
      `通常HP≈${round(hpTarget(f, 'normal'))}(例:${norm.name} HP${norm.hp}/ATK${norm.atk}) ` +
      `中BOSS HP=${mid.hp}/ATK${mid.atk} BOSS HP=${boss.hp}/ATK${boss.atk} | EXP計=${floorEXP(f)}`
    );
  });
}

main();
