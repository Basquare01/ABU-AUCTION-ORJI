const container = document.getElementById('marketplace');

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('currentUser')); } catch (e) { return null; }
}

function loadAuctions() {
  return JSON.parse(localStorage.getItem('auctions')) || [];
}

function loadBids() {
  return JSON.parse(localStorage.getItem('bids')) || [];
}

function render() {
  const auctions = loadAuctions();
  container.innerHTML = '';

  auctions.forEach(a => {
    const disabled = a.status !== 'active';
    container.innerHTML += `
      <div class="auction-card card" data-id="${a.id}">
        <img src="${a.image}" alt="${a.title}">
        <h3>${a.title}</h3>
        <p class="meta">Current Bid: <strong>₦<span class="current-bid">${a.currentBid}</span></strong>  •  <span class="status">${a.status}</span></p>
        <div class="card-actions">
          
          <button class="btn bid-now-btn" data-id="${a.id}" ${disabled ? 'disabled' : ''}>Bid Now</button>
          <button class="btn btn-ghost history-btn" data-id="${a.id}">History</button>
        </div>
      </div>
    `;
  });
}

// place bid handler used by modal
function placeBidForAuction(auctionId, amount) {
  const auctions = loadAuctions();
  const bids = loadBids();
  const a = auctions.find(x => x.id === auctionId);
  const user = getCurrentUser();
  if (!a) { showToast('Auction not found', 'error'); return false; }
  if (a.status !== 'active') { showToast('Auction closed', 'error'); return false; }
  if (!amount || amount <= a.currentBid) { showToast('Bid must be higher than current bid', 'error'); return false; }

  a.currentBid = Number(amount);
  bids.push({ auctionId: a.id, amount: a.currentBid, time: new Date().toLocaleString(), userId: user ? user.id : null, userEmail: user ? user.email : 'Unknown' });

  localStorage.setItem('bids', JSON.stringify(bids));
  localStorage.setItem('auctions', JSON.stringify(auctions));

  showToast('Bid placed successfully');
  render();
  // notify other tabs via storage event (native) and same-tab listeners via custom event
  window.dispatchEvent(new CustomEvent('bidsUpdated', { detail: { auctionId: a.id } }));
  return true;
}

// modal helpers
function createModal({title = '', innerHTML = '', onClose}) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

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

  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } });

  return { overlay, modal, close };
}

function openBidModal(auctionId) {
  const auctions = loadAuctions();
  const a = auctions.find(x => x.id === auctionId);
  const user = getCurrentUser();
  if (!user) { showToast('Please login to place a bid', 'error'); return; }
  if (!a) { showToast('Auction not found', 'error'); return; }
  if (a.status !== 'active') { showToast('Auction is closed', 'error'); return; }

  const min = Number(a.currentBid) + 1;
  const { overlay, modal, close } = createModal({ title: `Place Bid — ${a.title}`, innerHTML: `
    <p class="muted">Current Bid: ₦${a.currentBid}</p>
    <label for="modalBidAmount">Enter amount (minimum ₦${min}):</label>
    <input id="modalBidAmount" aria-label="Bid amount" type="number" min="${min}" value="${min}" />
    <div style="margin-top:12px; text-align:right;"><button id="modalPlaceBid" class="btn">Place Bid</button> <button id="modalCancel" class="btn btn-ghost">Cancel</button></div>
  `, onClose: () => {} });

  const input = modal.querySelector('#modalBidAmount');
  setTimeout(() => input && input.focus(), 60);

  modal.querySelector('#modalPlaceBid').addEventListener('click', () => {
    const amount = Number(input.value);
    const ok = placeBidForAuction(auctionId, amount);
    if (ok) close();
  });
  modal.querySelector('#modalCancel').addEventListener('click', close);
}

function openHistoryModal(auctionId) {
  let interval = null;
  function onStorage() { renderHistory(modal); }

  function renderHistory(modal) {
    const bids = loadBids().filter(b => b.auctionId === auctionId).sort((x,y) => new Date(y.time) - new Date(x.time));
    const list = bids.map(b => `<li>₦${b.amount} by ${b.userEmail || 'Unknown'} at ${b.time}</li>`).join('') || '<li class="muted">No bids yet</li>';
    modal.querySelector('.modal-content').innerHTML = `<h3>Bid History</h3><ul class="history-list">${list}</ul><div style="text-align:right; margin-top:12px;"><button class="btn btn-ghost" id="closeHist">Close</button></div>`;
    const closeBtn = modal.querySelector('#closeHist');
    closeBtn.addEventListener('click', () => { cleanup(); });
  }

  function cleanup() {
    if (interval) clearInterval(interval);
    window.removeEventListener('storage', onStorage);
  }

  const { overlay, modal, close } = createModal({ title: 'Bid History', innerHTML: '<div class="loading">Loading...</div>', onClose: cleanup });
  interval = setInterval(() => renderHistory(modal), 800);

  // also update on storage changes
  window.addEventListener('storage', onStorage);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) { cleanup(); } });

  renderHistory(modal);
}

// Delegated click handling
container.addEventListener('click', function (e) {
  const bidBtn = e.target.closest('.bid-now-btn');
  const histBtn = e.target.closest('.history-btn');
  if (bidBtn) { const id = bidBtn.dataset.id; openBidModal(id); }
  if (histBtn) { const id = histBtn.dataset.id; openHistoryModal(id); }
});

// refresh on storage change (other tabs)
window.addEventListener('storage', function (e) { if (e.key === 'auctions' || e.key === 'bids') render(); });

// init
render();
