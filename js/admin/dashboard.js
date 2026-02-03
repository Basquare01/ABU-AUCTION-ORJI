import { getData } from "../utils/localStorage.js";

const auctions = getData("auctions");

document.getElementById("totalAuctions").innerText = auctions.length;
document.getElementById("activeAuctions").innerText =
  auctions.filter(a => a.status === "active").length;
