// maps.js
// scripts/generate_maps.js により自動生成(シード固定・再現可能)。手編集する場合は同スクリプトも更新すること。
window.MAPS = [
  {
    id: "floor_1",
    name: "始まりの森",
    layout: [
      "S 0x0x0",
      "x     x",
      "1 6x7 9",
      "x x x x",
      "2 5 8xA",
      "x x   x",
      "3x4 0xG"
    ],
    mapping: { "A": 10 }
  },
  {
    id: "floor_2",
    name: "灼熱の洞窟",
    layout: [
      "S 3x4 0x9",
      "x x x   x",
      "1x2 5x6 8",
      "      x x",
      "0x0x0 7xA",
      "x       x",
      "0x0x0x0xG"
    ],
    mapping: { "A": 10 }
  },
  {
    id: "floor_3",
    name: "静寂の氷河",
    layout: [
      "Sx1 0x0",
      "  x x x",
      "5 2 0 0",
      "x x x x",
      "4x3 0 9",
      "x     x",
      "6x7x8xA",
      "      x",
      "0x0x0xG"
    ],
    mapping: { "A": 10 }
  },
  {
    id: "floor_4",
    name: "黄金の砂漠",
    layout: [
      "Sx1x2x3x4",
      "        x",
      "9x8x7x6x5",
      "x        ",
      "0 0x0x0 0",
      "x x   x x",
      "0 0 0x0 0",
      "x x x   x",
      "0x0 0xAxG"
    ],
    mapping: { "A": 10 }
  },
  {
    id: "floor_5",
    name: "廃墟の機械都市",
    layout: [
      "Sx1 0x0 0x0",
      "  x x x   x",
      "3x2 9 0x0 0",
      "x   x   x x",
      "4 7x8 0 0xA",
      "x x   x   x",
      "5x6 0x0x0xG"
    ],
    mapping: { "A": 10 }
  },
  {
    id: "floor_6",
    name: "幻想の天空城",
    layout: [
      "S 3x4x5",
      "x x   x",
      "1x2 9 6",
      "    x x",
      "0x0 8x7",
      "x x x  ",
      "0 0 0x0",
      "x     x",
      "0x0x0x0",
      "x      ",
      "0x0xAxG"
    ],
    mapping: { "A": 10 }
  },
  {
    id: "floor_7",
    name: "奈落の底",
    layout: [
      "Sx1x2 8x6",
      "    x   x",
      "0x0 3x4x5",
      "x x     x",
      "0 0x0x0 7",
      "x   x x x",
      "0 0x0 0 A",
      "x x     x",
      "0 0x0x9xG"
    ],
    mapping: { "A": 10 }
  },
  {
    id: "floor_8",
    name: "時空の歪み",
    layout: [
      "Sx1x2x3x4",
      "        x",
      "0x0x0x0 5",
      "x     x x",
      "0x0 8x9 A",
      "  x x   x",
      "0x0 7x6xG"
    ],
    mapping: { "A": 10 }
  },
  {
    id: "floor_9",
    name: "無の空間",
    layout: [
      "Sx1 0x9",
      "  x   x",
      "3x2 7x8",
      "x   x x",
      "4x5x6 0",
      "      x",
      "0x0x0 A",
      "x x   x",
      "0 0x0xG"
    ],
    mapping: { "A": 10 }
  },
  {
    id: "floor_10",
    name: "算術の頂点",
    layout: [
      "Sx1x2 0",
      "    x x",
      "7 4x3 0",
      "x x   x",
      "6x5 0xA",
      "x   x x",
      "8x9x0 G"
    ],
    mapping: { "A": 10 }
  }
];
