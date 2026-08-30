// scripts/generate_maps.js
//
// 算術の塔の全10フロア分のマップ(window.MAPS)を生成するスクリプト。
//
// 設計方針:
//  - 各フロアをノード格子上の「完全迷路(全域木)」として生成する。全域木なので
//    すべてのノードが必ず連結され、スタートから全ステージ・ゴールへ到達できる。
//  - ノード = 停止マス(S / G / 1〜9 / A / 0)、ノード間の1マス = 通路 'x'。
//    app.js のオートムーブは 'x' のみ通過し停止マスで止まるため、この構造なら
//    「ノード → x → 隣ノード」で必ず1手ずつ進める。
//  - スタート(S)からのBFS距離が近い順にステージ1〜9を割り当て、難易度を段階配置。
//    ボス(ステージ10)は 'A'(mapping で 10 に解決)としてゴール直前のノードに置く。
//  - シード固定のため、再実行しても同一の maps.js が生成される(再現可能)。
//
// 実行: node scripts/generate_maps.js
//   maps.js を上書き生成し、各フロアの到達性検証結果を標準出力に表示する。

const fs = require('fs');
const path = require('path');

// ---- 乱数(mulberry32): シード固定で再現可能 ----
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- 始まりの森(floor_1)の固定レイアウト ----
// このフロアだけは元の手作りマップに戻す(チュートリアル的な短いフロア)。
// 生成はせず、この layout / mapping をそのまま使う。
const FLOOR_1_FIXED = {
  layout: [
    '            AxG',
    '            x  ',
    '            0  ',
    '            x  ',
    '  0x0x8x0x0x9  ',
    '  x   x     x  ',
    '  7   0 Bx0 x  ',
    '  x   x x   x  ',
    '  0x0x0 0 0x0  ',
    '  x   x x x x  ',
    '  6x0x5x0x4x0  ',
    '      x   x x  ',
    '      0   0 0  ',
    '      x   x x  ',
    'Sx1x0x2x0x3 0  ',
    '        x   x  ',
    '        0x0x0  ',
  ],
  mapping: { A: 10, B: 11 },
};

// ---- フロア定義(名前は monster.js の STAGE_MASTER と対応) ----
// nr x nc はノード格子の行×列。文字盤面は (nr*2-1) x (nc*2-1) になる。
// フロアが深くなるほどマップを広くして、進行に伴うスケール感を出す。
// fixed が指定されたフロアは生成せず、その固定レイアウトを使う。
const FLOORS = [
  { id: 'floor_1',  name: '始まりの森',     fixed: FLOOR_1_FIXED },
  { id: 'floor_2',  name: '灼熱の洞窟',     nr: 5, nc: 6 },
  { id: 'floor_3',  name: '静寂の氷河',     nr: 6, nc: 6 },
  { id: 'floor_4',  name: '黄金の砂漠',     nr: 6, nc: 7 },
  { id: 'floor_5',  name: '廃墟の機械都市', nr: 7, nc: 7 },
  { id: 'floor_6',  name: '幻想の天空城',   nr: 7, nc: 8 },
  { id: 'floor_7',  name: '奈落の底',       nr: 8, nc: 8 },
  { id: 'floor_8',  name: '時空の歪み',     nr: 8, nc: 8 },
  { id: 'floor_9',  name: '無の空間',       nr: 8, nc: 9 },
  { id: 'floor_10', name: '算術の頂点',     nr: 9, nc: 9 },
];

const edgeKey = (r, c, nr, nc) => {
  // 正規化した無向辺キー
  const a = `${r},${c}`, b = `${nr},${nc}`;
  return a < b ? `${a}|${b}` : `${b}|${a}`;
};

// ---- 完全迷路(全域木)を再帰的バックトラッカーで生成 ----
function generateMaze(NR, NC, rng) {
  const visited = Array.from({ length: NR }, () => Array(NC).fill(false));
  const edges = new Set();
  const stack = [[0, 0]];
  visited[0][0] = true;
  const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const neigh = [];
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < NR && nc >= 0 && nc < NC && !visited[nr][nc]) neigh.push([nr, nc]);
    }
    if (neigh.length === 0) { stack.pop(); continue; }
    const [nr, nc] = neigh[Math.floor(rng() * neigh.length)];
    visited[nr][nc] = true;
    edges.add(edgeKey(r, c, nr, nc));
    stack.push([nr, nc]);
  }
  return edges;
}

// ---- ノードグラフ上でBFS(距離と親を返す) ----
function bfsNodes(NR, NC, edges, start) {
  const dist = Array.from({ length: NR }, () => Array(NC).fill(-1));
  const parent = Array.from({ length: NR }, () => Array(NC).fill(null));
  const q = [start];
  dist[start[0]][start[1]] = 0;
  const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  while (q.length) {
    const [r, c] = q.shift();
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= NR || nc < 0 || nc >= NC) continue;
      if (dist[nr][nc] !== -1) continue;
      if (!edges.has(edgeKey(r, c, nr, nc))) continue;
      dist[nr][nc] = dist[r][c] + 1;
      parent[nr][nc] = [r, c];
      q.push([nr, nc]);
    }
  }
  return { dist, parent };
}

