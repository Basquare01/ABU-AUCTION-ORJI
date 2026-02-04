// js/config/init.js
import { getData, setData } from "../utils/localStorage.js";

export function initializeApp() {

  // CREATE DEFAULT ADMIN (ONLY)
  if (!getData("users")) {
    setData("users", [
      {
        id: "ADMIN_001",
        name: "System Admin",
        email: "admin@auction.com",
        password: "admin123",
        role: "admin"
      }
    ]);
  }

  // EMPTY AUCTIONS (NO DUMMY DATA)
  if (!getData("auctions")) {
    setData("auctions", []);
  }

  // EMPTY SESSION
  if (!getData("currentUser")) {
    setData("currentUser", null);
  }
}
