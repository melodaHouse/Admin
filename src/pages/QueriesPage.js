import Table from "../components/Table";
import axios from "axios";
import apiUri from "../config/api";
import { useEffect, useState } from "react";

const QueriesPage = () => {
  const [activeTab, setActiveTab] = useState("new");
  const [queries, setQueries] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQueries = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        let res;
        const config = {
          params: { page },
          headers: { Authorization: `Bearer ${token}` },
        };
        if (activeTab === "new") {
          res = await axios.get(
            `${apiUri}/dashboard/new-queries`,
            config
          );
          setQueries(res.data.contacts || []);
          setTotalPages(res.data.pagination?.totalPages || 1);
        } else {
          res = await axios.get(
            `${apiUri}/dashboard/old-queries`,
            config
          );
          setQueries(res.data.contacts || []);
          setTotalPages(res.data.pagination?.totalPages || 1);
        }
      } catch (err) {
        setQueries([]);
        setTotalPages(1);
      }
      setLoading(false);
    };
    fetchQueries();
  }, [activeTab, page]);

  const handleTab = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleMarkAsSent = async (id) => {
    const token = localStorage.getItem("authToken");
    try {
      await axios.put(
        `${apiUri}/dashboard/update-query-status/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQueries(qs => qs.map(q => q._id === id ? { ...q, status: "old" } : q));
    } catch (err) {
      alert("Failed to mark as sent.");
    }
  };

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Message", accessor: "message" },
    {
      header: "Created At",
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
      header: "Reply",
      accessor: "sendMail",
      render: (row) => (
        <a
          href={`mailto:${row.email}`}
          className="mail-btn"
          title="Send Email"
          tabIndex={0}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="20" height="16" rx="4" fill="#1976d2"/>
            <path d="M4 6l8 7 8-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      ),
    },
    {
      header: "Status",
      accessor: "statusCol",
      render: (row) => (
        activeTab === "old" || row.status === "old"
          ? <span className="status-sent">Sent</span>
          : <button className="btn primary" onClick={() => handleMarkAsSent(row._id || row.id)}>Mark as Sent</button>
      ),
    },
  ];

  return (
    <>
      <h2>Queries</h2>
      <div className="gq-tabs">
        <button
          className={"gq-tab" + (activeTab === "new" ? " active" : "")}
          onClick={() => handleTab("new")}
        >
          New
        </button>
        <button
          className={"gq-tab" + (activeTab === "old" ? " active" : "")}
          onClick={() => handleTab("old")}
        >
          Old
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
            <Table columns={columns} rows={queries} emptyText={activeTab === "new" ? "No new queries" : "No resolved queries"} />
            <div className="gq-pagination" style={{marginTop:'16px', display:'flex', justifyContent:'center', gap:'8px'}}>
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>Next</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default QueriesPage;
