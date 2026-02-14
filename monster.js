let STAGE_MASTER = [
	{
		floor: "始まりの森",
		bg: "#1a2e1a",
		stages: [
			{ id: 1, name: "森の入り口",
				enemies: [
					{ name: "算数蟻", sprite: "🐜", hp: 50, atk: 4, def: 2, spd: 15, exp: 60 }
				] },
			{ id: 2, name: "静かな茂み",
				enemies: [
					{ name: "スライム", sprite: "💧", hp: 40, atk: 6, def: 0, spd: 12, exp: 40 },
					{ name: "スライム", sprite: "💧", hp: 40, atk: 6, def: 0, spd: 14, exp: 40 }
				] },
			{ id: 3, name: "学びの広場",
				enemies: [
					{ name: "計算バチ", sprite: "🐝", hp: 120, atk: 12, def: 5, spd: 10, exp: 120 }
				] },
			{ id: 4, name: "防壁の道",
				enemies: [
					{ name: "てつかぶと", sprite: "🐚", hp: 180, atk: 10, def: 18, spd: 15, exp: 150 },
					{ name: "スライム", sprite: "💧", hp: 60, atk: 8, def: 2, spd: 12, exp: 50 }
				] },
			{ id: 5, name: "森の番人",
				enemies: [
					{ name: "【中BOSS】ウッドゴーレム", sprite: "🌲", hp: 800, atk: 18, def: 25, spd: 18, exp: 1000 }
				] },
			{ id: 6, name: "加速の小道",
				enemies: [
					{ name: "はやぶさ", sprite: "🦅", hp: 150, atk: 15, def: 10, spd: 6, exp: 250 },
					{ name: "はやぶさ", sprite: "🦅", hp: 150, atk: 15, def: 10, spd: 7, exp: 250 }
				] },
			{ id: 7, name: "暗い沼地",
				enemies: [
					{ name: "どくがえる", sprite: "🐸", hp: 300, atk: 25, def: 20, spd: 10, exp: 400 }
				] },
			{ id: 8, name: "魔導の廃墟",
				enemies: [
					{ name: "ウィザード", sprite: "🧙", hp: 450, atk: 40, def: 15, spd: 14, exp: 600 },
					{ name: "骨兵", sprite: "💀", hp: 200, atk: 20, def: 35, spd: 9, exp: 400 }
				] },
			{ id: 9, name: "王の間への試練",
				enemies: [
					{ name: "キラービー", sprite: "🐝", hp: 200, atk: 30, def: 10, spd: 4, exp: 300 },
					{ name: "キラービー", sprite: "🐝", hp: 200, atk: 30, def: 10, spd: 5, exp: 300 }
				] },
			{ id: 10, name: "森の主",
				enemies: [
					{ name: "【BOSS】鉄仮面", sprite: "👺", hp: 3500, atk: 60, def: 45, spd: 12, exp: 5000 }
				] }
		] },
	{
		floor: "灼熱の洞窟",
		bg: "#451a1a",
		stages: [
			{ id: 1, name: "熱気の洗礼",
				enemies: [
					{ name: "火の粉", sprite: "🔥", hp: 400, atk: 45, def: 30, spd: 10, exp: 600 }
				] },
			{ id: 2, name: "溶岩の淵",
				enemies: [
					{ name: "マグマ虫", sprite: "🐛", hp: 500, atk: 50, def: 50, spd: 12, exp: 700 }
				] },
			{ id: 3, name: "焦熱の回廊",
				enemies: [
					{ name: "レッドスライム", sprite: "🔴", hp: 450, atk: 55, def: 40, spd: 8, exp: 800 },
					{ name: "レッドスライム", sprite: "🔴", hp: 450, atk: 55, def: 40, spd: 9, exp: 800 }
				] },
			{ id: 4, name: "火炎の壁",
				enemies: [
					{ name: "フレイム壁", sprite: "🧱", hp: 1200, atk: 40, def: 80, spd: 20, exp: 1200 }
				] },
			{ id: 5, name: "洞窟の番人",
				enemies: [
					{ name: "【中BOSS】サラマンダー", sprite: "🦎", hp: 5000, atk: 80, def: 70, spd: 15, exp: 8000 }
				] },
			{ id: 6, name: "煙る横穴",
				enemies: [
					{ name: "コウモリ", sprite: "🦇", hp: 600, atk: 70, def: 40, spd: 5, exp: 900 }
				] },
			{ id: 7, name: "猛火の試練",
				enemies: [
					{ name: "炎の精霊", sprite: "👻", hp: 1500, atk: 100, def: 60, spd: 12, exp: 1500 }
				] },
			{ id: 8, name: "マグマの滝",
				enemies: [
					{ name: "溶岩竜の幼体", sprite: "🐲", hp: 2500, atk: 120, def: 100, spd: 18, exp: 2500 }
				] },
			{ id: 9, name: "噴火寸前",
				enemies: [
					{ name: "火球", sprite: "☄️", hp: 800, atk: 150, def: 20, spd: 4, exp: 1000 },
					{ name: "火球", sprite: "☄️", hp: 800, atk: 150, def: 20, spd: 5, exp: 1000 }
				] },
			{ id: 10, name: "洞窟の王",
				enemies: [
					{ name: "【BOSS】魔炎将軍", sprite: "👹", hp: 15000, atk: 180, def: 120, spd: 14, exp: 20000 }
				] }
		] },
	{
		floor: "静寂の氷河",
		bg: "#1a3a4a",
		stages: [
			{ id: 1, name: "凍てつく風",
				enemies: [
					{ name: "雪玉", sprite: "❄️", hp: 1200, atk: 120, def: 100, spd: 12, exp: 2000 }
				] },
			{ id: 2, name: "氷結の湖畔",
				enemies: [
					{ name: "ペンギン", sprite: "🐧", hp: 1500, atk: 140, def: 120, spd: 9, exp: 2500 }
				] },
			{ id: 3, name: "白銀の世界",
				enemies: [
					{ name: "雪男", sprite: "👣", hp: 3000, atk: 200, def: 150, spd: 20, exp: 4000 }
				] },
			{ id: 4, name: "ダイヤモンドダスト",
				enemies: [
					{ name: "氷の破片", sprite: "💎", hp: 800, atk: 250, def: 80, spd: 4, exp: 3000 }
				] },
			{ id: 5, name: "氷壁の守護者",
				enemies: [
					{ name: "【中BOSS】アイシクルゴーレム", sprite: "🧊", hp: 12000, atk: 250, def: 300, spd: 25, exp: 15000 }
				] },
			{ id: 6, name: "永久凍土",
				enemies: [
					{ name: "冬の精霊", sprite: "🌬️", hp: 2000, atk: 220, def: 180, spd: 8, exp: 4500 }
				] },
			{ id: 7, name: "吹雪の迷宮",
				enemies: [
					{ name: "雪狼", sprite: "🐺", hp: 2500, atk: 280, def: 150, spd: 6, exp: 5000 }
				] },
			{ id: 8, name: "氷獄への階段",
				enemies: [
					{ name: "氷の騎士", sprite: "🤺", hp: 5000, atk: 350, def: 400, spd: 15, exp: 8000 }
				] },
			{ id: 9, name: "極寒の絶頂",
				enemies: [
					{ name: "吹雪の核", sprite: "🌀", hp: 3000, atk: 400, def: 200, spd: 5, exp: 7000 }
				] },
			{ id: 10, name: "氷河の帝王",
				enemies: [
					{ name: "【BOSS】氷竜", sprite: "🐉", hp: 45000, atk: 500, def: 500, spd: 18, exp: 60000 }
				] }
		] },
	{
		floor: "黄金の砂漠",
		bg: "#4a4a1a",
		stages: [
			{ id: 1, name: "陽炎の地",
				enemies: [
					{ name: "砂蠍", sprite: "🦂", hp: 4000, atk: 400, def: 350, spd: 8, exp: 10000 }
				] },
			{ id: 2, name: "流砂の罠",
				enemies: [
					{ name: "砂嵐", sprite: "🌪️", hp: 3500, atk: 450, def: 300, spd: 6, exp: 11000 }
				] },
			{ id: 3, name: "オアシスの影",
				enemies: [
					{ name: "ミイラ", sprite: "🧟", hp: 8000, atk: 500, def: 400, spd: 15, exp: 15000 }
				] },
			{ id: 4, name: "黄金の輝き",
				enemies: [
					{ name: "金貨兵", sprite: "💰", hp: 5000, atk: 600, def: 800, spd: 12, exp: 30000 }
				] },
			{ id: 5, name: "砂漠の門番",
				enemies: [
					{ name: "【中BOSS】スフィンクス", sprite: "🦁", hp: 35000, atk: 700, def: 600, spd: 20, exp: 80000 }
				] },
			{ id: 6, name: "熱砂の荒野",
				enemies: [
					{ name: "砂蛇", sprite: "🐍", hp: 6000, atk: 800, def: 450, spd: 5, exp: 20000 }
				] },
			{ id: 7, name: "蜃気楼の都",
				enemies: [
					{ name: "幻術師", sprite: "🔮", hp: 10000, atk: 950, def: 400, spd: 10, exp: 25000 }
				] },
			{ id: 8, name: "死の安息所",
				enemies: [
					{ name: "ファラオの影", sprite: "👤", hp: 15000, atk: 1100, def: 700, spd: 14, exp: 40000 }
				] },
			{ id: 9, name: "ピラミッド頂上",
				enemies: [
					{ name: "守護巨像", sprite: "🗿", hp: 25000, atk: 1500, def: 1200, spd: 25, exp: 60000 }
				] },
			{ id: 10, name: "砂漠の神",
				enemies: [
					{ name: "【BOSS】太陽神の化身", sprite: "🌞", hp: 120000, atk: 1800, def: 1000, spd: 15, exp: 200000 }
				] }
		] },
	{
		floor: "廃墟の機械都市",
		bg: "#2d2d2d",
		stages: [
			{ id: 1, name: "錆びた歯車",
				enemies: [
					{ name: "スクラップ君", sprite: "🤖", hp: 15000, atk: 1500, def: 1200, spd: 12, exp: 100000 }
				] },
			{ id: 2, name: "送電ライン",
				enemies: [
					{ name: "スパーク丸", sprite: "⚡", hp: 12000, atk: 2000, def: 800, spd: 5, exp: 120000 }
				] },
			{ id: 3, name: "廃棄物処理場",
				enemies: [
					{ name: "プレス機", sprite: "🏗️", hp: 30000, atk: 2500, def: 2000, spd: 20, exp: 150000 }
				] },
			{ id: 4, name: "自動防衛網",
				enemies: [
					{ name: "ドローン", sprite: "🛸", hp: 10000, atk: 1800, def: 1500, spd: 3, exp: 130000 }
				] },
			{ id: 5, name: "都市の管理者",
				enemies: [
					{ name: "【中BOSS】ガードユニット", sprite: "🛡️", hp: 80000, atk: 3000, def: 4000, spd: 18, exp: 500000 }
				] },
			{ id: 6, name: "電脳の海",
				enemies: [
					{ name: "ウイルス", sprite: "👾", hp: 20000, atk: 3500, def: 1000, spd: 6, exp: 200000 }
				] },
			{ id: 7, name: "深層回路",
				enemies: [
					{ name: "チップ兵", sprite: "🎴", hp: 25000, atk: 4000, def: 2500, spd: 8, exp: 250000 }
				] },
			{ id: 8, name: "強制終了エリア",
				enemies: [
					{ name: "バグ", sprite: "🚫", hp: 40000, atk: 5000, def: 3000, spd: 10, exp: 400000 }
				] },
			{ id: 9, name: "中枢への扉",
				enemies: [
					{ name: "レーザーゲート", sprite: "🚨", hp: 50000, atk: 6000, def: 5000, spd: 15, exp: 600000 }
				] },
			{ id: 10, name: "都市の心臓",
				enemies: [
					{ name: "【BOSS】マザーフレーム", sprite: "💻", hp: 300000, atk: 8000, def: 6000, spd: 12, exp: 2000000 }
				] }
		] },
	{
		floor: "幻想の天空城",
		bg: "#1a4a6e",
		stages: [
			{ id: 1, name: "雲の上の階段",
				enemies: [
					{ name: "雷雲", sprite: "☁️", hp: 50000, atk: 7000, def: 5000, spd: 10, exp: 1000000 }
				] },
			{ id: 2, name: "浮遊庭園",
				enemies: [
					{ name: "天空の花", sprite: "🌸", hp: 60000, atk: 8000, def: 4000, spd: 8, exp: 1200000 }
				] },
			{ id: 3, name: "翼の通り道",
				enemies: [
					{ name: "グリフィン", sprite: "🦅", hp: 80000, atk: 10000, def: 6000, spd: 6, exp: 1500000 }
				] },
			{ id: 4, name: "空の防衛線",
				enemies: [
					{ name: "天使兵", sprite: "👼", hp: 100000, atk: 12000, def: 8000, spd: 12, exp: 2000000 }
				] },
			{ id: 5, name: "城の守護獣",
				enemies: [
					{ name: "【中BOSS】天空の巨神", sprite: "🔱", hp: 500000, atk: 15000, def: 12000, spd: 20, exp: 10000000 }
				] },
			{ id: 6, name: "光の回廊",
				enemies: [
					{ name: "閃光", sprite: "✨", hp: 70000, atk: 18000, def: 5000, spd: 3, exp: 3000000 }
				] },
			{ id: 7, name: "聖なる広場",
				enemies: [
					{ name: "ユニコーン", sprite: "🦄", hp: 150000, atk: 20000, def: 10000, spd: 5, exp: 4000000 }
				] },
			{ id: 8, name: "裁きの間",
				enemies: [
					{ name: "審判の秤", sprite: "⚖️", hp: 200000, atk: 25000, def: 20000, spd: 15, exp: 6000000 }
				] },
			{ id: 9, name: "王座への道",
				enemies: [
					{ name: "近衛騎士", sprite: "🛡️", hp: 300000, atk: 30000, def: 30000, spd: 10, exp: 8000000 }
				] },
			{ id: 10, name: "天空の覇者",
				enemies: [
					{ name: "【BOSS】神龍", sprite: "🐉", hp: 1000000, atk: 40000, def: 40000, spd: 14, exp: 50000000 }
				] }
		] },
	{
		floor: "奈落の底",
		bg: "#110a11",
		stages: [
			{ id: 1, name: "地獄の業火",
				enemies: [
					{ name: "デビル", sprite: "😈", hp: 250000, atk: 45000, def: 35000, spd: 8, exp: 20000000 }
				] },
			{ id: 2, name: "死の河",
				enemies: [
					{ name: "亡霊", sprite: "👻", hp: 200000, atk: 50000, def: 20000, spd: 6, exp: 22000000 }
				] },
			{ id: 3, name: "嘆きの壁",
				enemies: [
					{ name: "壁霊", sprite: "🧱", hp: 600000, atk: 40000, def: 80000, spd: 20, exp: 30000000 }
				] },
			{ id: 4, name: "闇の深淵",
				enemies: [
					{ name: "影", sprite: "👤", hp: 300000, atk: 60000, def: 40000, spd: 4, exp: 25000000 }
				] },
			{ id: 5, name: "門衛ケルベロス",
				enemies: [
					{ name: "【中BOSS】三頭犬", sprite: "🐕", hp: 2000000, atk: 80000, def: 100000, spd: 12, exp: 100000000 }
				] },
			{ id: 6, name: "骨の山",
				enemies: [
					{ name: "巨大骨", sprite: "☠️", hp: 500000, atk: 90000, def: 60000, spd: 10, exp: 50000000 }
				] },
			{ id: 7, name: "魂の選別",
				enemies: [
					{ name: "死神", sprite: "💀", hp: 400000, atk: 120000, def: 50000, spd: 6, exp: 60000000 }
				] },
			{ id: 8, name: "絶望の牢獄",
				enemies: [
					{ name: "囚人霊", sprite: "🔗", hp: 800000, atk: 100000, def: 120000, spd: 15, exp: 80000000 }
				] },
			{ id: 9, name: "魔王の門",
				enemies: [
					{ name: "ガーゴイル", sprite: "🦇", hp: 1000000, atk: 150000, def: 150000, spd: 8, exp: 120000000 }
				] },
			{ id: 10, name: "冥府の王",
				enemies: [
					{ name: "【BOSS】魔王サタン", sprite: "👑", hp: 5000000, atk: 200000, def: 250000, spd: 10, exp: 500000000 }
				] }
		] },
	{
		floor: "時空の歪み",
		bg: "#2a0a4a",
		stages: [
			{ id: 1, name: "過去の残響",
				enemies: [
					{ name: "古代虫", sprite: "🐜", hp: 1500000, atk: 250000, def: 200000, spd: 10, exp: 300000000 }
				] },
			{ id: 2, name: "未来の断片",
				enemies: [
					{ name: "光子兵", sprite: "✨", hp: 1200000, atk: 300000, def: 150000, spd: 5, exp: 350000000 }
				] },
			{ id: 3, name: "時の砂時計",
				enemies: [
					{ name: "時計守", sprite: "⏳", hp: 3000000, atk: 350000, def: 300000, spd: 15, exp: 500000000 }
				] },
			{ id: 4, name: "空間の裂け目",
				enemies: [
					{ name: "ボイド", sprite: "🕳️", hp: 2000000, atk: 400000, def: 250000, spd: 3, exp: 400000000 }
				] },
			{ id: 5, name: "時の番人",
				enemies: [
					{ name: "【中BOSS】クロノス", sprite: "⌛", hp: 15000000, atk: 500000, def: 600000, spd: 20, exp: 2000000000 }
				] },
			{ id: 6, name: "因果の糸",
				enemies: [
					{ name: "糸使い", sprite: "🧵", hp: 4000000, atk: 600000, def: 400000, spd: 8, exp: 800000000 }
				] },
			{ id: 7, name: "パラレルワールド",
				enemies: [
					{ name: "影の自分", sprite: "👤", hp: 5000000, atk: 700000, def: 500000, spd: 6, exp: 1000000000 }
				] },
			{ id: 8, name: "逆行する時間",
				enemies: [
					{ name: "時計仕掛け", sprite: "⚙️", hp: 8000000, atk: 800000, def: 1000000, spd: 12, exp: 1500000000 }
				] },
			{ id: 9, name: "終焉の予兆",
				enemies: [
					{ name: "彗星", sprite: "☄️", hp: 6000000, atk: 1000000, def: 800000, spd: 4, exp: 1200000000 }
				] },
			{ id: 10, name: "時空の覇者",
				enemies: [
					{ name: "【BOSS】エターナル", sprite: "🪐", hp: 40000000, atk: 1500000, def: 1500000, spd: 15, exp: 10000000000 }
				] }
		] },
	{
		floor: "無の空間",
		bg: "#000000",
		stages: [
			{ id: 1, name: "存在の消失",
				enemies: [
					{ name: "虚無", sprite: "🕳️", hp: 10000000, atk: 2000000, def: 2000000, spd: 10, exp: 0 }
				] },
			{ id: 2, name: "色のない世界",
				enemies: [
					{ name: "白", sprite: "⚪", hp: 12000000, atk: 2500000, def: 1500000, spd: 6, exp: 0 }
				] },
			{ id: 3, name: "音のない世界",
				enemies: [
					{ name: "静寂", sprite: "🔈", hp: 15000000, atk: 3000000, def: 3000000, spd: 15, exp: 0 }
				] },
			{ id: 4, name: "光のない世界",
				enemies: [
					{ name: "闇", sprite: "⚫", hp: 20000000, atk: 4000000, def: 4000000, spd: 4, exp: 0 }
				] },
			{ id: 5, name: "無の番人",
				enemies: [
					{ name: "【中BOSS】ゼロ", sprite: "0", hp: 100000000, atk: 6000000, def: 10000000, spd: 20, exp: 0 }
				] },
			{ id: 6, name: "思考の停止",
				enemies: [
					{ name: "問い", sprite: "❓", hp: 30000000, atk: 8000000, def: 5000000, spd: 8, exp: 0 }
				] },
			{ id: 7, name: "記憶の崩壊",
				enemies: [
					{ name: "欠片", sprite: "🧩", hp: 40000000, atk: 10000000, def: 8000000, spd: 5, exp: 0 }
				] },
			{ id: 8, name: "法則の破綻",
				enemies: [
					{ name: "バグ", sprite: "⚠️", hp: 60000000, atk: 15000000, def: 12000000, spd: 12, exp: 0 }
				] },
			{ id: 9, name: "最後の問い",
				enemies: [
					{ name: "答え", sprite: "❗", hp: 80000000, atk: 20000000, def: 15000000, spd: 4, exp: 0 }
				] },
			{ id: 10, name: "無の深淵",
				enemies: [
					{ name: "【BOSS】ボイドロード", sprite: "👁️", hp: 500000000, atk: 50000000, def: 50000000, spd: 15, exp: 0 }
				] }
		] },
	{
		floor: "算術の頂点",
		bg: "#ffffff",
		stages: [
			{ id: 1, name: "1の試練",
				enemies: [
					{ name: "壱", sprite: "1", hp: 200000000, atk: 80000000, def: 80000000, spd: 10, exp: 0 }
				] },
			{ id: 2, name: "2の試練",
				enemies: [
					{ name: "弐", sprite: "2", hp: 300000000, atk: 100000000, def: 100000000, spd: 9, exp: 0 }
				] },
			{ id: 3, name: "3の試練",
				enemies: [
					{ name: "参", sprite: "3", hp: 400000000, atk: 120000000, def: 120000000, spd: 8, exp: 0 }
				] },
			{ id: 4, name: "4の試練",
				enemies: [
					{ name: "肆", sprite: "4", hp: 500000000, atk: 150000000, def: 150000000, spd: 7, exp: 0 }
				] },
			{ id: 5, name: "5の試練",
				enemies: [
					{ name: "伍", sprite: "5", hp: 600000000, atk: 200000000, def: 200000000, spd: 6, exp: 0 }
				] },
			{ id: 6, name: "6の試練",
				enemies: [
					{ name: "陸", sprite: "6", hp: 700000000, atk: 300000000, def: 300000000, spd: 5, exp: 0 }
				] },
			{ id: 7, name: "7の試練",
				enemies: [
					{ name: "漆", sprite: "7", hp: 800000000, atk: 400000000, def: 400000000, spd: 4, exp: 0 }
				] },
			{ id: 8, name: "8の試練",
				enemies: [
					{ name: "捌", sprite: "8", hp: 900000000, atk: 500000000, def: 500000000, spd: 3, exp: 0 }
				] },
			{ id: 9, name: "9の試練",
				enemies: [
					{ name: "玖", sprite: "9", hp: 1000000000, atk: 1000000000, def: 1000000000, spd: 2, exp: 0 }
				] },
			{ id: 10, name: "算術の神",
				enemies: [
					{ name: "【GOD】アルキメデス", sprite: "📐", hp: 9999999999, atk: 999999999, def: 999999999, spd: 10, exp: 0 }
				] }
		] }
];