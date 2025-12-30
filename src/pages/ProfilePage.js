import axios from "axios";
import { useRef, useState, useEffect } from "react";
import apiUri from "../config/api";
export default function ProfilePage() {
  const token = localStorage.getItem("authToken"); // or get from context

  const passwordRef = useRef();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiUri}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Profile data:", response.data);
        setAdminName(response.data.admin.name || "");
        setAdminEmail(response.data.admin.email || "");
        setError("");
      } catch (err) {
        setError("Failed to fetch profile info.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  const newPassword = passwordRef.current.value?.trim();
  console.log("token:", token);

  if (!newPassword) {
    setError("Please enter a new password.");
    setSuccess("");
    return;
  }

  try {
    const response = await axios.put(
      `${apiUri}/updatePassword`,
      { newPassword }, // ✅ backend expects { newPassword }
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ correct header
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      setSuccess("Password changed successfully!");
      setError("");
    }
  } catch (err) {
    console.error("Update password error:", err.response?.data || err.message);
    setError(err.response?.data?.message || "Error changing password.");
    setSuccess("");
  }
};



  return (
    <div className="card profile-card">
      <h2>Admin Profile</h2>
      <div className="profile-grid">
        <img src={require("../images/admin_icon.jpg")} className="avatar-lg" />
        <form className="fields" onSubmit={handleSubmit} autoComplete="off">
          <div style={{ marginBottom: 8, color: "#1976d2", fontWeight: 500 }}>
            You can only change your password here.
          </div>
          <label>Name</label>
          <input
            value={loading ? "Loading..." : adminName}
            readOnly
            tabIndex={-1}
            style={{ background: "#f3f4f6", cursor: "not-allowed" }}
          />
          <label>Email</label>
          <input
            value={loading ? "Loading..." : adminEmail}
            readOnly
            tabIndex={-1}
            style={{ background: "#f3f4f6", cursor: "not-allowed" }}
          />
          <label>New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            ref={passwordRef}
            autoComplete="new-password"
          />
          {error && (
            <div style={{ color: "#ef4444", marginTop: 8 }}>{error}</div>
          )}
          {success && (
            <div style={{ color: "#10b981", marginTop: 8 }}>{success}</div>
          )}
          <div className="actions" style={{display:'flex', gap:'12px', marginTop:'16px'}}>
            <button className="btn primary" type="submit">Change Password</button>
            <button className="btn" type="reset">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
