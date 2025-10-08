import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const logout=() => {
    // takr confirmation before logging out
    if (!window.confirm("Are you sure you want to logout?")) {
      return;
    }
    // Clear any authentication tokens or user data here
    // For example, if you're using localStorage:
    localStorage.removeItem("authToken");
    // Redirect to the login page
    window.location.href = "/login";
  };

  const checkAuthTokenStoredOrNot = () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        // Token doesn't exist, redirect to login
        window.location.href = "/login";
      }
    };
  
    useEffect(() => {
      checkAuthTokenStoredOrNot();
    }, []);

  return (
    <header className="topbar">
      {/* <input className="search" placeholder="Search…" /> */}
      <h3>Welcome Admin !</h3>
      <div className="profile" onClick={() => setOpen(o => !o)} role="button">
  <img src={require("../images/admin_icon.jpg")} alt="admin" />
        <span className="name">Admin</span>
        <span className="chev">▾</span>
        {open && (
          <div className="menu" onMouseLeave={() => setOpen(false)}>
            <button onClick={() => navigate("/profile")}>Profile</button>
            <button onClick={() => logout()  
            }>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}
