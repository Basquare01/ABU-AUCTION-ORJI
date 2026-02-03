(function () {
  function renderNav() {
    const nav = document.querySelector('.nav-links');
    if (!nav) return;

    const current = localStorage.getItem('currentUser');
    if (current) {
      const user = JSON.parse(current);
      nav.innerHTML = `
        <a href="marketplace.html">Marketplace</a>
        <span class="user-pill">Hi, ${user.email}</span>
        ${user.role === 'admin' ? '<a href="admin.html" class="btn btn-ghost">Dashboard</a>' : ''}
        <button id="logoutBtn" class="btn btn-ghost">Logout</button>
      `;

      document.getElementById('logoutBtn').addEventListener('click', function () {
        localStorage.removeItem('currentUser');
        // reload so header and other pages update
        window.location.reload();
      });
    } else {
      nav.innerHTML = `
        <a href="marketplace.html">Marketplace</a>
        <a href="login.html" class="btn btn-ghost">Login</a>
        <a href="register.html" class="btn">Register</a>
      `;
    }
  }

  // run on load
  document.addEventListener('DOMContentLoaded', renderNav);
})();