// ---- 1フロア分のレイアウト(文字列配列)を生成 ----
function buildFloor(floor, seed) {
  const { nr: NR, nc: NC } = floor;
  const rng = mulberry32(seed);
  const edges = generateMaze(NR, NC, rng);

  const start = [0, 0];
  const goal = [NR - 1, NC - 1];
  const { dist, parent } = bfsNodes(NR, NC, edges, start);

  // ボス(A=10)はゴール直前のノード(ゴールの親)に配置。全域木なのでゴールへ行くには
  // 必ずこのノードを通る = ボス→ゴールの導線になる。
  const bossNode = parent[goal[0]][goal[1]];

  // 特別マスを除いた残りノードを、スタートからのBFS距離が近い順に並べる
  const isSame = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];
  const rest = [];
  for (let r = 0; r < NR; r++) {
    for (let c = 0; c < NC; c++) {
      const node = [r, c];
      if (isSame(node, start) || isSame(node, goal) || isSame(node, bossNode)) continue;
      rest.push(node);
    }
  }
  rest.sort((a, b) => dist[a[0]][a[1]] - dist[b[0]][b[1]] || (a[0] - b[0]) || (a[1] - b[1]));

  // ステージ1〜9は距離順リストから均等間隔で選び、マップ全体に分散配置する
  // (スタート付近に固まらせず、1が最も近く・9が最奥=ボス手前になるようにする)。
  const stageNodeIndex = new Map(); // rest内index -> ステージ番号(1..9)
  const N = rest.length;
  for (let k = 0; k < 9; k++) {
    let idx = N <= 1 ? 0 : Math.round((k * (N - 1)) / 8);
    while (stageNodeIndex.has(idx)) idx = (idx + 1) % N; // 重複回避
    stageNodeIndex.set(idx, k + 1);
  }

  // 文字グリッド(空白=壁)を用意
  const H = NR * 2 - 1, W = NC * 2 - 1;
  const grid = Array.from({ length: H }, () => Array(W).fill(' '));
  const setNode = (r, c, ch) => { grid[r * 2][c * 2] = ch; };

  // ノードに文字を割り当て
  setNode(start[0], start[1], 'S');
  setNode(goal[0], goal[1], 'G');
  setNode(bossNode[0], bossNode[1], 'A'); // A -> 10 (ボス)
  // 残りノードにステージ番号 or '0'(部屋)を割り当て。stage番号 -> ノード も記録。
  const stageNode = {}; // stage番号 -> [r,c]
  for (let i = 0; i < rest.length; i++) {
    const [r, c] = rest[i];
    if (stageNodeIndex.has(i)) {
      const s = stageNodeIndex.get(i);
      stageNode[s] = [r, c];
      setNode(r, c, String(s));
    } else {
      setNode(r, c, '0');
    }
  }

  // 辺(通路)を 'x' で敷く
  for (const key of edges) {
    const [aStr, bStr] = key.split('|');
    const [ar, ac] = aStr.split(',').map(Number);
    const [br, bc] = bStr.split(',').map(Number);
    grid[ar + br][ac + bc] = 'x'; // 中点セル
  }

  // ---- ルート指標(RTA=タイムトライアル設計の指標) ----
  // クリティカルパス = S→ゴールの一意な経路(全域木なので一意)。
  const keyOf = (r, c) => `${r},${c}`;
  const pathSet = new Set();
  let cur = goal;
  while (cur) { pathSet.add(keyOf(cur[0], cur[1])); cur = parent[cur[0]][cur[1]]; }
  const pathLen = dist[goal[0]][goal[1]]; // S→ゴールのノード手数

  // 各ステージが本道(クリティカルパス)上か、寄り道(枝)か。寄り道の場合は
  // 「本道に合流するまでのノード数(片道)」= 寄り道コストを算出する。
  const detourOf = (node) => {
    let steps = 0, n = node;
    while (n && !pathSet.has(keyOf(n[0], n[1]))) { n = parent[n[0]][n[1]]; steps++; }
    return steps; // 0 なら本道上
  };
  const stagesOnPath = [];
  const stagesOnBranch = [];
  for (let s = 1; s <= 9; s++) {
    const node = stageNode[s];
    if (!node) continue;
    const d = detourOf(node);
    if (d === 0) stagesOnPath.push(s);
    else stagesOnBranch.push({ stage: s, detour: d });
  }

  const layout = grid.map((row) => row.join(''));
  return {
    layout,
    meta: { NR, NC, bossNode, dist, pathLen, stagesOnPath, stagesOnBranch },
  };
}

