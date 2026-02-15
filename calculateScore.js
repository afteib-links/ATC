/*
  算術の塔のスコア計算ロジック。

  計算式をこのファイルに集約し、UIやゲーム進行に触れずに
  数値バランスだけを調整できるようにしています。

  入力:
  - elapsedSeconds: 経過時間（秒）
  - totalKills: 撃破数
  - floorIndex: 0始まりのフロア番号
  - scoreConfig: { timeWeight, killWeight, floorWeight, baseClearBonus }

  現在の式:
  score = baseClearBonus
        + timeWeight * elapsedSeconds
        + killWeight * totalKills
        + floorWeight * (floorIndex + 1)

  補足:
  - timeWeight は負の値で、時間が長いほど減点します。
  - floorIndex は0始まりなので、表示用に +1 します。
  - 最終スコアは 0 未満にならないようにし、整数に切り捨てます。

  調整の方針:
  - baseClearBonus を上げると基礎点が上がります。
  - timeWeight をより負にするとスピード重視になります。
  - killWeight を上げると戦闘重視になります。
  - floorWeight を上げると到達フロア重視になります。
*/
(function(){
  function calculateScore(params){
    const elapsedSeconds = Number(params?.elapsedSeconds ?? 0);
    const totalKills = Number(params?.totalKills ?? 0);
    const floorIndex = Number(params?.floorIndex ?? 0);
    const cfg = params?.scoreConfig || {};

    const baseClearBonus = Number(cfg.baseClearBonus ?? 0);
    const timeWeight = Number(cfg.timeWeight ?? 0);
    const killWeight = Number(cfg.killWeight ?? 0);
    const floorWeight = Number(cfg.floorWeight ?? 0);

    const floorCount = floorIndex + 1;
    const rawScore = baseClearBonus
      + timeWeight * elapsedSeconds
      + killWeight * totalKills
      + floorWeight * floorCount;

    return Math.max(0, Math.floor(rawScore));
  }

  window.calculateScore = calculateScore;
})();
