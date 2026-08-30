import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-shell min-h-screen bg-[#fff8f4] text-[#2f2325]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-shell__main min-h-screen min-[981px]:ml-[244px]">
        <Header onOpenMenu={() => setSidebarOpen(true)} />
        <main className="page-content mx-auto max-w-[1440px] px-3 pb-24 pt-3.5 sm:px-5 sm:pb-10 sm:pt-6 min-[981px]:px-[clamp(21px,3vw,42px)] min-[981px]:pb-[55px] min-[981px]:pt-[34px]"><Outlet /></main>
      </div>
    </div>
  );
}
