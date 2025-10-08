import React, { useState } from "react";
import "../login.css";
import apiUri from "../config/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");

    setLoading(true);
    axios.post(`${apiUri}/login`, { email, password })
      .then(response => {
        // Handle successful login, e.g., store token, redirect, etc.
        alert("Login successful!");
        console.log(response.data.token);
        const token = response.data.token;
        localStorage.setItem("authToken", token);
        setLoading(false);
        navigate("/"); // Redirect to dashboard/home
      })
      .catch(err => {
        // Handle login error
        setError("Invalid email or password.");
        setLoading(false);
        console.error(err);
      });
  };

  const checkAuthTokenStoredOrNot = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // Token exists, redirect to home or dashboard
      window.location.href = "/";
    }
    };

    React.useEffect(() => {
        checkAuthTokenStoredOrNot();
    }, []);

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">Login</h2>
        <div className="login-field">
          <label htmlFor="email">Email ID</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="username"
            required
          />
        </div>
        <div className="login-field">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </div>
        {error && <div className="login-error">{error}</div>}
        <button className="login-btn" type="submit" disabled={loading} style={{position:'relative'}}>
          {loading ? (
            <span className="spinner" style={{position:'absolute', left:16, top:'50%', transform:'translateY(-50%)'}}>
              <svg width="20" height="20" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="#fff" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round">
                  <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.8s" repeatCount="indefinite" />
                </circle>
              </svg>
            </span>
          ) : "Login"}
        </button>
      </form>
    </div>
  );
}
