import { getData } from "../utils/localStorage.js";

export function determineWinner(auctionId) {
  const bids = getData("bids").filter(b => b.auctionId === auctionId);

  if (bids.length === 0) return null;

  bids.sort((a, b) => b.amount - a.amount);
  return bids[0];
}
