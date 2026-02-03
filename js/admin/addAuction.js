const form = document.getElementById("auctionForm");
const auctionList = document.getElementById("auctionList");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const reader = new FileReader();
  const imageFile = document.getElementById("image").files[0];

  reader.onload = function () {
    const auctions = JSON.parse(localStorage.getItem("auctions"));

    const duration = Number(document.getElementById("duration").value);
    const endTime = Date.now() + duration * 60000;

    const auction = {
      id: "AUC-" + Date.now(),
      title: title.value,
      description: description.value,
      image: reader.result,
      startPrice: Number(price.value),
      currentBid: Number(price.value),
      endTime: endTime,
      status: "active"
    };

    auctions.push(auction);
    localStorage.setItem("auctions", JSON.stringify(auctions));

    showToast("Auction Created Successfully");
    form.reset();
    renderAuctions();
  };

  reader.readAsDataURL(imageFile);
});

function renderAuctions() {
  const auctions = JSON.parse(localStorage.getItem('auctions')) || [];
  auctionList.innerHTML = '';

  auctions.forEach(a => {
    auctionList.innerHTML += `
      <div class="admin-auction-card card" data-id="${a.id}">
        <img src="${a.image}" alt="${a.title}">
        <div class="info">
          <h4>${a.title}</h4>
          <p class="muted">${a.description || ''}</p>
          <div class="meta"><span>Current: ₦${a.currentBid}</span><span>${a.status}</span></div>
          <div class="actions">
            <button class="btn btn-ghost close-btn">Close</button>
            <button class="btn delete-btn">Delete</button>
          </div>
        </div>
      </div>
    `;
  });
}

// handle actions via delegation
auctionList.addEventListener('click', function (e) {
  const card = e.target.closest('.admin-auction-card');
  if (!card) return;
  const id = card.dataset.id;

  if (e.target.classList.contains('delete-btn')) {
    if (!confirm('Delete this auction?')) return;
    deleteAuction(id);
  }

  if (e.target.classList.contains('close-btn')) {
    showConfirm({
      message: 'Close this auction? This cannot be undone.',
      onConfirm: function() { closeAuction(id); },
      onCancel: function() { showToast('Close cancelled', 'error'); }
    });
  }
});

function deleteAuction(id) {
  let auctions = JSON.parse(localStorage.getItem('auctions')) || [];
  auctions = auctions.filter(a => a.id !== id);
  localStorage.setItem('auctions', JSON.stringify(auctions));
  renderAuctions();
}

function closeAuction(id) {
  const auctions = JSON.parse(localStorage.getItem('auctions')) || [];
  const a = auctions.find(x => x.id === id);
  if (!a) return;
  a.status = 'closed';
  localStorage.setItem('auctions', JSON.stringify(auctions));
  renderAuctions();
}

renderAuctions();
