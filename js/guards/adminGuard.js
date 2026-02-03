const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser || currentUser.role !== "admin") {
  alert("Admin access only");
  window.location.href = "login.html";
}
