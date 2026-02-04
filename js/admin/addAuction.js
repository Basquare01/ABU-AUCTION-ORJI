const form = document.getElementById("auctionForm");
const auctionList = document.getElementById("auctionList");

// Ensure auctions array exists (NO dummy data)
if (!localStorage.getItem("auctions")) {
  localStorage.setItem("auctions", JSON.stringify([]));
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const imageInput = document.getElementById("image");
  const imageFile = imageInput.files[0];

  if (!imageFile) {
    alert("Please upload an image");
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    const auctions = JSON.parse(localStorage.getItem("auctions")) || [];

    const durationMinutes = Number(document.getElementById("duration").value);
    const endTime = Date.now() + durationMinutes * 60000;

    const auction = {
      id: "AUC-" + Date.now(),
      title: title.value.trim(),
      description: description.value.trim(),
      image: reader.result,
      startingPrice: Number(price.value),
      currentBid: Number(price.value),
      bids: [],
      endTime: endTime,
      status: "active",
      createdAt: Date.now()
    };

    auctions.push(auction);
    localStorage.setItem("auctions", JSON.stringify(auctions));

    alert("Auction created successfully");

    form.reset();
    renderAuctions();
  };

  reader.readAsDataURL(imageFile);
});

function renderAuctions() {
  const auctions = JSON.parse(localStorage.getItem("auctions")) || [];
  auctionList.innerHTML = "";

  if (auctions.length === 0) {
    auctionList.innerHTML = `
      <p class="empty-text">No auctions created yet.</p>
    `;
    return;
  }

  auctions.forEach(a => {
    auctionList.innerHTML += `
      <div class="admin-auction-card card" data-id="${a.id}">
        <img src="${a.image}" alt="${a.title}">
        <div class="info">
          <h4>${a.title}</h4>
          <p class="muted">${a.description || ""}</p>

          <div class="meta">
            <span>Current: ₦${a.currentBid.toLocaleString()}</span>
            <span class="${a.status === 'active' ? 'active' : 'closed'}">
              ${a.status.toUpperCase()}
            </span>
          </div>

          <div class="actions">
            ${
              a.status === "active"
                ? `<button class="btn btn-ghost close-btn">Close</button>`
                : ""
            }
            <button class="btn delete-btn">Delete</button>
          </div>
        </div>
      </div>
    `;
  });
}

// Handle actions via delegation
auctionList.addEventListener("click", function (e) {
  const card = e.target.closest(".admin-auction-card");
  if (!card) return;

  const id = card.dataset.id;

  if (e.target.classList.contains("delete-btn")) {
    if (!confirm("Delete this auction?")) return;
    deleteAuction(id);
  }

  if (e.target.classList.contains("close-btn")) {
    if (!confirm("Close this auction?")) return;
    closeAuction(id);
  }
});

function deleteAuction(id) {
  let auctions = JSON.parse(localStorage.getItem("auctions")) || [];
  auctions = auctions.filter(a => a.id !== id);

  localStorage.setItem("auctions", JSON.stringify(auctions));
  renderAuctions();
}

function closeAuction(id) {
  const auctions = JSON.parse(localStorage.getItem("auctions")) || [];
  const auction = auctions.find(a => a.id === id);
  if (!auction) return;

  auction.status = "closed";
  localStorage.setItem("auctions", JSON.stringify(auctions));
  renderAuctions();
}

// Initial load
renderAuctions();
