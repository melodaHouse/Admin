import Table from "../components/Table";
import { useState } from "react";
import axios from "axios";
import apiUri from "../config/api";

const columns = [
  { header: "Name", accessor: "name" },
  { header: "Email", accessor: "email" },
  { header: "Message", accessor: "message" },
  {
    header: "Created At",
    accessor: "createdAt",
    render: (row) => {
      const [y, m, d] = row.createdAt.split("-");
      return `${d}-${m}-${y}`;
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
      row.status === "old"
        ? <span className="status-sent">Sent</span>
        : <button className="btn primary" onClick={() => alert(`Marked as sent for ${row.name}`)}>Mark as Sent</button>
    ),
  },
];

export default function GeneralQueriesPage() {
  const [activeTab, setActiveTab] = useState("new");
  const [page, setPage] = useState(1);
  const [queries, setQueries] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 4;

  const getGeneralQueries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        params: { page },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      };
      let res;
      if (activeTab === "new") {
        res = await axios.get(`${apiUri}/dashboard/new-queries`, config);
      } else {
        res = await axios.get(`${apiUri}/dashboard/old-queries`, config);
      }
      setQueries(res.data.contacts || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      setQueries([]);
      setTotalPages(1);
    }
    setLoading(false);
  };

  // Fetch queries on tab or page change
  React.useEffect(() => {
    getGeneralQueries();
    // eslint-disable-next-line
  }, [activeTab, page]);

  const handleTab = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const pagedRows = queries;

  return (
    <>
      <h2>General Queries</h2>
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
      <div style={{ marginTop: 24 }}>
        {loading ? (
          <div style={{textAlign:'center',margin:24}}>Loading...</div>
        ) : (
          <Table columns={columns} rows={pagedRows} emptyText={activeTab === "new" ? "No new queries" : "No resolved queries"} />
        )}
        <div className="gq-pagination">
          {totalPages > 1 ? (
            <>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>&lt;</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={page === i + 1 ? "active" : ""}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>&gt;</button>
            </>
          ) : (
            <span style={{ minHeight: 28, minWidth: 60, display: 'inline-block' }}></span>
          )}
        </div>
      </div>
    </>
  );
}
