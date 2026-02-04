const container = document.getElementById('marketplace');

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('currentUser'));
  } catch (e) {
    return null;
  }
}

function loadAuctions() {
  return JSON.parse(localStorage.getItem('auctions')) || [];
}

function saveAuctions(auctions) {
  localStorage.setItem('auctions', JSON.stringify(auctions));
}

function render() {
  const auctions = loadAuctions();
  container.innerHTML = '';

  if (auctions.length === 0) {
    container.innerHTML = `
      <div class="empty-state card">
        <h3>No Auctions Available</h3>
        <p>Please check back later.</p>
      </div>
    `;
    return;
  }

  auctions.forEach(a => {
    const disabled = a.status !== 'active';

    container.innerHTML += `
      <div class="auction-card card" data-id="${a.id}">
        <img src="${a.image}" alt="${a.title}">
        <h3>${a.title}</h3>
        <p class="meta">
          Current Bid:
          <strong>₦<span class="current-bid">${a.currentBid.toLocaleString()}</span></strong>
          •
          <span class="status ${a.status}">${a.status}</span>
        </p>
        <div class="card-actions">
          <button class="btn bid-now-btn" data-id="${a.id}" ${disabled ? 'disabled' : ''}>
            Bid Now
          </button>
          <button class="btn btn-ghost history-btn" data-id="${a.id}">
            History
          </button>
        </div>
      </div>
    `;
  });
}

/* =======================
   BID LOGIC (CORE)
======================= */
function placeBidForAuction(auctionId, amount) {
  const auctions = loadAuctions();
  const auction = auctions.find(a => a.id === auctionId);
  const user = getCurrentUser();

  if (!user) {
    showToast('Please login to place a bid', 'error');
    return false;
  }

  if (!auction) {
    showToast('Auction not found', 'error');
    return false;
  }

  if (auction.status !== 'active') {
    showToast('Auction is closed', 'error');
    return false;
  }

  if (!amount || amount <= auction.currentBid) {
    showToast('Bid must be higher than current bid', 'error');
    return false;
  }

  const bid = {
    amount: Number(amount),
    userId: user.id,
    userEmail: user.email,
    time: new Date().toLocaleString()
  };

  auction.currentBid = bid.amount;
  auction.bids.push(bid);

  saveAuctions(auctions);

  showToast('Bid placed successfully');
  render();
  return true;
}

/* =======================
   MODALS
======================= */
function createModal({ title = '', innerHTML = '', onClose }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>${title}</h3>
      ${innerHTML}
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  function close() {
    overlay.remove();
    if (onClose) onClose();
  }

  overlay.addEventListener('click', e => {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', esc);
    }
  });

  return { overlay, modal, close };
}

function openBidModal(auctionId) {
  const auctions = loadAuctions();
  const auction = auctions.find(a => a.id === auctionId);

  if (!auction || auction.status !== 'active') {
    showToast('Auction is unavailable', 'error');
    return;
  }

  const min = auction.currentBid + 1;

  const { modal, close } = createModal({
    title: `Place Bid — ${auction.title}`,
    innerHTML: `
      <p class="muted">Current Bid: ₦${auction.currentBid.toLocaleString()}</p>
      <label>Enter bid amount (min ₦${min}):</label>
      <input type="number" id="bidAmount" min="${min}" value="${min}" />
      <div class="modal-actions">
        <button id="placeBidBtn" class="btn">Place Bid</button>
        <button id="cancelBidBtn" class="btn btn-ghost">Cancel</button>
      </div>
    `
  });

  const input = modal.querySelector('#bidAmount');
  modal.querySelector('#placeBidBtn').addEventListener('click', () => {
    const ok = placeBidForAuction(auctionId, Number(input.value));
    if (ok) close();
  });

  modal.querySelector('#cancelBidBtn').addEventListener('click', close);
}

function openHistoryModal(auctionId) {
  const auctions = loadAuctions();
  const auction = auctions.find(a => a.id === auctionId);

  if (!auction) return;

  const bids = auction.bids
    .slice()
    .reverse()
    .map(b => `<li>₦${b.amount.toLocaleString()} by ${b.userEmail} at ${b.time}</li>`)
    .join('') || '<li class="muted">No bids yet</li>';

  createModal({
    title: 'Bid History',
    innerHTML: `<ul class="history-list">${bids}</ul>
      <div class="modal-actions">
        <button class="btn btn-ghost">Close</button>
      </div>`
  });
}

/* =======================
   EVENTS
======================= */
container.addEventListener('click', function (e) {
  const bidBtn = e.target.closest('.bid-now-btn');
  const histBtn = e.target.closest('.history-btn');

  if (bidBtn) openBidModal(bidBtn.dataset.id);
  if (histBtn) openHistoryModal(histBtn.dataset.id);
});

window.addEventListener('storage', function (e) {
  if (e.key === 'auctions') render();
});

// init
render();