// ---- 生成したレイアウトを文字マス上のBFSで検証 ----
// mapping('A'->10) と app.js の getEventId 相当の walkability を再現し、
// S から全ステージ(1〜9,A)とゴールへ到達できるかを確認する。
function validateFloor(floor, layout) {
  const grid = layout.map((r) => r.split(''));
  const H = grid.length, W = Math.max(...grid.map((r) => r.length));
  const cell = (y, x) => (y < 0 || y >= H || x < 0 || x >= (grid[y] ? grid[y].length : 0)) ? '' : grid[y][x];
  const walkable = (ch) => ch !== '' && ch !== ' ';

  // S を探す
  let sy = -1, sx = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (cell(y, x) === 'S') { sy = y; sx = x; }
  if (sy === -1) return { ok: false, reason: 'S が見つからない' };

  const seen = new Set();
  const found = new Set();
  const q = [[sy, sx]];
  seen.add(`${sy},${sx}`);
  const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  while (q.length) {
    const [y, x] = q.shift();
    const ch = cell(y, x);
    if (ch && ch !== ' ' && ch !== 'x' && ch !== '0') found.add(ch);
    for (const [dy, dx] of DIRS) {
      const ny = y + dy, nx = x + dx;
      const k = `${ny},${nx}`;
      if (seen.has(k)) continue;
      if (!walkable(cell(ny, nx))) continue;
      seen.add(k);
      q.push([ny, nx]);
    }
  }

  const required = ['S', 'G', 'A', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const missing = required.filter((t) => !found.has(t));
  return { ok: missing.length === 0, missing, found: [...found].sort() };
}

// ---- mapping オブジェクトを JS リテラル文字列に整形 ----
function mappingLiteral(mapping) {
  const parts = Object.keys(mapping).map((k) => `${JSON.stringify(k)}: ${mapping[k]}`);
  return `{ ${parts.join(', ')} }`;
}

// ---- maps.js を出力 ----
function emitMapsJs(maps) {
  const indent = (n) => ' '.repeat(n);
  let out = '// maps.js\n';
  out += '// scripts/generate_maps.js により自動生成(シード固定・再現可能)。手編集する場合は同スクリプトも更新すること。\n';
  out += '// floor_1(始まりの森)のみ元の手作りマップを固定使用。\n';
  out += 'window.MAPS = [\n';
  maps.forEach((m, idx) => {
    out += indent(2) + '{\n';
    out += indent(4) + `id: ${JSON.stringify(m.id)},\n`;
    out += indent(4) + `name: ${JSON.stringify(m.name)},\n`;
    out += indent(4) + 'layout: [\n';
    m.layout.forEach((row, i) => {
      out += indent(6) + JSON.stringify(row) + (i < m.layout.length - 1 ? ',' : '') + '\n';
    });
    out += indent(4) + '],\n';
    out += indent(4) + `mapping: ${mappingLiteral(m.mapping || { A: 10 })}\n`;
    out += indent(2) + '}' + (idx < maps.length - 1 ? ',' : '') + '\n';
  });
  out += '];\n';
  return out;
}

function main() {
  const maps = [];
  const report = [];
  FLOORS.forEach((floor, i) => {
    let layout, mapping, meta = null;
    if (floor.fixed) {
      // 固定レイアウト(生成しない)
      layout = floor.fixed.layout.slice();
      mapping = floor.fixed.mapping || { A: 10 };
    } else {
      // フロアごとに異なるシード(再現可能)
      const seed = 0x9e3779b9 ^ ((i + 1) * 0x01000193);
      const built = buildFloor(floor, seed);
      layout = built.layout;
      meta = built.meta;
      mapping = { A: 10 };
    }
    const v = validateFloor(floor, layout);
    maps.push({ id: floor.id, name: floor.name, layout, mapping });
    report.push({
      floor: floor.id, name: floor.name,
      size: `${layout.length}x${layout[0].length}`,
      fixed: !!floor.fixed, meta, ...v,
    });
    if (!v.ok) {
      throw new Error(`[検証失敗] ${floor.id}: 未到達=${JSON.stringify(v.missing)}`);
    }
  });

  const outPath = path.join(__dirname, '..', 'maps.js');
  fs.writeFileSync(outPath, emitMapsJs(maps), 'utf8');

  console.log('生成完了: maps.js');
  console.log('フロア数:', maps.length);
  console.log('');
  console.log('== 到達性検証 ==');
  report.forEach((r) => {
    const tag = r.fixed ? '(固定)' : '';
    console.log(`  ${r.floor} (${r.name})${tag} 盤面=${r.size} 到達=OK`);
  });
  console.log('');
  console.log('== ルート指標(RTA=タイムトライアル設計用) ==');
  console.log('  pathLen = S→ゴールの最短ノード手数 / 本道=クリティカルパス上のステージ / 寄り道=枝上のステージ(片道コスト)');
  report.forEach((r) => {
    if (!r.meta) { console.log(`  ${r.floor} (${r.name}) : 固定マップのため指標算出は省略`); return; }
    const onPath = r.meta.stagesOnPath.join(',') || 'なし';
    const branch = r.meta.stagesOnBranch.map((b) => `${b.stage}(+${b.detour})`).join(',') || 'なし';
    console.log(`  ${r.floor} (${r.name}) : pathLen=${r.meta.pathLen} / 本道ステージ=[${onPath}] / 寄り道ステージ=[${branch}]`);
  });
}

main();
