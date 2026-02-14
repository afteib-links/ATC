/* ========================================
   ダメージ計算関数（後で編集しやすいように分離）
   - コンボボーナス計算
   - 必殺技計算
   - 特殊攻撃ロジック
======================================== */

/**
 * 敵が麻痺状態化どうかをチェックし、敵を状態変化させます
 * @param {number} playerSpd - プレイヤーのSPD
 * @param {Object} enemy - 敵オブジェクト
 * @returns {boolean} 麻痺したかどうか
 */
function calculateParalysisChance(playerSpd, enemy) {
    const isBoss = enemy.name.includes('BOSS') || enemy.name.includes('ボス');
    
    // 敵の攻撃タイミングが5%以下かチェック
    const attackTimingPercent = (enemy.t / enemy.spd) * 100;
    if (attackTimingPercent > 5) return false; // 5%以下ではないので麻痺なし
    
    if (isBoss) {
        // BOSS敵は確率で麻痺
        const speedRatio = Math.min(playerSpd / enemy.spd, 3); // 最大3倍まで
        const paralysisChance = Math.max(0.01, Math.min(speedRatio / 3, 1)); // 1%～100%
        return Math.random() < paralysisChance;
    } else {
        // 通常敵は確定
        return true;
    }
}

/**
 * ダメージ計算関数
 * @param {Object} playerStats - プレイヤーステータス {atk, spd}
 * @param {Object} cardData - カードデータ {op, rank}
 * @param {Object} enemy - 敵オブジェクト {def, spd, t, name, ...}
 * @param {number} combo - 現在のコンボ数
 * @param {number} playerStars - プレイヤーの星合計
 * @param {Object} config - ゲーム設定
 * @returns {Object} {damage, isParalysis, starConsumed}
 */
function calculateDamage(playerStats, cardData, enemy, combo, playerStars, config) {
    const dmgConfig = config.damageCalc || {};
    
    // ★基本ダメージ計算
    let baseDamage = playerStats.atk * cardData.rank;
    
    // ★コンボボーナス計算
    const comboBonus = combo > 0 ? 1 + (combo - 1) * (dmgConfig.comboMultiplier || 0.1) : 1;
    let damage = baseDamage * comboBonus;
    
    // ★敵のDEFによるダメージ軽減
    damage = Math.max(1, damage - enemy.def);
    
    // ★必殺技チェック（★合計が30以上で使用可）
    let isUltimate = false;
    if (playerStars >= (dmgConfig.ultimateStarThreshold || 30)) {
        isUltimate = true;
        damage *= (dmgConfig.ultimateMultiplier || 3);
    }
    
    // ★特殊攻撃：連続4回同じ操作で5回目のダメージ2倍（ここで実装例）
    // このロジックはBattleEngineで実装するのが取扱いやすい
    
    // ★麻痺判定
    let paralysisInfo = null;
    if (calculateParalysisChance(playerStats.spd, enemy)) {
        paralysisInfo = {
            status: 'paralysis',
            duration: 5, // 5秒停止
            isParalyzed: true
        };
    }
    
    return {
        damage: Math.round(damage),
        isUltimate,
        paralysisInfo,
        starConsumed: isUltimate ? (dmgConfig.ultimateStarThreshold || 30) : 0,
        comboBonus
    };
}
