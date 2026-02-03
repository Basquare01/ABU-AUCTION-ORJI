// const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// if (!currentUser) {
//   alert("Please login first");
//   window.location.href = "login.html";
// }


const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
  alert("Access denied. Please login.");
  window.location.href = "login.html";
}
