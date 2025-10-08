import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  return (
    <div className="app">
      <aside className="sidebar"><Sidebar /></aside>
      <main className="content">
        <Topbar />
        <div className="page"><Outlet /></div>
      </main>
    </div>
  );
}
