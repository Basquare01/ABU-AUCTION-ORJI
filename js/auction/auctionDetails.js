import { determineWinner } from "./winnerLogic.js";
import { startTimer } from "./bidEngine.js";

const params = new URLSearchParams(window.location.search);
const auctionId = params.get("id");

let auctions = JSON.parse(localStorage.getItem("auctions")) || [];
let bids = JSON.parse(localStorage.getItem("bids")) || [];

let auction = auctions.find(a => a.id === auctionId);

document.getElementById("title").innerText = auction.title;
document.getElementById("image").src = auction.image;
document.getElementById("price").innerText = "Current Bid: ₦" + auction.currentBid;

function updateTimer() {
  const now = Date.now();
  const remaining = auction.endTime - now;

  if (remaining <= 0) {
    auction.status = "closed";
    localStorage.setItem("auctions", JSON.stringify(auctions));
    document.getElementById("timer").innerText = "Auction Ended";
    declareWinner();
    clearInterval(interval);
    return;
  }

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  document.getElementById("timer").innerText =
    `Time Left: ${minutes}m ${seconds}s`;
}

const interval = setInterval(updateTimer, 1000);
updateTimer();

// use global showToast if available (defined in js/utils/toast.js)
function showToast(msg, type = 'success') {
  if (typeof window.showToast === 'function') return window.showToast(msg, type);
  // fallback minimal toast
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.innerText = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('visible'), 50);
  setTimeout(() => t.classList.remove('visible'), 2800);
  setTimeout(() => t.remove(), 3200);
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('currentUser'));
  } catch (e) { return null; }
}

function updateBidBoxState() {
  const user = getCurrentUser();
  const bidInput = document.getElementById('bidAmount');
  const bidBtn = document.querySelector('.bid-box .btn');
  const noteId = 'login-note';

  // remove any prior note
  const existing = document.getElementById(noteId);
  if (existing) existing.remove();

  if (!user) {
    if (bidInput) bidInput.disabled = true;
    if (bidBtn) bidBtn.disabled = true;

    const note = document.createElement('p');
    note.id = noteId;
    note.className = 'muted';
    note.innerHTML = 'Please <a href="login.html">login</a> to place a bid.';
    const container = document.querySelector('.auction-info');
    if (container) container.insertBefore(note, container.firstChild);
  } else {
    if (bidInput) bidInput.disabled = false;
    if (bidBtn) bidBtn.disabled = false;
  }
}

function placeBid() {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to place a bid', 'error');
    return;
  }

  const amount = Number(document.getElementById('bidAmount').value);

  if (auction.status !== 'active') {
    showToast('Auction Closed', 'error');
    return;
  }

  if (!amount || amount <= auction.currentBid) {
    showToast('Bid must be higher than current bid', 'error');
    return;
  }

  auction.currentBid = amount;

  bids.push({
    auctionId: auction.id,
    amount: amount,
    time: new Date().toLocaleString(),
    userId: user.id || null,
    userEmail: user.email || 'Unknown'
  });

  localStorage.setItem('bids', JSON.stringify(bids));
  localStorage.setItem('auctions', JSON.stringify(auctions));

  document.getElementById('price').innerText = 'Current Bid: ₦' + amount;
  document.getElementById('bidAmount').value = '';
  renderHistory();
  showToast('Bid placed successfully');
}

function renderHistory() {
  const history = document.getElementById('history');
  history.innerHTML = '';

  bids.filter(b => b.auctionId === auction.id)
      .forEach(b => {
        const who = b.userEmail ? ` by ${b.userEmail}` : '';
        history.innerHTML += `<li>₦${b.amount}${who} at ${b.time}</li>`;
      });
}

// initialize bid box state on load
updateBidBoxState();

// expose placeBid for compatibility and attach event listeners
window.placeBid = placeBid;

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('placeBidBtn');
  if (btn) btn.addEventListener('click', placeBid);

  const input = document.getElementById('bidAmount');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        placeBid();
      }
    });
  }
});

// Sync fresh state from localStorage and update UI
function syncFromLocalStorage() {
  auctions = JSON.parse(localStorage.getItem('auctions')) || [];
  bids = JSON.parse(localStorage.getItem('bids')) || [];
  const updated = auctions.find(a => a.id === auctionId);
  if (updated) {
    auction = updated;
    document.getElementById('title').innerText = auction.title || document.getElementById('title').innerText;
    document.getElementById('image').src = auction.image || document.getElementById('image').src;
    document.getElementById('price').innerText = 'Current Bid: ₦' + (auction.currentBid || 0);
  } else {
    // auction removed or not found
    document.getElementById('timer').innerText = 'Auction not found';
  }
  renderHistory();
  updateBidBoxState();
}

// listen for storage changes (other tabs or windows)
window.addEventListener('storage', function (e) {
  if (!e.key) return;
  if (e.key === 'bids' || e.key === 'auctions' || e.key === 'currentUser') {
    syncFromLocalStorage();
  }
});

// listen for same-tab custom events for immediate updates
window.addEventListener('bidsUpdated', function (e) {
  // if auction matches or no detail provided, sync
  if (!e.detail || e.detail.auctionId === auctionId) syncFromLocalStorage();
});

// also ensure we start with the latest state
syncFromLocalStorage();

function declareWinner() {
  const auctionBids = bids.filter(b => b.auctionId === auction.id);
  if (auctionBids.length === 0) {
    showToast("Auction ended with no bids", "error");
    return;
  }
  const highest = auctionBids.sort((a, b) => b.amount - a.amount)[0];
  showToast("Auction Winner: ₦" + highest.amount);
}

renderHistory();
