// monster.js
// scripts/balance_monsters.js により再バランス生成(プレイヤーのレベル上昇を加味)。
// 名前/絵文字/敵数/spd は保持し、hp/atk/def/exp をフロア別の想定レベルに合わせて再計算。
let STAGE_MASTER = [
	{
		floor: "始まりの森",
		bg: "#1a2e1a",
		stages: [
			{ id: 1, name: "森の入り口",
				enemies: [
					{ name: "算数蟻", sprite: "🐜", hp: 98, atk: 11, def: 1, spd: 15, exp: 10 }
				] },
			{ id: 2, name: "静かな茂み",
				enemies: [
					{ name: "スライム", sprite: "💧", hp: 93, atk: 12, def: 0, spd: 12, exp: 10 },
					{ name: "スライム", sprite: "💧", hp: 93, atk: 12, def: 0, spd: 14, exp: 10 }
				] },
			{ id: 3, name: "学びの広場",
				enemies: [
					{ name: "計算バチ", sprite: "🐝", hp: 130, atk: 15, def: 3, spd: 10, exp: 10 }
				] },
			{ id: 4, name: "防壁の道",
				enemies: [
					{ name: "てつかぶと", sprite: "🐚", hp: 157, atk: 14, def: 11, spd: 15, exp: 10 },
					{ name: "スライム", sprite: "💧", hp: 102, atk: 13, def: 1, spd: 12, exp: 10 }
				] },
			{ id: 5, name: "森の番人",
				enemies: [
					{ name: "【中BOSS】ウッドゴーレム", sprite: "🌲", hp: 400, atk: 24, def: 8, spd: 18, exp: 58 }
				] },
			{ id: 6, name: "加速の小道",
				enemies: [
					{ name: "はやぶさ", sprite: "🦅", hp: 143, atk: 17, def: 6, spd: 6, exp: 10 },
					{ name: "はやぶさ", sprite: "🦅", hp: 143, atk: 17, def: 6, spd: 7, exp: 10 }
				] },
			{ id: 7, name: "暗い沼地",
				enemies: [
					{ name: "どくがえる", sprite: "🐸", hp: 212, atk: 22, def: 12, spd: 10, exp: 10 }
				] },
			{ id: 8, name: "魔導の廃墟",
				enemies: [
					{ name: "ウィザード", sprite: "🧙", hp: 280, atk: 30, def: 9, spd: 14, exp: 10 },
					{ name: "骨兵", sprite: "💀", hp: 166, atk: 19, def: 21, spd: 9, exp: 10 }
				] },
			{ id: 9, name: "王の間への試練",
				enemies: [
					{ name: "キラービー", sprite: "🐝", hp: 166, atk: 24, def: 6, spd: 4, exp: 10 },
					{ name: "キラービー", sprite: "🐝", hp: 166, atk: 24, def: 6, spd: 5, exp: 10 }
				] },
			{ id: 10, name: "森の主",
				enemies: [
					{ name: "【BOSS】鉄仮面", sprite: "👺", hp: 800, atk: 29, def: 9, spd: 12, exp: 116 }
				] }
		] },
	{
		floor: "灼熱の洞窟",
		bg: "#451a1a",
		stages: [
			{ id: 1, name: "熱気の洗礼",
				enemies: [
					{ name: "火の粉", sprite: "🔥", hp: 237, atk: 32, def: 9, spd: 10, exp: 27 }
				] },
			{ id: 2, name: "溶岩の淵",
				enemies: [
					{ name: "マグマ虫", sprite: "🐛", hp: 255, atk: 34, def: 14, spd: 12, exp: 27 }
				] },
			{ id: 3, name: "焦熱の回廊",
				enemies: [
					{ name: "レッドスライム", sprite: "🔴", hp: 246, atk: 35, def: 11, spd: 8, exp: 27 },
					{ name: "レッドスライム", sprite: "🔴", hp: 246, atk: 35, def: 11, spd: 9, exp: 27 }
				] },
			{ id: 4, name: "火炎の壁",
				enemies: [
					{ name: "フレイム壁", sprite: "🧱", hp: 380, atk: 31, def: 23, spd: 20, exp: 27 }
				] },
			{ id: 5, name: "洞窟の番人",
				enemies: [
					{ name: "【中BOSS】サラマンダー", sprite: "🦎", hp: 880, atk: 55, def: 17, spd: 15, exp: 161 }
				] },
			{ id: 6, name: "煙る横穴",
				enemies: [
					{ name: "コウモリ", sprite: "🦇", hp: 273, atk: 39, def: 11, spd: 5, exp: 27 }
				] },
			{ id: 7, name: "猛火の試練",
				enemies: [
					{ name: "炎の精霊", sprite: "👻", hp: 434, atk: 46, def: 17, spd: 12, exp: 27 }
				] },
			{ id: 8, name: "マグマの滝",
				enemies: [
					{ name: "溶岩竜の幼体", sprite: "🐲", hp: 613, atk: 51, def: 29, spd: 18, exp: 27 }
				] },
			{ id: 9, name: "噴火寸前",
				enemies: [
					{ name: "火球", sprite: "☄️", hp: 308, atk: 59, def: 6, spd: 4, exp: 27 },
					{ name: "火球", sprite: "☄️", hp: 308, atk: 59, def: 6, spd: 5, exp: 27 }
				] },
			{ id: 10, name: "洞窟の王",
				enemies: [
					{ name: "【BOSS】魔炎将軍", sprite: "👹", hp: 1760, atk: 67, def: 19, spd: 14, exp: 321 }
				] }
		] },
	{
		floor: "静寂の氷河",
		bg: "#1a3a4a",
		stages: [
			{ id: 1, name: "凍てつく風",
				enemies: [
					{ name: "雪玉", sprite: "❄️", hp: 384, atk: 50, def: 12, spd: 12, exp: 46 }
				] },
			{ id: 2, name: "氷結の湖畔",
				enemies: [
					{ name: "ペンギン", sprite: "🐧", hp: 416, atk: 52, def: 15, spd: 9, exp: 46 }
				] },
			{ id: 3, name: "白銀の世界",
				enemies: [
					{ name: "雪男", sprite: "👣", hp: 577, atk: 60, def: 18, spd: 20, exp: 46 }
				] },
			{ id: 4, name: "ダイヤモンドダスト",
				enemies: [
					{ name: "氷の破片", sprite: "💎", hp: 341, atk: 67, def: 10, spd: 4, exp: 46 }
				] },
			{ id: 5, name: "氷壁の守護者",
				enemies: [
					{ name: "【中BOSS】アイシクルゴーレム", sprite: "🧊", hp: 1360, atk: 87, def: 26, spd: 25, exp: 277 }
				] },
			{ id: 6, name: "永久凍土",
				enemies: [
					{ name: "冬の精霊", sprite: "🌬️", hp: 470, atk: 63, def: 22, spd: 8, exp: 46 }
				] },
			{ id: 7, name: "吹雪の迷宮",
				enemies: [
					{ name: "雪狼", sprite: "🐺", hp: 523, atk: 71, def: 18, spd: 6, exp: 46 }
				] },
			{ id: 8, name: "氷獄への階段",
				enemies: [
					{ name: "氷の騎士", sprite: "🤺", hp: 792, atk: 81, def: 49, spd: 15, exp: 46 }
				] },
			{ id: 9, name: "極寒の絶頂",
				enemies: [
					{ name: "吹雪の核", sprite: "🌀", hp: 577, atk: 88, def: 25, spd: 5, exp: 46 }
				] },
			{ id: 10, name: "氷河の帝王",
				enemies: [
					{ name: "【BOSS】氷竜", sprite: "🐉", hp: 2720, atk: 105, def: 30, spd: 18, exp: 554 }
				] }
		] },
	{
		floor: "黄金の砂漠",
		bg: "#4a4a1a",
		stages: [
			{ id: 1, name: "陽炎の地",
				enemies: [
					{ name: "砂蠍", sprite: "🦂", hp: 489, atk: 69, def: 18, spd: 8, exp: 63 }
				] },
			{ id: 2, name: "流砂の罠",
				enemies: [
					{ name: "砂嵐", sprite: "🌪️", hp: 471, atk: 72, def: 15, spd: 6, exp: 63 }
				] },
			{ id: 3, name: "オアシスの影",
				enemies: [
					{ name: "ミイラ", sprite: "🧟", hp: 634, atk: 74, def: 20, spd: 15, exp: 63 }
				] },
			{ id: 4, name: "黄金の輝き",
				enemies: [
					{ name: "金貨兵", sprite: "💰", hp: 525, atk: 80, def: 40, spd: 12, exp: 63 }
				] },
			{ id: 5, name: "砂漠の門番",
				enemies: [
					{ name: "【中BOSS】スフィンクス", sprite: "🦁", hp: 1840, atk: 119, def: 35, spd: 20, exp: 381 }
				] },
			{ id: 6, name: "熱砂の荒野",
				enemies: [
					{ name: "砂蛇", sprite: "🐍", hp: 561, atk: 92, def: 23, spd: 5, exp: 63 }
				] },
			{ id: 7, name: "蜃気楼の都",
				enemies: [
					{ name: "幻術師", sprite: "🔮", hp: 706, atk: 100, def: 20, spd: 10, exp: 63 }
				] },
			{ id: 8, name: "死の安息所",
				enemies: [
					{ name: "ファラオの影", sprite: "👤", hp: 886, atk: 109, def: 35, spd: 14, exp: 63 }
				] },
			{ id: 9, name: "ピラミッド頂上",
				enemies: [
					{ name: "守護巨像", sprite: "🗿", hp: 1247, atk: 132, def: 60, spd: 25, exp: 63 }
				] },
			{ id: 10, name: "砂漠の神",
				enemies: [
					{ name: "【BOSS】太陽神の化身", sprite: "🌞", hp: 3680, atk: 143, def: 40, spd: 15, exp: 762 }
				] }
		] },
	{
		floor: "廃墟の機械都市",
		bg: "#2d2d2d",
		stages: [
			{ id: 1, name: "錆びた歯車",
				enemies: [
					{ name: "スクラップ君", sprite: "🤖", hp: 693, atk: 84, def: 20, spd: 12, exp: 81 }
				] },
			{ id: 2, name: "送電ライン",
				enemies: [
					{ name: "スパーク丸", sprite: "⚡", hp: 642, atk: 93, def: 14, spd: 5, exp: 81 }
				] },
			{ id: 3, name: "廃棄物処理場",
				enemies: [
					{ name: "プレス機", sprite: "🏗️", hp: 952, atk: 102, def: 34, spd: 20, exp: 81 }
				] },
			{ id: 4, name: "自動防衛網",
				enemies: [
					{ name: "ドローン", sprite: "🛸", hp: 607, atk: 89, def: 26, spd: 3, exp: 81 }
				] },
			{ id: 5, name: "都市の管理者",
				enemies: [
					{ name: "【中BOSS】ガードユニット", sprite: "🛡️", hp: 2320, atk: 151, def: 44, spd: 18, exp: 485 }
				] },
			{ id: 6, name: "電脳の海",
				enemies: [
					{ name: "ウイルス", sprite: "👾", hp: 780, atk: 119, def: 17, spd: 6, exp: 81 }
				] },
			{ id: 7, name: "深層回路",
				enemies: [
					{ name: "チップ兵", sprite: "🎴", hp: 866, atk: 128, def: 43, spd: 8, exp: 81 }
				] },
			{ id: 8, name: "強制終了エリア",
				enemies: [
					{ name: "バグ", sprite: "🚫", hp: 1124, atk: 146, def: 51, spd: 10, exp: 81 }
				] },
			{ id: 9, name: "中枢への扉",
				enemies: [
					{ name: "レーザーゲート", sprite: "🚨", hp: 1296, atk: 163, def: 85, spd: 15, exp: 81 }
				] },
			{ id: 10, name: "都市の心臓",
				enemies: [
					{ name: "【BOSS】マザーフレーム", sprite: "💻", hp: 4640, atk: 181, def: 51, spd: 12, exp: 969 }
				] }
		] },
	{
		floor: "幻想の天空城",
		bg: "#1a4a6e",
		stages: [
			{ id: 1, name: "雲の上の階段",
				enemies: [
					{ name: "雷雲", sprite: "☁️", hp: 733, atk: 100, def: 20, spd: 10, exp: 98 }
				] },
			{ id: 2, name: "浮遊庭園",
				enemies: [
					{ name: "天空の花", sprite: "🌸", hp: 775, atk: 104, def: 16, spd: 8, exp: 98 }
				] },
			{ id: 3, name: "翼の通り道",
				enemies: [
					{ name: "グリフィン", sprite: "🦅", hp: 858, atk: 113, def: 24, spd: 6, exp: 98 }
				] },
			{ id: 4, name: "空の防衛線",
				enemies: [
					{ name: "天使兵", sprite: "👼", hp: 941, atk: 122, def: 32, spd: 12, exp: 98 }
				] },
			{ id: 5, name: "城の守護獣",
				enemies: [
					{ name: "【中BOSS】天空の巨神", sprite: "🔱", hp: 2800, atk: 183, def: 53, spd: 20, exp: 588 }
				] },
			{ id: 6, name: "光の回廊",
				enemies: [
					{ name: "閃光", sprite: "✨", hp: 816, atk: 147, def: 20, spd: 3, exp: 98 }
				] },
			{ id: 7, name: "聖なる広場",
				enemies: [
					{ name: "ユニコーン", sprite: "🦄", hp: 1149, atk: 156, def: 40, spd: 5, exp: 98 }
				] },
			{ id: 8, name: "裁きの間",
				enemies: [
					{ name: "審判の秤", sprite: "⚖️", hp: 1357, atk: 178, def: 80, spd: 15, exp: 98 }
				] },
			{ id: 9, name: "王座への道",
				enemies: [
					{ name: "近衛騎士", sprite: "🛡️", hp: 1773, atk: 199, def: 119, spd: 10, exp: 98 }
				] },
			{ id: 10, name: "天空の覇者",
				enemies: [
					{ name: "【BOSS】神龍", sprite: "🐉", hp: 5600, atk: 219, def: 61, spd: 14, exp: 1177 }
				] }
		] },
	{
		floor: "奈落の底",
		bg: "#110a11",
		stages: [
			{ id: 1, name: "地獄の業火",
				enemies: [
					{ name: "デビル", sprite: "😈", hp: 919, atk: 127, def: 26, spd: 8, exp: 115 }
				] },
			{ id: 2, name: "死の河",
				enemies: [
					{ name: "亡霊", sprite: "👻", hp: 858, atk: 132, def: 15, spd: 6, exp: 115 }
				] },
			{ id: 3, name: "嘆きの壁",
				enemies: [
					{ name: "壁霊", sprite: "🧱", hp: 1344, atk: 122, def: 59, spd: 20, exp: 115 }
				] },
			{ id: 4, name: "闇の深淵",
				enemies: [
					{ name: "影", sprite: "👤", hp: 979, atk: 142, def: 30, spd: 4, exp: 115 }
				] },
			{ id: 5, name: "門衛ケルベロス",
				enemies: [
					{ name: "【中BOSS】三頭犬", sprite: "🐕", hp: 3280, atk: 214, def: 62, spd: 12, exp: 692 }
				] },
			{ id: 6, name: "骨の山",
				enemies: [
					{ name: "巨大骨", sprite: "☠️", hp: 1222, atk: 173, def: 44, spd: 10, exp: 115 }
				] },
			{ id: 7, name: "魂の選別",
				enemies: [
					{ name: "死神", sprite: "💀", hp: 1101, atk: 203, def: 37, spd: 6, exp: 115 }
				] },
			{ id: 8, name: "絶望の牢獄",
				enemies: [
					{ name: "囚人霊", sprite: "🔗", hp: 1587, atk: 183, def: 89, spd: 15, exp: 115 }
				] },
			{ id: 9, name: "魔王の門",
				enemies: [
					{ name: "ガーゴイル", sprite: "🦇", hp: 1830, atk: 233, def: 111, spd: 8, exp: 115 }
				] },
			{ id: 10, name: "冥府の王",
				enemies: [
					{ name: "【BOSS】魔王サタン", sprite: "👑", hp: 6560, atk: 257, def: 72, spd: 10, exp: 1385 }
				] }
		] },
	{
		floor: "時空の歪み",
		bg: "#2a0a4a",
		stages: [
			{ id: 1, name: "過去の残響",
				enemies: [
					{ name: "古代虫", sprite: "🐜", hp: 981, atk: 137, def: 26, spd: 10, exp: 133 }
				] },
			{ id: 2, name: "未来の断片",
				enemies: [
					{ name: "光子兵", sprite: "✨", hp: 925, atk: 146, def: 20, spd: 5, exp: 133 }
				] },
			{ id: 3, name: "時の砂時計",
				enemies: [
					{ name: "時計守", sprite: "⏳", hp: 1256, atk: 154, def: 39, spd: 15, exp: 133 }
				] },
			{ id: 4, name: "空間の裂け目",
				enemies: [
					{ name: "ボイド", sprite: "🕳️", hp: 1072, atk: 163, def: 33, spd: 3, exp: 133 }
				] },
			{ id: 5, name: "時の番人",
				enemies: [
					{ name: "【中BOSS】クロノス", sprite: "⌛", hp: 3760, atk: 246, def: 71, spd: 20, exp: 796 }
				] },
			{ id: 6, name: "因果の糸",
				enemies: [
					{ name: "糸使い", sprite: "🧵", hp: 1440, atk: 197, def: 52, spd: 8, exp: 133 }
				] },
			{ id: 7, name: "パラレルワールド",
				enemies: [
					{ name: "影の自分", sprite: "👤", hp: 1624, atk: 215, def: 65, spd: 6, exp: 133 }
				] },
			{ id: 8, name: "逆行する時間",
				enemies: [
					{ name: "時計仕掛け", sprite: "⚙️", hp: 2175, atk: 232, def: 131, spd: 12, exp: 133 }
				] },
			{ id: 9, name: "終焉の予兆",
				enemies: [
					{ name: "彗星", sprite: "☄️", hp: 1807, atk: 266, def: 104, spd: 4, exp: 133 }
				] },
			{ id: 10, name: "時空の覇者",
				enemies: [
					{ name: "【BOSS】エターナル", sprite: "🪐", hp: 7520, atk: 295, def: 82, spd: 15, exp: 1592 }
				] }
		] },
	{
		floor: "無の空間",
		bg: "#000000",
		stages: [
			{ id: 1, name: "存在の消失",
				enemies: [
					{ name: "虚無", sprite: "🕳️", hp: 1033, atk: 133, def: 21, spd: 10, exp: 150 }
				] },
			{ id: 2, name: "色のない世界",
				enemies: [
					{ name: "白", sprite: "⚪", hp: 1081, atk: 140, def: 16, spd: 6, exp: 150 }
				] },
			{ id: 3, name: "音のない世界",
				enemies: [
					{ name: "静寂", sprite: "🔈", hp: 1152, atk: 146, def: 31, spd: 15, exp: 150 }
				] },
			{ id: 4, name: "光のない世界",
				enemies: [
					{ name: "闇", sprite: "⚫", hp: 1271, atk: 160, def: 42, spd: 4, exp: 150 }
				] },
			{ id: 5, name: "無の番人",
				enemies: [
					{ name: "【中BOSS】ゼロ", sprite: "0", hp: 4240, atk: 278, def: 80, spd: 20, exp: 900 }
				] },
			{ id: 6, name: "思考の停止",
				enemies: [
					{ name: "問い", sprite: "❓", hp: 1510, atk: 212, def: 52, spd: 8, exp: 150 }
				] },
			{ id: 7, name: "記憶の崩壊",
				enemies: [
					{ name: "欠片", sprite: "🧩", hp: 1748, atk: 239, def: 84, spd: 5, exp: 150 }
				] },
			{ id: 8, name: "法則の破綻",
				enemies: [
					{ name: "バグ", sprite: "⚠️", hp: 2224, atk: 305, def: 126, spd: 12, exp: 150 }
				] },
			{ id: 9, name: "最後の問い",
				enemies: [
					{ name: "答え", sprite: "❗", hp: 2701, atk: 371, def: 157, spd: 4, exp: 150 }
				] },
			{ id: 10, name: "無の深淵",
				enemies: [
					{ name: "【BOSS】ボイドロード", sprite: "👁️", hp: 8480, atk: 334, def: 93, spd: 15, exp: 1800 }
				] }
		] },
	{
		floor: "算術の頂点",
		bg: "#ffffff",
		stages: [
			{ id: 1, name: "1の試練",
				enemies: [
					{ name: "壱", sprite: "1", hp: 1180, atk: 148, def: 18, spd: 10, exp: 167 }
				] },
			{ id: 2, name: "2の試練",
				enemies: [
					{ name: "弐", sprite: "2", hp: 1328, atk: 155, def: 22, spd: 9, exp: 167 }
				] },
			{ id: 3, name: "3の試練",
				enemies: [
					{ name: "参", sprite: "3", hp: 1475, atk: 162, def: 27, spd: 8, exp: 167 }
				] },
			{ id: 4, name: "4の試練",
				enemies: [
					{ name: "肆", sprite: "4", hp: 1623, atk: 173, def: 33, spd: 7, exp: 167 }
				] },
			{ id: 5, name: "5の試練",
				enemies: [
					{ name: "伍", sprite: "5", hp: 4720, atk: 310, def: 89, spd: 6, exp: 1004 }
				] },
			{ id: 6, name: "6の試練",
				enemies: [
					{ name: "陸", sprite: "6", hp: 1918, atk: 226, def: 67, spd: 5, exp: 167 }
				] },
			{ id: 7, name: "7の試練",
				enemies: [
					{ name: "漆", sprite: "7", hp: 2065, atk: 262, def: 89, spd: 4, exp: 167 }
				] },
			{ id: 8, name: "8の試練",
				enemies: [
					{ name: "捌", sprite: "8", hp: 2213, atk: 298, def: 111, spd: 3, exp: 167 }
				] },
			{ id: 9, name: "9の試練",
				enemies: [
					{ name: "玖", sprite: "9", hp: 2360, atk: 478, def: 223, spd: 2, exp: 167 }
				] },
			{ id: 10, name: "算術の神",
				enemies: [
					{ name: "【GOD】アルキメデス", sprite: "📐", hp: 9440, atk: 372, def: 103, spd: 10, exp: 2008 }
				] }
		] }
];
