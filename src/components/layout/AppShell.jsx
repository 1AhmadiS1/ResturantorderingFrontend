import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-shell__main">
        <Header onOpenMenu={() => setSidebarOpen(true)} />
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  );
}
