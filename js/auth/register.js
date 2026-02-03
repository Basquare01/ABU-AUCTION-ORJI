document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const users = JSON.parse(localStorage.getItem("users"));

  // Prevent duplicate email
  if (users.some(u => u.email === email)) {
    showToast("Email already registered", "error");
    return;
  }

  const newUser = {
    id: "U-" + Date.now(),
    name,
    email,
    password,
    role: "user"
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  showToast("Registration successful. Please login.");
  setTimeout(function() { window.location.href = "login.html"; }, 1200);
});
