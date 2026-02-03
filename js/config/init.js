(function initApp() {

  // Admin account
  if (!localStorage.getItem("admin")) {
    localStorage.setItem("admin", JSON.stringify({
      email: "admin@auction.com",
      password: "admin123",
      role: "admin"
    }));
  }

  // Users
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]));
  }

  // Auctions
  if (!localStorage.getItem("auctions")) {
    localStorage.setItem("auctions", JSON.stringify([]));
  }

  // Bids
  if (!localStorage.getItem("bids")) {
    localStorage.setItem("bids", JSON.stringify([]));
  }

})();
