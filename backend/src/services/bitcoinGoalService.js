export function calculateBitcoinGoal(positions, prices) {
  const btcApprox = positions.reduce(
    (total, position) =>
      position.activo === 'bitcoin' ? total + position.cantidad : total,
    0
  );
  const usdtAvailable = positions.reduce(
    (total, position) =>
      position.activo === 'tether' ? total + position.cantidad : total,
    0
  );

  const bitcoinPriceUSD = prices.bitcoin?.usd ?? null;
  const tetherPriceUSD = prices.tether?.usd ?? null;
  const usdtValueUSD =
    usdtAvailable === 0
      ? 0
      : tetherPriceUSD !== null
        ? usdtAvailable * tetherPriceUSD
        : null;
  const btcPurchasable =
    usdtValueUSD === 0
      ? 0
      : bitcoinPriceUSD > 0 && usdtValueUSD !== null
        ? usdtValueUSD / bitcoinPriceUSD
        : null;
  const btcProjected =
    btcPurchasable === null ? null : btcApprox + btcPurchasable;

  return {
    btcApprox,
    usdtAvailable,
    usdtValueUSD,
    bitcoinPriceUSD,
    btcPurchasable,
    btcProjected,
    btcRemaining:
      btcProjected === null ? null : Math.max(0, 1 - btcProjected),
    targetBitcoinPriceUSD:
      btcApprox >= 1 || usdtValueUSD === null || usdtValueUSD <= 0
        ? null
        : usdtValueUSD / (1 - btcApprox),
    goalReached: btcApprox >= 1,
  };
}
