

import { NavLink } from "react-router-dom";
import { useState } from "react";
import logo from "../images/white_logo.png";

const portfolioLinks = [
  { to: "/queries", label: "Queries", icon: "ℹ️" },
  { to: "/trials", label: "Trials", icon: "🧪" },
  { to: "/teachers", label: "Teachers", icon: "👩‍🏫" },
];

const otherLinks = [
  { to: "/", label: "Home", icon: "�" },
  { to: "/others", label: "Others", icon: "⚙️" },
];

export default function Sidebar() {
  const [portfolioOpen, setPortfolioOpen] = useState(true);
  return (
    <nav>
      <div className="brand">
        <img src={logo} alt="Logo" className="brand-logo" />
      </div>
      <ul className="navlist">
        {/* Home tab at the very top */}
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => "navlink" + (isActive ? " active" : "")}
          >
            <span className="icon">🏠</span>
            <span>Home</span>
          </NavLink>
        </li>
        {/* Website Submissions Dropdown - Minimal */}
        <li>
          <div
            className={"navlink nav-parent" + (portfolioOpen ? " open" : "")}
            onClick={() => setPortfolioOpen(v => !v)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="icon">📝</span>
              <span>Website Submissions</span>
            </span>
            <span style={{ fontSize: 18, marginLeft: 8 }}>{portfolioOpen ? "▾" : "▸"}</span>
          </div>
          {portfolioOpen && (
            <ul className="nav-sublist" style={{ listStyle: 'none', padding: '0 0 0 22px', margin: 0 }}>
              {portfolioLinks.map(l => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    className={({ isActive }) => "navlink nav-subtab" + (isActive ? " active" : "")}
                  >
                    <span className="icon">{l.icon}</span>
                    <span>{l.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </li>
        {/* Others tab as top-level link */}
        <li>
          <NavLink
            to="/others"
            className={({ isActive }) => "navlink" + (isActive ? " active" : "")}
          >
            <span className="icon">⚙️</span>
            <span>Others</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
