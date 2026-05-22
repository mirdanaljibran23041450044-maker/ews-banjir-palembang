"use client";

import React, { useState, useEffect } from "react";
import { useEws } from "./EwsContext";
import { LoginPage } from "./LoginPage";
import { DashboardView } from "./DashboardView";
import { MapView } from "./MapView";
import { SensorListView } from "./SensorListView";
import { ConfigReportView } from "./ConfigReportView";
import { AdminShell } from "./admin/AdminShell";

export const AppShell: React.FC = () => {
  const {
    isLoggedIn,
    activeTab,
    setActiveTab,
    user,
    logout,
    notifications,
    sensors,
    config,
  } = useEws();

  const [dateStr, setDateStr] = useState("");
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastNotificationId, setLastNotificationId] = useState("");

  // Update date
  useEffect(() => {
    const updateDate = () => {
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      setDateStr(new Date().toLocaleDateString("id-ID", options));
    };
    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync notifications count and flash wiggler
  useEffect(() => {
    // Count alerts (SIAGA/DARURAT)
    const alertNotifs = notifications.filter(n => n.type === "SIAGA" || n.type === "DARURAT");
    setUnreadCount(alertNotifs.length);

    if (notifications.length > 0 && notifications[0].id !== lastNotificationId) {
      setLastNotificationId(notifications[0].id);
      // Automatically show badge/trigger animation
    }
  }, [notifications, lastNotificationId]);

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  if (user?.role === "super_admin" || user?.role === "admin_ops") {
    return <AdminShell />;
  }

  // Get current highest alert level to determine header highlight color or info
  const highestLevel = sensors.reduce((acc, curr) => {
    if (curr.waterLevel >= config.darurat) return "DARURAT";
    if (curr.waterLevel >= config.siaga && acc !== "DARURAT") return "SIAGA";
    return acc;
  }, "NORMAL");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "map":
        return <MapView />;
      case "sensors":
        return <SensorListView />;
      case "config":
        return <ConfigReportView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
      {/* 1. LEFT SIDEBAR (Desktop >= 1024px) */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col fixed inset-y-0 left-0 bg-slate-900 text-white z-20 shadow-xl border-r border-slate-800">
        {/* Brand Header */}
        <div className="h-20 flex items-center gap-3.5 px-6 border-b border-slate-800">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight tracking-wider uppercase">EWS Banjir</h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">Kota Palembang</p>
          </div>
        </div>

        {/* User Profile Summary */}
        <div className="p-5 border-b border-slate-800/60 bg-slate-950/20">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"}
              alt={user?.name}
              className="h-10 w-10 rounded-xl object-cover ring-2 ring-blue-500/30"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider truncate">
                {user?.role === "operator" ? "Petugas PUPR" : "Pengunjung Publik"}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {/* Dashboard */}
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${activeTab === "dashboard"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
            </svg>
            Dashboard Utama
          </button>

          {/* GIS Map */}
          <button
            onClick={() => setActiveTab("map")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${activeTab === "map"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Peta Geospasial
          </button>

          {/* Sensors */}
          <button
            onClick={() => setActiveTab("sensors")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${activeTab === "sensors"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Daftar Sensor IoT
          </button>

          {/* Config & Report */}
          <button
            onClick={() => setActiveTab("config")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${activeTab === "config"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Threshold & Laporan
          </button>
        </nav>

        {/* Logout bottom area */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm text-rose-400 hover:text-white hover:bg-rose-600 transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col lg:pl-72 min-h-screen">
        {/* 2. GLOBAL HEADER */}
        <header className="h-20 flex items-center justify-between px-6 md:px-8 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          {/* Header left */}
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
              EWS Banjir Palembang
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${highestLevel === "DARURAT"
                ? "bg-red-100 text-red-700 animate-pulse"
                : highestLevel === "SIAGA"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
                }`}>
                {highestLevel}
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">{dateStr || "Memuat tanggal..."}</p>
          </div>

          {/* Header right */}
          <div className="flex items-center gap-4 relative">

            {/* Active Notifications log icon (with wiggler) */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className={`p-2 rounded-xl text-slate-600 hover:bg-slate-50 border border-slate-100 transition-all relative cursor-pointer ${unreadCount > 0 ? "text-blue-600 hover:text-blue-700" : ""
                  }`}
              >
                <svg
                  className={`w-5 h-5 ${unreadCount > 0 ? "animate-wiggle" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown list */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-3.5 w-80 sm:w-96 rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/80 z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">Riwayat Peringatan Otomatis</span>
                    <span className="text-[10px] bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                      {notifications.length} Total
                    </span>
                  </div>

                  <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">Tidak ada log notifikasi.</div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold ${notif.type === "DARURAT"
                              ? "bg-red-100 text-red-700"
                              : notif.type === "SIAGA"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                              }`}>
                              {notif.type}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">{notif.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-normal">{notif.message}</p>
                          <div className="mt-1 flex items-center gap-1">
                            <span className="text-[9px] text-slate-400 font-semibold uppercase">Channel:</span>
                            <span className="text-[9px] font-bold text-slate-500">{notif.channel}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 text-center border-t border-slate-100 bg-slate-50/50">
                    <button
                      onClick={() => setShowNotifDropdown(false)}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700"
                    >
                      Tutup Panel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Mobile Only Button */}
            <button
              onClick={logout}
              className="lg:hidden p-2 rounded-xl text-rose-500 hover:bg-rose-50 border border-slate-100 transition-all cursor-pointer"
              title="Keluar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>

            {/* Mobile Header User Info Summary */}
            <div className="hidden sm:flex items-center gap-2 border-l border-slate-100 pl-4">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"}
                alt={user?.name}
                className="h-8 w-8 rounded-lg object-cover ring-2 ring-slate-100"
              />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-700">{user?.name}</p>
                <p className="text-[9px] text-slate-400 font-semibold uppercase">{user?.role}</p>
              </div>
            </div>

          </div>
        </header>

        {/* 3. MAIN APP ROUTER CONTENT PANELS */}
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 space-y-6 pb-24 lg:pb-8">
          {renderContent()}
        </main>

        {/* 4. BOTTOM FLOATING NAV BAR (Mobile < 1024px) */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-lg z-30 px-4 py-2 flex items-center justify-around">
          {/* Dashboard */}
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${activeTab === "dashboard" ? "text-blue-600 font-bold scale-105" : "text-slate-400 text-xs font-medium"
              }`}
          >
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
            </svg>
            <span className="text-[10px] mt-1">Dashboard</span>
          </button>

          {/* Map */}
          <button
            onClick={() => setActiveTab("map")}
            className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${activeTab === "map" ? "text-blue-600 font-bold scale-105" : "text-slate-400 text-xs font-medium"
              }`}
          >
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] mt-1">Peta GIS</span>
          </button>

          {/* Sensors */}
          <button
            onClick={() => setActiveTab("sensors")}
            className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${activeTab === "sensors" ? "text-blue-600 font-bold scale-105" : "text-slate-400 text-xs font-medium"
              }`}
          >
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-[10px] mt-1">Sensor IoT</span>
          </button>

          {/* Config & Report */}
          <button
            onClick={() => setActiveTab("config")}
            className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${activeTab === "config" ? "text-blue-600 font-bold scale-105" : "text-slate-400 text-xs font-medium"
              }`}
          >
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] mt-1">Lapor & Set</span>
          </button>
        </div>
      </div>
    </div>
  );
};
