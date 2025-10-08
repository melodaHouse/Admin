import Table from "../components/Table";
import { useState, useEffect } from "react";
import axios from "axios";
import apiUri from "../config/api";

function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100px',
      background: 'linear-gradient(90deg, #10b981 0%, #1976d2 100%)',
      color: '#fff',
      fontSize: '2rem',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      boxShadow: '0 4px 24px rgba(0,0,0,0.18)'
    }}>
      {message}
    </div>
  );
}

const TeacherApplicationsPage = () => {
  const [activeTab, setActiveTab] = useState("new");
  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resumePopup, setResumePopup] = useState({ open: false, app: null });
  const [toast, setToast] = useState("");
  const [recentlyChecked, setRecentlyChecked] = useState({});

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        params: { page },
        headers: { Authorization: `Bearer ${token}` },
      };
      let res;
      if (activeTab === "new") {
        res = await axios.get(
          `${apiUri}/dashboard/new-teacher-applications`
          , config);
      } else {
        res = await axios.get(
          `${apiUri}/dashboard/old-teacher-applications`
          , config);
      }
      setApplications(res.data.applications || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      setApplications([]);
      setTotalPages(1);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line
  }, [activeTab, page]);

  const handleTab = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleMarkAsChecked = async (id) => {
    const token = localStorage.getItem("authToken");
    try {
      await axios.put(
        `${apiUri}/dashboard/update-teacher-application-status/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToast("Status changed to checked!");
      setTimeout(() => setToast(""), 2500);
      // Refetch applications after status change
      fetchApplications();
    } catch (err) {
      alert("Failed to mark as checked.");
    }
  };

  const handleShowResume = (app) => {
    setResumePopup({ open: true, app });
  };

  const handleCloseResume = () => {
    setResumePopup({ open: false, app: null });
  };

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Message", accessor: "message" },
    {
      header: "Date & Time",
      accessor: "createdAt",
      render: (row) => {
        const date = new Date(row.createdAt);
        return isNaN(date.getTime())
          ? row.createdAt
          : date.toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });
      },
    },
    {
      header: "Resume",
      accessor: "resume",
      render: (row) => (
        <button className="btn" onClick={() => handleShowResume(row)}>Show Resume</button>
      ),
    },
    {
      header: "Status",
      accessor: "statusCol",
      render: (row) => (
        row.status === "checked" || recentlyChecked[row.id]
          ? <span style={{color:'#10b981', fontWeight:600, fontSize:'1.1em'}}>Checked</span>
          : activeTab === "new"
            ? <button className="btn primary" onClick={() => handleMarkAsChecked(row._id)}>Mark as Checked</button>
            : <span style={{color:'#10b981', fontWeight:600, fontSize:'1.1em'}}>Checled</span>
      ),
    },
  ];

  return (
    <>
      <h2>Teacher Applications</h2>
      <div className="gq-tabs">
        <button
          className={"gq-tab" + (activeTab === "new" ? " active" : "")}
          onClick={() => handleTab("new")}
        >
          New
        </button>
        <button
          className={"gq-tab" + (activeTab === "checked" ? " active" : "")}
          onClick={() => handleTab("checked")}
        >
          Checked
        </button>
      </div>
      <div className="gq-table-pagination-container">
        {loading ? (
          <div style={{textAlign:'center', margin:'32px 0'}}>
            <svg width="32" height="32" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" stroke="#1976d2" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.8s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
        ) : (
          <div>
            <Table columns={columns} rows={applications} emptyText={activeTab === "new" ? "No new applications" : "No checked applications"} />
            <div className="gq-pagination" style={{marginTop:'16px', display:'flex', justifyContent:'center', gap:'8px'}}>
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>Next</button>
            </div>
          </div>
        )}
      </div>
      {resumePopup.open && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',padding:0,borderRadius:0,width:'100vw',height:'100vh',position:'relative',display:'flex',flexDirection:'column'}}>
            <button onClick={handleCloseResume} style={{position:'absolute',top:16,right:24,fontSize:32,border:'none',background:'none',cursor:'pointer',zIndex:2}}>&times;</button>
            <div style={{padding:'24px 24px 0 24px'}}>
              <h3>Resume</h3>
              <div><b>Name:</b> {resumePopup.app.name}</div>
              <div><b>Email:</b> {resumePopup.app.email}</div>
            </div>
            <div style={{flex:1,margin:'24px',marginTop:8,overflow:'auto',border:'1px solid #eee',background:'#f9f9f9'}}>
              <iframe src={resumePopup.app.resume} title="Resume PDF" width="100%" height="100%" style={{minHeight:'100%',minWidth:'100%',border:'none'}}></iframe>
            </div>
          </div>
        </div>
      )}
      <Toast message={toast} />
    </>
  );
};

export default TeacherApplicationsPage;
