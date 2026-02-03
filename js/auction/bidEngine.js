export function startTimer(auction, onEnd) {
  const interval = setInterval(() => {
    const remaining = auction.endTime - Date.now();

    if (remaining <= 0) {
      clearInterval(interval);
      onEnd();
    }
  }, 1000);
}
