// maps.js
// scripts/generate_maps.js により自動生成(シード固定・再現可能)。手編集する場合は同スクリプトも更新すること。
// floor_1(始まりの森)のみ元の手作りマップを固定使用。
window.MAPS = [
  {
    id: "floor_1",
    name: "始まりの森",
    layout: [
      "            AxG",
      "            x  ",
      "            0  ",
      "            x  ",
      "  0x0x8x0x0x9  ",
      "  x   x     x  ",
      "  7   0 Bx0 x  ",
      "  x   x x   x  ",
      "  0x0x0 0 0x0  ",
      "  x   x x x x  ",
      "  6x0x5x0x4x0  ",
      "      x   x x  ",
      "      0   0 0  ",
      "      x   x x  ",
      "Sx1x0x2x0x3 0  ",
      "        x   x  ",
      "        0x0x0  "
    ],
    mapping: { "A": 10, "B": 11 }
  },
  {
    id: "floor_2",
    name: "灼熱の洞窟",
    layout: [
      "S 2x0x0x0",
      "x x x   x",
      "1x0 5x7x0",
      "x   x x x",
      "0x0x0x0x0",
      "x     x x",
      "3x4x6 8x9",
      "x x x x  ",
      "0x0x0xAxG"
    ],
    mapping: { "A": 10 }
  },
  {
    id: "floor_3",
    name: "静寂の氷河",
    layout: [
      "Sx1 6x0x8x9",
      "x x x x x x",
      "0 0 5x0x7x0",
      "x x x x x x",
      "2x0 4 0x0x0",
      "x   x x x  ",
      "0x0x0x0 0x0",
      "x       x x",
      "3x0x0x0xAxG"
    ],
    mapping: { "A": 10 }
  },
  {
    id: "floor_4",
    name: "黄金の砂漠",
    layout: [
      "Sx1x0x0x0 4",
      "      x x x",
      "0x0 0x2x0x3",
      "x x x x   x",
      "0 0x0 0x0x0",
      "x   x x    ",
      "0x0 0x0 0x9",
      "x x   x x x",
      "0 6x0x5 8 0",
      "x x x   x x",
      "0 7x0x0xAxG"
    ],
    mapping: { "A": 10 }
  },
  {
    id: "floor_5",
    name: "廃墟の機械都市",
    layout: [
      "Sx1 0 0x0x6x0",
      "  x x x   x x",
      "0x0 0x0x5 7 8",
      "x   x     x x",
      "0 0x0x4x0 0x0",
      "x x x   x x  ",
      "0x2x0 9 0x0x0",
      "x x   x x   x",
      "0 0 0x0 0 0xA",
      "x x x   x x x",
      "3x0 0x0x0x0 G"
    ],
    mapping: { "A": 10 }
  },
  {
    id: "floor_6",
    name: "幻想の天空城",
    layout: [
      "S 0x0x0x0x0x0",
      "x x   x x x  ",
      "1x0 0 2 0 3x0",
      "    x x   x x",
      "0x0x0 0x0 0 0",
      "x x x   x   x",
      "0 0 0x4x0x0 0",
      "x x       x x",
      "0x0x0x6x5x0 0",
      "x         x x",
      "0 0x0x7x0x0 0",
      "x   x x   x x",
      "9x0x0x8 0xAxG"
    ],
    mapping: { "A": 10 }
  },
  {
    id: "floor_7",
    name: "奈落の底",
    layout: [
      "Sx1x0 0x0x0x2x0",
      "    x     x   x",
      "0x0 0x0x0x0 0x0",
      "x x         x  ",
      "8 7x0x0 0x0 0 0",
      "x x   x x x x x",
      "0 0 0x0 5 0 0 0",
      "  x     x x x x",
      "0x0 0x0x0 0 3x0",
      "x   x     x   x",
      "6x0 0 9x0 0x0 0",
      "x x x   x x   x",
      "0 0x0 0x0 4 0x0",
      "x     x x x x  ",
      "0x0x0x0 0 0xAxG"
    ],
    mapping: { "A": 10 }
  },
  {
    id: "floor_8",
    name: "時空の歪み",
    layout: [
      "Sx1x0x0x0x0 0x3x0",
      "          x x   x",
      "0 0x8x0x0 0 0 0x0",
      "x x     x x   x x",
      "0x0x0x0 0 0x0 0 0",
      "x       x   x x x",
      "0x9 0x0x0x0 0 0 0",
      "    x x     x x x",
      "6x0 7 0 0x0 2x0 0",
      "x x x   x x     x",
      "0 0 0x0 5 0x0x0 0",
      "x x   x x x     x",
      "0 0x0x0 0 0 0x0 A",
      "x       x x x x x",
      "0x0x0x0x0 0x4 0xG"
    ],
    mapping: { "A": 10 }
  },
  {
    id: "floor_9",
    name: "無の空間",
    layout: [
      "Sx1 0x2x0x0 0x0 3",
      "  x     x x x x x",
      "0x0 0x0x0 0x0 0x0",
      "x   x           x",
      "0x0x0 0x0 0x0x0 0",
      "      x x   x x x",
      "5x0x0x0 0x0 0 7 0",
      "x   x     x x x x",
      "0 0 0x0x0 0x0 0 0",
      "x x     x       x",
      "0x0 0x0 0x0x4x0 0",
      "  x x x       x x",
      "0 6x0 0x0 9x0 0 0",
      "x       x   x x x",
      "0x0x0x0x0 0x0 0x0",
      "x         x x    ",
      "8x0x0x0x0x0 0xAxG"
    ],
    mapping: { "A": 10 }
  },
  {
    id: "floor_10",
    name: "算術の頂点",
    layout: [
      "Sx1x0 0x0x0x0 8x0x0",
      "    x     x x x x  ",
      "0 0x0 0x0 0 0 0 0x0",
      "x x   x x x x x   x",
      "0x0 0x0 0 9 0x0 7x0",
      "x     x x       x  ",
      "0x0x0 0 0 0x0x0 0x0",
      "    x x x x   x x x",
      "5x0 0x2 0 0x0 0 0 0",
      "x x     x x x x   x",
      "0 0x0 0x0 0 0 0 0x0",
      "x x x x     x x x x",
      "0 0 0 3x0 0x4 6x0 0",
      "x x     x x       x",
      "0 0x0x0 0 0 0x0 0x0",
      "x   x   x x x   x  ",
      "0x0 0x0x0x0 0x0xAxG"
    ],
    mapping: { "A": 10 }
  }
];
