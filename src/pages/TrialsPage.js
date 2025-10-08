import Table from "../components/Table";
import Badge from "../components/Badge";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "../dashboard.css";
import apiUri from "../config/api";
import axios from "axios";

const statusTones = {
  new: "info",
  contacted: "warning",
  scheduled: "success",
  completed: "success",
  cancelled: "muted",
};

const statusLabels = {
  new: "New",
  contacted: "Contacted",
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

const tabs = ["new", "contacted", "scheduled", "completed", "cancelled"];

const scheduleTabs = [
  { key: "all", label: "All Schedules", color: "#fff", bg: "#1976d2" },
  { key: "today", label: "Today's Schedule", color: "#1976d2", bg: "#e3f0ff" },
  { key: "tomorrow", label: "Tomorrow's Schedule", color: "#43b0f1", bg: "#e3f7ff" },
  { key: "next7", label: "Next 7 Days' Schedule", color: "#43a047", bg: "#e8f5e9" },
  { key: "past", label: "Past Schedules", color: "#fff", bg: "#757575" },
];

export default function TrialsPage() {
  // Completed trials state
  const [completedTrials, setCompletedTrials] = useState([]);
  const [completedTrialsLoading, setCompletedTrialsLoading] = useState(false);
  const [completedTrialsTotal, setCompletedTrialsTotal] = useState(0);
  const [completedTrialsTotalPages, setCompletedTrialsTotalPages] = useState(1);
  // Fetch completed trials from API
  const getCompletedTrials = async (pageNum = 1) => {
    setCompletedTrialsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${apiUri}/dashboard/completed-trials`,
        {
          params: { page: pageNum },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCompletedTrials(response.data.trials || []);
      setCompletedTrialsTotal(response.data.pagination?.totalItems || 0);
      setCompletedTrialsTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      setCompletedTrials([]);
      setCompletedTrialsTotal(0);
      setCompletedTrialsTotalPages(1);
    } finally {
      setCompletedTrialsLoading(false);
    }
  };

  // All useState declarations at the very top
  const [activeTab, setActiveTab] = useState("new");
  const [activeScheduleTab, setActiveScheduleTab] = useState("today");
  // scheduleInput is not used anywhere, so remove it
  const [contactedTrials, setContactedTrials] = useState([]);
  const [contactedTrialsTotal, setContactedTrialsTotal] = useState(0);
  const [contactedTrialsLoading, setContactedTrialsLoading] = useState(false);
  const [cancelPopupOpen, setCancelPopupOpen] = useState(false);
  const [cancelId, setCancelId] = useState(null);
  const [schedulePopupOpen, setSchedulePopupOpen] = useState(false);
  const [schedulePopupId, setSchedulePopupId] = useState(null);
  const [schedulePopupDatetime, setSchedulePopupDatetime] = useState("");
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [cancelNote, setCancelNote] = useState("");
  const [schedulePage, setSchedulePage] = useState(1);
  // scheduleTotalPages is not used anywhere, so remove it
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newTrials, setNewTrials] = useState([]);
  const [newTrialsTotal, setNewTrialsTotal] = useState(0);
  const [newTrialsLoading, setNewTrialsLoading] = useState(false);
  const [cancelledTrials, setCancelledTrials] = useState([]);
  const [cancelledTrialsTotal, setCancelledTrialsTotal] = useState(0);
  const [cancelledTrialsLoading, setCancelledTrialsLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [contactedLoadingId, setContactedLoadingId] = useState(null);
  const [scheduledTrialsAll, setScheduledTrialsAll] = useState([]);
  const [scheduledTrialsToday, setScheduledTrialsToday] = useState([]);
  const [scheduledTrialsTomorrow, setScheduledTrialsTomorrow] = useState([]);
  const [scheduledTrialsNext7, setScheduledTrialsNext7] = useState([]);
  const [scheduledTrialsLoading, setScheduledTrialsLoading] = useState(false);
  const [scheduledTrialsPast, setScheduledTrialsPast] = useState([]);
  const [scheduledPastTotalPages, setScheduledPastTotalPages] = useState(1);
  // Separate total pages for each scheduled subtab
  const [scheduledAllTotalPages, setScheduledAllTotalPages] = useState(1);
  const [scheduledTodayTotalPages, setScheduledTodayTotalPages] = useState(1);
  const [scheduledTomorrowTotalPages, setScheduledTomorrowTotalPages] = useState(1);
  const [scheduledNext7TotalPages, setScheduledNext7TotalPages] = useState(1);
  // pageSize is a constant, not a state variable
  const pageSize = 5;

  // Schedule popup handlers (must be above columns definition)
  // Reschedule popup state
  const [reschedulePopupOpen, setReschedulePopupOpen] = useState(false);
  const [reschedulePopupId, setReschedulePopupId] = useState(null);
  const [reschedulePopupDatetime, setReschedulePopupDatetime] = useState("");
  const [reschedulePopupNote, setReschedulePopupNote] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const openSchedulePopup = (id) => {
    setSchedulePopupId(id);
    setSchedulePopupDatetime("");
    setSchedulePopupOpen(true);
  };

  const openReschedulePopup = (id) => {
    setReschedulePopupId(id);
    setReschedulePopupDatetime("");
    setReschedulePopupNote("");
    setReschedulePopupOpen(true);
  };

  const closeReschedulePopup = () => {
    setReschedulePopupOpen(false);
    setReschedulePopupId(null);
    setReschedulePopupDatetime("");
    setReschedulePopupNote("");
  };

  const closeSchedulePopup = () => {
    setSchedulePopupOpen(false);
    setSchedulePopupId(null);
    setSchedulePopupDatetime("");
  };

  const handleScheduleConfirm = async () => {
    if (!schedulePopupId || !schedulePopupDatetime) return;
    setScheduleLoading(true);
    try {
      await scheduleTrial(schedulePopupId, schedulePopupDatetime);
      closeSchedulePopup();
      // Refresh contacted and scheduled tabs if needed
      if (activeTab === 'contacted') await getContactedTrials(page);
      if (activeTab === 'scheduled') {
        if (activeScheduleTab === 'all') await getScheduledTrialsAll(schedulePage);
        else if (activeScheduleTab === 'today') await getScheduledTrialsToday(schedulePage);
        else if (activeScheduleTab === 'tomorrow') await getScheduledTrialsTomorrow(schedulePage);
        else if (activeScheduleTab === 'next7') await getScheduledTrialsNext7(schedulePage);
        else if (activeScheduleTab === 'past') await getScheduledTrialsPast(schedulePage);
      }
    } finally {
      setScheduleLoading(false);
    }
  };


  // API: Reschedule trial
  const rescheduleTrial = async (id, datetime, note) => {
    const token = localStorage.getItem("authToken");
    await axios.put(
      `${apiUri}/dashboard/reschedule-trial/${id}`,
      { newScheduledDateTime: datetime, note },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  // API: Complete trial
  const completeTrial = async (id) => {
    const token = localStorage.getItem("authToken");
    await axios.put(
      `${apiUri}/dashboard/mark-trial-completed/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  // Reschedule confirm handler
  const handleRescheduleConfirm = async () => {
    if (!reschedulePopupId || !reschedulePopupDatetime || !reschedulePopupNote.trim()) return;
    setRescheduleLoading(true);
    try {
      await rescheduleTrial(reschedulePopupId, reschedulePopupDatetime, reschedulePopupNote.trim());
      closeReschedulePopup();
      // Refresh scheduled tabs
      if (activeTab === 'scheduled') {
        if (activeScheduleTab === 'all') await getScheduledTrialsAll(schedulePage);
        else if (activeScheduleTab === 'today') await getScheduledTrialsToday(schedulePage);
        else if (activeScheduleTab === 'tomorrow') await getScheduledTrialsTomorrow(schedulePage);
        else if (activeScheduleTab === 'next7') await getScheduledTrialsNext7(schedulePage);
        else if (activeScheduleTab === 'past') await getScheduledTrialsPast(schedulePage);
      }
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Mark as completed handler
  const handleMarkCompleted = async (id) => {
    if (!id) return;
    setScheduleLoading(true);
    try {
      await completeTrial(id);
      // Refresh scheduled tabs
      if (activeTab === 'scheduled') {
        if (activeScheduleTab === 'all') await getScheduledTrialsAll(schedulePage);
        else if (activeScheduleTab === 'today') await getScheduledTrialsToday(schedulePage);
        else if (activeScheduleTab === 'tomorrow') await getScheduledTrialsTomorrow(schedulePage);
        else if (activeScheduleTab === 'next7') await getScheduledTrialsNext7(schedulePage);
        else if (activeScheduleTab === 'past') await getScheduledTrialsPast(schedulePage);
      }
    } finally {
      setScheduleLoading(false);
    }
  };

  // All useEffect and function definitions below this line

  // Fetch scheduled trials when scheduled tab or schedule sub-tab or schedulePage changes
  useEffect(() => {
    if (activeTab !== 'scheduled') return;
    if (activeScheduleTab === 'all') {
      getScheduledTrialsAll(schedulePage);
    } else if (activeScheduleTab === 'today') {
      getScheduledTrialsToday(schedulePage);
    } else if (activeScheduleTab === 'tomorrow') {
      getScheduledTrialsTomorrow(schedulePage);
    } else if (activeScheduleTab === 'next7') {
      getScheduledTrialsNext7(schedulePage);
        } else if (activeScheduleTab === 'past') {
      getScheduledTrialsPast(schedulePage);
    }
  }, [activeTab, activeScheduleTab, schedulePage]);
  // Fetch past scheduled trials
  const getScheduledTrialsPast = async (pageNum = 1) => {
    setScheduledTrialsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${apiUri}/dashboard/past-scheduled-trials`,
        {
          params: { page: pageNum },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setScheduledTrialsPast(response.data.trials || []);
      setScheduledPastTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      setScheduledTrialsPast([]);
      setScheduledPastTotalPages(1);
    } finally {
      setScheduledTrialsLoading(false);
    }
  };

  // Reset schedulePage to 1 when schedule tab or sub-tab changes
  useEffect(() => {
    setSchedulePage(1);
  }, [activeScheduleTab, activeTab]);

  // Helper to paginate any array
  const paginate = (arr) => {
    const start = (page - 1) * pageSize;
    return arr.slice(start, start + pageSize);
  };

  // Remove getTabRows and getScheduleRows for now (not needed for API tabs)

  // handleStage is now a no-op or can be removed, since local rows are not used
  const handleStage = () => {};

  const openCancelPopup = (id) => {
    setCancelId(id);
    setCancelNote("");
    setCancelPopupOpen(true);
  };
  const closeCancelPopup = () => {
    setCancelPopupOpen(false);
    setCancelId(null);
    setCancelNote("");
  };

  const handleCancelConfirm = async () => {
    if (!cancelId || !cancelNote.trim()) return;
    console.log('Confirm Cancel pressed', { id: cancelId, note: cancelNote.trim() });
    setCancelLoading(true);
    try {
      await cancelTrial(cancelId, cancelNote.trim());
      closeCancelPopup();
      // Refresh cancelled, new, and contacted trials if needed
      if (activeTab === 'cancelled') await getCanceledTrials(page);
      if (activeTab === 'new') await getNewTrials(page);
      if (activeTab === 'contacted') await getContactedTrials(page);
      // Refresh scheduled tab if needed
      if (activeTab === 'scheduled') {
        if (activeScheduleTab === 'all') await getScheduledTrialsAll(schedulePage);
        else if (activeScheduleTab === 'today') await getScheduledTrialsToday(schedulePage);
        else if (activeScheduleTab === 'tomorrow') await getScheduledTrialsTomorrow(schedulePage);
        else if (activeScheduleTab === 'next7') await getScheduledTrialsNext7(schedulePage);
        else if (activeScheduleTab === 'past') await getScheduledTrialsPast(schedulePage);
      }
    } finally {
      setCancelLoading(false);
    }
  };

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Gender", accessor: "gender" },
    { header: "Category", accessor: "category" },
    // Add Scheduled Date & Time column for scheduled tab
    ...(activeTab === 'scheduled' ? [{
      header: "Scheduled Date & Time",
      accessor: "scheduledDateTime",
      render: (row) => row.scheduledDateTime ? dayjs(row.scheduledDateTime).format('DD MMM YYYY, HH:mm') : "-"
    }] : []),
    {
      header: "Created At",
      accessor: "createdAt",
      render: (row) => row.createdAt ? dayjs(row.createdAt).format('DD MMM YYYY, HH:mm') : "-",
    },
    // Show Cancelation Note column only for cancelled tab
    ...(activeTab === 'cancelled' ? [{
      header: "Cancelation Note",
      accessor: "cancelationNote",
      render: (row) => row.cancelationNote || "-"
    }] : []),
    {
      render: (row) => {
        // Scheduled tab: show 3 buttons (Reschedule, Mark as Completed, Cancel) for scheduled rows
        if (activeTab === 'scheduled') {
          return (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
              <button
                className="btn reschedule-btn"
                style={{ minWidth: 90, padding: '6px 10px', fontWeight: 600, fontSize: 13, background: '#fffbe6', color: '#b26a00', border: '1px solid #ffe58f', borderRadius: 5, display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => openReschedulePopup(row._id)}
              >
                <svg width="16" height="16" fill="#b26a00" viewBox="0 0 20 20" style={{marginRight: 2}}><path d="M10 2a8 8 0 1 1-7.446 4.89.75.75 0 1 1 1.392-.56A6.5 6.5 0 1 0 10 3.5V6a.75.75 0 0 1-1.5 0V2.75A.75.75 0 0 1 9.25 2H10z"/></svg>
                Reschedule
              </button>
              <button
                className="btn complete-btn"
                style={{ minWidth: 90, padding: '6px 10px', fontWeight: 600, fontSize: 13, background: '#e6ffed', color: '#237804', border: '1px solid #b7eb8f', borderRadius: 5, display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => handleMarkCompleted(row._id)}
              >
                <svg width="16" height="16" fill="#237804" viewBox="0 0 20 20" style={{marginRight: 2}}><path d="M7.629 14.29a1 1 0 0 1-1.415 0l-3.5-3.5a1 1 0 1 1 1.415-1.415l2.793 2.793 6.793-6.793a1 1 0 0 1 1.415 1.415l-7.5 7.5z"/></svg>
                Completed
              </button>
              <button
                className="btn cancel-btn"
                style={{ minWidth: 80, padding: '6px 10px', fontWeight: 600, fontSize: 13, background: '#fff1f0', color: '#a8071a', border: '1px solid #ffa39e', borderRadius: 5, display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => openCancelPopup(row._id)}
              >
                <svg width="16" height="16" fill="#a8071a" viewBox="0 0 20 20" style={{marginRight: 2}}><path d="M10 8.586l4.95-4.95a1 1 0 1 1 1.414 1.415L11.414 10l4.95 4.95a1 1 0 0 1-1.414 1.415L10 11.414l-4.95 4.95a1 1 0 0 1-1.415-1.415L8.586 10l-4.95-4.95A1 1 0 1 1 5.05 3.636L10 8.586z"/></svg>
                Cancel
              </button>
            </div>
          );
        }

        if (row.status === "new") {
          return (
            <span style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn contact-btn"
                onClick={() => markAsContacted(row._id)}
                disabled={contactedLoadingId === row._id}
                style={{ minWidth: 110, padding: '6px 10px', fontWeight: 600, fontSize: 13, background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff', borderRadius: 5, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {contactedLoadingId === row._id ? (
                  <span className="loader" style={{
                    width: 18,
                    height: 18,
                    border: '3px solid #fff',
                    borderTop: '3px solid #1976d2',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 1s linear infinite',
                    marginRight: 8
                  }}></span>
                ) : (
                  <svg width="16" height="16" fill="#0958d9" viewBox="0 0 20 20" style={{marginRight: 2}}><path d="M2.003 5.884l2-3.5A2 2 0 0 1 5.617 1h8.766a2 2 0 0 1 1.614.884l2 3.5A2 2 0 0 1 18 7.382V15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7.382a2 2 0 0 1 .003-.498zM4.618 3l-2 3.5V15a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6.5l-2-3.5H4.618z"/></svg>
                )}
                Contacted
              </button>
              <button className="btn cancel-btn" style={{ minWidth: 80, padding: '6px 10px', fontWeight: 600, fontSize: 13, background: '#fff1f0', color: '#a8071a', border: '1px solid #ffa39e', borderRadius: 5, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => openCancelPopup(row._id)}>
                <svg width="16" height="16" fill="#a8071a" viewBox="0 0 20 20" style={{marginRight: 2}}><path d="M10 8.586l4.95-4.95a1 1 0 1 1 1.414 1.415L11.414 10l4.95 4.95a1 1 0 0 1-1.414 1.415L10 11.414l-4.95 4.95a1 1 0 0 1-1.415-1.415L8.586 10l-4.95-4.95A1 1 0 1 1 5.05 3.636L10 8.586z"/></svg>
                Cancel
              </button>
            </span>
          );
        }
        if (row.status === "contacted") {
          return (
            <span style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn schedule-btn"
                onClick={() => openSchedulePopup(row._id)}
                style={{ minWidth: 90, padding: '6px 10px', fontWeight: 600, fontSize: 13, background: '#fffbe6', color: '#b26a00', border: '1px solid #ffe58f', borderRadius: 5, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <svg width="16" height="16" fill="#b26a00" viewBox="0 0 20 20" style={{marginRight: 2}}><path d="M6 2a1 1 0 0 1 1 1v1h6V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1zm0 2V3H4v1h2zm8 0V3h-2v1h2zM3 8v8h14V8H3z"/></svg>
                Schedule
              </button>
              <button className="btn cancel-btn" style={{ minWidth: 80, padding: '6px 10px', fontWeight: 600, fontSize: 13, background: '#fff1f0', color: '#a8071a', border: '1px solid #ffa39e', borderRadius: 5, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => openCancelPopup(row._id)}>
                <svg width="16" height="16" fill="#a8071a" viewBox="0 0 20 20" style={{marginRight: 2}}><path d="M10 8.586l4.95-4.95a1 1 0 1 1 1.414 1.415L11.414 10l4.95 4.95a1 1 0 0 1-1.414 1.415L10 11.414l-4.95 4.95a1 1 0 0 1-1.415-1.415L8.586 10l-4.95-4.95A1 1 0 1 1 5.05 3.636L10 8.586z"/></svg>
                Cancel
              </button>
            </span>
          );
        }
        if (row.status === "completed") {
          return (<span style={{ color: '#10b981', fontWeight: 600 }}>Completed</span>);
        }
        if (row.status === "cancelled") {
          return (<span style={{ color: '#ef4444', fontWeight: 600 }}>Cancelled{row.cancelNote ? `: ${row.cancelNote}` : ""}</span>);
        }
        return null;
      },
    },
  ];

  // Remove local scheduleRows logic (not needed for API tabs)


  const getNewTrials = async () => {
    setNewTrialsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${apiUri}/dashboard/new-trials`,
        {
          params: { page },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewTrials(response.data.trials || []);
      setNewTrialsTotal(response.data.pagination?.totalItems || 0);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      setNewTrials([]);
      setNewTrialsTotal(0);
      setTotalPages(1);
    }
    setNewTrialsLoading(false);

  }

  // Fetch contacted trials from API
  const getContactedTrials = async (pageNum) => {
      setContactedTrialsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${apiUri}/dashboard/contacted-trials`,
        {
          params: { page: pageNum },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
        setContactedTrials(response.data.trials || []);
        setContactedTrialsTotal(response.data.pagination?.totalItems || 0);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
        setContactedTrials([]);
        setContactedTrialsTotal(0);
      setTotalPages(1);
    }
      setContactedTrialsLoading(false);
  };


  // Fetch all scheduled trials
  const getScheduledTrialsAll = async (pageNum = 1) => {
    setScheduledTrialsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${apiUri}/dashboard/all-scheduled-trials`,
        {
          params: { page: pageNum },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setScheduledTrialsAll(response.data.trials || []);
      setScheduledAllTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      setScheduledTrialsAll([]);
      setScheduledAllTotalPages(1);
    } finally {
      setScheduledTrialsLoading(false);
    }
  };

  // Fetch today's scheduled trials
  const getScheduledTrialsToday = async (pageNum = 1) => {
    setScheduledTrialsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${apiUri}/dashboard/today-scheduled-trials`,
        {
          params: { page: pageNum },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setScheduledTrialsToday(response.data.trials || []);
      setScheduledTodayTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      setScheduledTrialsToday([]);
      setScheduledTodayTotalPages(1);
    } finally {
      setScheduledTrialsLoading(false);
    }
  };

  // Fetch tomorrow's scheduled trials
  const getScheduledTrialsTomorrow = async (pageNum = 1) => {
    setScheduledTrialsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${apiUri}/dashboard/tomorrow-scheduled-trials`,
        {
          params: { page: pageNum },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setScheduledTrialsTomorrow(response.data.trials || []);
      setScheduledTomorrowTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      setScheduledTrialsTomorrow([]);
      setScheduledTomorrowTotalPages(1);
    } finally {
      setScheduledTrialsLoading(false);
    }
  };

  // Fetch next 7 days' scheduled trials
  const getScheduledTrialsNext7 = async (pageNum = 1) => {
    setScheduledTrialsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${apiUri}/dashboard/next7days-scheduled-trials`,
        {
          params: { page: pageNum },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setScheduledTrialsNext7(response.data.trials || []);
      setScheduledNext7TotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      setScheduledTrialsNext7([]);
      setScheduledNext7TotalPages(1);
    } finally {
      setScheduledTrialsLoading(false);
    }
  };


  const getCanceledTrials = async () => {
    setCancelledTrialsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${apiUri}/dashboard/canceled-trials`,
        {
          params: { page },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCancelledTrials(response.data.trials || []);
      setCancelledTrialsTotal(response.data.pagination?.totalItems || 0);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      setCancelledTrials([]);
      setCancelledTrialsTotal(0);
      setTotalPages(1);
    } finally {
      setCancelledTrialsLoading(false);
    }
  };

  const cancelTrial = async (id, note) => {
    const token = localStorage.getItem("authToken");
    await axios.put(
      `${apiUri}/dashboard/cancel-trial/${id}`,
      { cancelationNote: note },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // Update local rows for non-API tabs
    // No local rows to update
  };

  const markAsContacted = async (id) => {
    setContactedLoadingId(id);
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `${apiUri}/dashboard/mark-trial-contacted/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh new trials list after marking as contacted
      if (activeTab === 'new') await getNewTrials(page);
      if (activeTab === 'contacted') await getNewTrials(page); // or a getContactedTrials(page) if you have one
    } finally {
      setContactedLoadingId(null);
    }
  };

  const scheduleTrial = async (id, datetime) => {
    const token = localStorage.getItem("authToken");
    await axios.put(
      `${apiUri}/dashboard/schedule-trial/${id}`,
      { scheduledDateTime: datetime },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // Update local rows for non-API tabs
    // No local rows to update
  };




  // Reset page to 1 when tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // Fetch trials from API when tab or page changes
  useEffect(() => {
    if (activeTab === 'new') {
      getNewTrials(page);
    } else if (activeTab === 'contacted') {
      getContactedTrials(page);
    } else if (activeTab === 'cancelled') {
      getCanceledTrials(page);
    } else if (activeTab === 'completed') {
      getCompletedTrials(page);
    }
  }, [activeTab, page]);

  // Remove tabRows (not needed for API tabs)

  return (
    <>
      <h2>Trials</h2>
      <div className="gq-tabs" style={{ marginBottom: 18 }}>
        {tabs.map(tab => (
          <button
            key={tab}
            className={"gq-tab" + (activeTab === tab ? " active" : "")}
            onClick={() => setActiveTab(tab)}
          >
            {statusLabels[tab]}
          </button>
        ))}
      </div>
      {/* Special schedule tabs for scheduled trials */}
      {activeTab === "scheduled" && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 18, justifyContent: 'center' }}>
          {scheduleTabs.map(tab => (
            <button
              key={tab.key}
              style={{
                background: activeScheduleTab === tab.key ? tab.bg : '#f5f5f5',
                color: activeScheduleTab === tab.key ? tab.color : '#333',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '1.1rem',
                padding: '10px 24px',
                boxShadow: activeScheduleTab === tab.key ? '0 2px 8px rgba(25,118,210,0.08)' : 'none',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.18s',
              }}
              onClick={() => { setActiveScheduleTab(tab.key); setSchedulePage(1); }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      {/* Table for main tabs */}
      {activeTab !== "scheduled" && (
        <>
          {(newTrialsLoading || cancelledTrialsLoading || completedTrialsLoading) ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
              <span className="loader" style={{
                width: 40,
                height: 40,
                border: '5px solid #1976d2',
                borderTop: '5px solid #fff',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 1s linear infinite',
                marginRight: 16
              }}></span>
              <span style={{ fontSize: 20, color: '#1976d2', fontWeight: 600 }}>Loading...</span>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
            </div>
          ) : activeTab === 'new' ? (
            <>
              <Table columns={columns} rows={newTrials} emptyText="No trials found" />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
                <span>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
              </div>
            </>
          ) : activeTab === 'contacted' ? (
            <>
                <Table columns={columns} rows={contactedTrials} emptyText="No contacted trials" />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
                <span>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
              </div>
            </>
          ) : activeTab === 'cancelled' ? (
            <>
              <Table columns={columns} rows={cancelledTrials} emptyText="No cancelled trials" />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
                <span>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
              </div>
            </>
          ) : activeTab === 'completed' ? (
            <>
              <Table columns={columns} rows={completedTrials} emptyText="No completed trials" />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
                <span>Page {page} of {completedTrialsTotalPages}</span>
                <button onClick={() => setPage(p => Math.min(completedTrialsTotalPages, p + 1))} disabled={page === completedTrialsTotalPages}>Next</button>
              </div>
            </>
          ) : null}
        </>
      )}
      {/* Table for schedule tabs with pagination */}
      {activeTab === "scheduled" && (
        <>
          {scheduledTrialsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
              <span className="loader" style={{
                width: 40,
                height: 40,
                border: '5px solid #1976d2',
                borderTop: '5px solid #fff',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 1s linear infinite',
                marginRight: 16
              }}></span>
              <span style={{ fontSize: 20, color: '#1976d2', fontWeight: 600 }}>Loading...</span>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                rows={
                  activeScheduleTab === 'all' ? scheduledTrialsAll :
                  activeScheduleTab === 'today' ? scheduledTrialsToday :
                  activeScheduleTab === 'tomorrow' ? scheduledTrialsTomorrow :
                  activeScheduleTab === 'next7' ? scheduledTrialsNext7 :
                  activeScheduleTab === 'past' ? scheduledTrialsPast :
                  []
                }
                emptyText="No scheduled trials"
              />
              {/* Pagination for scheduled trials (if needed) */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                <button onClick={() => setSchedulePage(p => Math.max(1, p - 1))} disabled={schedulePage === 1}>Prev</button>
                <span>Page {schedulePage} of {
                  activeScheduleTab === 'all' ? scheduledAllTotalPages :
                  activeScheduleTab === 'today' ? scheduledTodayTotalPages :
                  activeScheduleTab === 'tomorrow' ? scheduledTomorrowTotalPages :
                  activeScheduleTab === 'next7' ? scheduledNext7TotalPages :
                  activeScheduleTab === 'past' ? scheduledPastTotalPages : 1
                }</span>
                <button
                  onClick={() => setSchedulePage(p => Math.min(
                    (activeScheduleTab === 'all' ? scheduledAllTotalPages :
                      activeScheduleTab === 'today' ? scheduledTodayTotalPages :
                      activeScheduleTab === 'tomorrow' ? scheduledTomorrowTotalPages :
                      activeScheduleTab === 'next7' ? scheduledNext7TotalPages :
                      activeScheduleTab === 'past' ? scheduledPastTotalPages : 1),
                    p + 1
                  ))}
                  disabled={
                    schedulePage === (
                      activeScheduleTab === 'all' ? scheduledAllTotalPages :
                      activeScheduleTab === 'today' ? scheduledTodayTotalPages :
                      activeScheduleTab === 'tomorrow' ? scheduledTomorrowTotalPages :
                      activeScheduleTab === 'next7' ? scheduledNext7TotalPages :
                      activeScheduleTab === 'past' ? scheduledPastTotalPages : 1
                    )
                  }
                >Next</button>
              </div>
            </>
          )}
        </>
      )}



      {/* Schedule popup modal */}
      {schedulePopupOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 12, minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>
            <h3 style={{ marginBottom: 16 }}>Schedule Trial</h3>
            <div style={{ marginBottom: 12 }}>Select date and time for scheduling:</div>
            <input
              type="datetime-local"
              value={schedulePopupDatetime}
              onChange={e => setSchedulePopupDatetime(e.target.value)}
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginBottom: 16 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn" onClick={closeSchedulePopup}>Close</button>
              <button className="btn primary" style={{ fontWeight: 600 }} disabled={!schedulePopupDatetime || scheduleLoading} onClick={handleScheduleConfirm}>
                {scheduleLoading ? "Scheduling..." : "Confirm Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Cancel popup modal */}
      {cancelPopupOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 12, minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>
            <h3 style={{ marginBottom: 16 }}>Cancel Trial</h3>
            <div style={{ marginBottom: 12 }}>Please provide a short cancellation note:</div>
            <textarea
              value={cancelNote}
              onChange={e => setCancelNote(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginBottom: 16 }}
              placeholder="Enter cancellation note..."
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn" onClick={closeCancelPopup}>Close</button>
              <button className="btn cancel-btn" style={{ fontWeight: 600 }} disabled={!cancelNote.trim() || cancelLoading} onClick={handleCancelConfirm}>
                {cancelLoading ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Reschedule popup modal */}
      {reschedulePopupOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 2200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 12, minWidth: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>
            <h3 style={{ marginBottom: 16 }}>Reschedule Trial</h3>
            <div style={{ marginBottom: 12 }}>Select new date and time:</div>
            <input
              type="datetime-local"
              value={reschedulePopupDatetime}
              onChange={e => setReschedulePopupDatetime(e.target.value)}
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginBottom: 16 }}
            />
            <div style={{ marginBottom: 12 }}>Reason for rescheduling:</div>
            <textarea
              value={reschedulePopupNote}
              onChange={e => setReschedulePopupNote(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginBottom: 16 }}
              placeholder="Enter reason..."
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn" onClick={closeReschedulePopup}>Close</button>
              <button className="btn primary" style={{ fontWeight: 600 }}
                disabled={!reschedulePopupDatetime || !reschedulePopupNote.trim() || rescheduleLoading}
                onClick={handleRescheduleConfirm}
              >
                {rescheduleLoading ? "Rescheduling..." : "Confirm Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loader overlay for cancel action */}
      {cancelLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(255,255,255,0.7)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            padding: 32,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            fontSize: 24,
            fontWeight: 600,
            color: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}>
            <span className="loader" style={{
              width: 32,
              height: 32,
              border: '4px solid #1976d2',
              borderTop: '4px solid #fff',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 1s linear infinite'
            }}></span>
            Cancelling trial...
          </div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
        </div>
      )}
    </>
  );
}
