
import "../dashboard.css";
import React, { useEffect, useState } from "react";
import { FaChartLine, FaChartBar, FaCalendarDay, FaFlask, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import axios from "axios";
import apiUri from "../config/api";


export default function HomePage() {
  // Auth check
  const checkAuthTokenStoredOrNot = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/login";
    }
  };

  // Visitor stats state
  const [visitorStats, setVisitorStats] = useState([
    {
      label: "Visitors Today",
      value: "-",
      icon: <FaCalendarDay size={44} color="#1976d2" style={{background:'#e3f0ff',borderRadius:12,padding:6}} />,
    },
    {
      label: "Visitors This Month",
      value: "-",
      icon: <FaChartLine size={44} color="#43b0f1" style={{background:'#e3f7ff',borderRadius:12,padding:6}} />,
    },
    {
      label: "Visitors This Year",
      value: "-",
      icon: <FaChartBar size={44} color="#43b0f1" style={{background:'#e3f7ff',borderRadius:12,padding:6}} />,
    },
  ]);
  const [visitorLoading, setVisitorLoading] = useState(false);
  const [visitorError, setVisitorError] = useState("");

  // Fetch visitor stats from API
    // Fetch visitor stats from API (rewritten for consistency)
    const fetchVisitorStats = async () =>{
      setVisitorLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const res = await axios.get(`${apiUri}/dashboard/analytics`, config);
        console.log(res.data); 
        setVisitorStats([
          {
            label: "Visitors Today",
            value: res.data.today || 0,
            icon: <FaCalendarDay size={44} color="#1976d2" style={{background:'#e3f0ff',borderRadius:12,padding:6}} />,
          },
          {
            label: "Visitors This Month",
            value: res.data.month || 0,
            icon: <FaChartLine size={44} color="#43b0f1" style={{background:'#e3f7ff',borderRadius:12,padding:6}} />,
          },
          {
            label: "Visitors This Year",
            value: res.data.year || 0,
            icon: <FaChartBar size={44} color="#43b0f1" style={{background:'#e3f7ff',borderRadius:12,padding:6}} />,
          },
        ]);
        setVisitorError("");
      } catch (err) {
        console.error(err);
        setVisitorError("Failed to load visitor stats.");
        setVisitorStats([
          {
            label: "Visitors Today",
            value: "-",
            icon: <FaCalendarDay size={44} color="#1976d2" style={{background:'#e3f0ff',borderRadius:12,padding:6}} />,
          },
          {
            label: "Visitors This Month",
            value: "-",
            icon: <FaChartLine size={44} color="#43b0f1" style={{background:'#e3f7ff',borderRadius:12,padding:6}} />,
          },
          {
            label: "Visitors This Year",
            value: "-",
            icon: <FaChartBar size={44} color="#43b0f1" style={{background:'#e3f7ff',borderRadius:12,padding:6}} />,
          },
        ]);
      }
      setVisitorLoading(false);
    }

  useEffect(() => {
    checkAuthTokenStoredOrNot();
    fetchVisitorStats();
  }, []);

  // App stats (dummy, replace with API if needed)
  const appStats = [
    {
      label: "Total Trials",
      value: 320,
      icon: <FaFlask size={44} color="#ff9800" style={{background:'#fff3e0',borderRadius:12,padding:6}} />,
    },
    {
      label: "Total Teachers",
      value: 18,
      icon: <FaChalkboardTeacher size={44} color="#e040fb" style={{background:'#f3e5f5',borderRadius:12,padding:6}} />,
    },
    {
      label: "Total Students",
      value: 210,
      icon: <FaUserGraduate size={44} color="#43a047" style={{background:'#e8f5e9',borderRadius:12,padding:6}} />,
    },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard Overview</h1>
      <div className="dashboard-stats-row" style={{display:'flex',gap:32,marginBottom:24,justifyContent:'center',flexWrap:'wrap'}}>
        {visitorLoading ? (
          <div>Loading visitor stats...</div>
        ) : visitorError ? (
          <div style={{color:'red'}}>{visitorError}</div>
        ) : (
          visitorStats.map((s, i) => (
            <div className="dashboard-stat-card" key={i} style={{minWidth:220}}>
              <div className="stat-icon stat-icon-large">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))
        )}
      </div>
      <div className="dashboard-stats-row" style={{display:'flex',gap:32,marginBottom:32,justifyContent:'center',flexWrap:'wrap'}}>
        {appStats.map((s, i) => (
          <div className="dashboard-stat-card" key={i} style={{minWidth:220}}>
            <div className="stat-icon stat-icon-large">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="dashboard-graphs">
        <div className="dashboard-graph-card">
          <h2>Visitors Trend</h2>
          <svg width="100%" height="120" viewBox="0 0 320 120" style={{background:'#f7fafd',borderRadius:8}}>
            <polyline
              fill="none"
              stroke="#1976d2"
              strokeWidth="4"
              points="0,100 40,80 80,90 120,60 160,70 200,40 240,60 280,30 320,50"
            />
            <circle cx="320" cy="50" r="5" fill="#1976d2" />
          </svg>
        </div>
        <div className="dashboard-graph-card">
          <h2>Trials Trend</h2>
          <svg width="100%" height="120" viewBox="0 0 320 120" style={{background:'#fff8f2',borderRadius:8}}>
            <rect x="20" y="80" width="30" height="30" fill="#ff9800" rx="4" />
            <rect x="70" y="60" width="30" height="50" fill="#ff9800" rx="4" />
            <rect x="120" y="40" width="30" height="70" fill="#ff9800" rx="4" />
            <rect x="170" y="30" width="30" height="80" fill="#ff9800" rx="4" />
            <rect x="220" y="50" width="30" height="60" fill="#ff9800" rx="4" />
            <rect x="270" y="70" width="30" height="40" fill="#ff9800" rx="4" />
          </svg>
        </div>
        <div className="dashboard-graph-card">
          <h2>Active Users</h2>
          <svg width="100%" height="120" viewBox="0 0 320 120" style={{background:'#f7fafd',borderRadius:8}}>
            <polyline
              fill="none"
              stroke="#43a047"
              strokeWidth="4"
              points="0,110 40,100 80,90 120,80 160,60 200,50 240,40 280,30 320,20"
            />
            <circle cx="320" cy="20" r="5" fill="#43a047" />
          </svg>
        </div>
      </div>
    </div>
  );
}
