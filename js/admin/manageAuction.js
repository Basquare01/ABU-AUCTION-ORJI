import { getData, setData } from "../utils/localStorage.js";

function closeAuction(id) {
  const auctions = getData("auctions");
  const auction = auctions.find(a => a.id === id);
  auction.status = "closed";
  setData("auctions", auctions);
  alert("Auction closed");
  location.reload();
}

function deleteAuction(id) {
  let auctions = getData("auctions");
  auctions = auctions.filter(a => a.id !== id);
  setData("auctions", auctions);
  alert("Auction deleted");
  location.reload();
}

window.closeAuction = closeAuction;
window.deleteAuction = deleteAuction;
