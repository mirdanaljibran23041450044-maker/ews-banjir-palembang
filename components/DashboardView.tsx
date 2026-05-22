"use client";

import React, { useState, useEffect } from "react";
import { useEws } from "./EwsContext";

export const DashboardView: React.FC = () => {
  const { sensors, reports, notifications, config, triggerMockUpdate } = useEws();

  // Determine highest alert status
  const sensorStatuses = sensors.map((sensor) => {
    if (sensor.waterLevel >= config.darurat) return { label: "DARURAT", color: "red", bg: "bg-red-500", text: "text-red-500" };
    if (sensor.waterLevel >= config.siaga) return { label: "SIAGA", color: "warning", bg: "bg-amber-500", text: "text-amber-500" };
    return { label: "NORMAL", color: "success", bg: "bg-emerald-500", text: "text-emerald-500" };
  });

  const hasDarurat = sensorStatuses.some((s) => s.label === "DARURAT");
  const hasSiaga = sensorStatuses.some((s) => s.label === "SIAGA");

  let cityStatus = {
    label: "NORMAL",
    class: "bg-emerald-50 text-emerald-700 border-emerald-200",
    indicatorClass: "bg-emerald-500",
    desc: "Seluruh titik pemantauan kritis terpantau di bawah ambang batas bahaya banjir. Aliran drainase kota lancar.",
  };

  if (hasDarurat) {
    cityStatus = {
      label: "DARURAT",
      class: "bg-red-50 text-red-700 border-red-200 animate-pulse-danger",
      indicatorClass: "bg-red-500",
      desc: "PERINGATAN UTAMA: Beberapa titik sensor kritis telah melampaui ambang batas darurat! Dinas PUPR & BPBD siaga penuh.",
    };
  } else if (hasSiaga) {
    cityStatus = {
      label: "SIAGA",
      class: "bg-amber-50 text-amber-700 border-amber-200 animate-pulse-warning",
      indicatorClass: "bg-amber-500",
      desc: "Waspada! Ketinggian air pada beberapa titik kritis mendekati batas bahaya. Koordinasi tim lapangan diaktifkan.",
    };
  }

  // Calculate statistics
  const activeReportsCount = reports.filter((r) => r.status !== "Selesai").length;
  const averageWaterLevel = Math.round(sensors.reduce((acc, curr) => acc + curr.waterLevel, 0) / sensors.length);
  const averageTurbidity = Math.round(sensors.reduce((acc, curr) => acc + curr.turbidity, 0) / sensors.length);

  // Hardcoded but clean stats
  const curahHujan = 84; // mm (BMKG)
  const pasangMusi = 2.4; // m

  // Mini Chart data simulation: we draw an SVG path for water level trend.
  // We can create a simple list of mock trend data for the last 6 iterations.
  const [levelHistory, setLevelHistory] = useState<number[]>([110, 115, 108, 120, 125, 118, 135]);

  useEffect(() => {
    // Append average water level to history, keep last 10 points
    setLevelHistory((prev) => {
      const next = [...prev, averageWaterLevel];
      if (next.length > 10) next.shift();
      return next;
    });
  }, [averageWaterLevel]);

  // Construct SVG points
  const chartWidth = 500;
  const chartHeight = 120;
  const maxVal = 200;
  const minVal = 30;

  const points = levelHistory
    .map((val, idx) => {
      const x = (idx / (levelHistory.length - 1)) * chartWidth;
      // invert y (svg coordinates)
      const ratio = (val - minVal) / (maxVal - minVal);
      const y = chartHeight - ratio * (chartHeight - 20) - 10;
      return `${x},${y}`;
    })
    .join(" ");

  const fillPoints = `${points} ${chartWidth},${chartHeight} 0,${chartHeight}`;

  return (
    <div className="space-y-6">
      
      {/* 1. CITY STATUS BANNER */}
      <div className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${cityStatus.class}`}>
        <div className="flex items-center gap-4">
          <div className="relative flex h-4 w-4">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cityStatus.indicatorClass}`} />
            <span className={`relative inline-flex rounded-full h-4 w-4 ${cityStatus.indicatorClass}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase">STATUS KOTA PALEMBANG: {cityStatus.label}</h3>
            <p className="text-xs font-semibold opacity-90 mt-1 max-w-2xl">{cityStatus.desc}</p>
          </div>
        </div>
        <button
          onClick={triggerMockUpdate}
          className="px-4 py-2 bg-white text-slate-800 text-xs font-bold rounded-xl border border-slate-200/80 hover:bg-slate-50 shadow-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3" />
          </svg>
          Simulasikan Data Baru
        </button>
      </div>

      {/* 2. STATISTIK GRID (Adaptive Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Card 1: Sensor Online */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Node Sensor Online</p>
            <h4 className="text-2xl font-extrabold text-slate-800 mt-1">11 / 11</h4>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Semua Node Aktif</p>
          </div>
        </div>

        {/* Card 2: Curah Hujan BMKG */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Curah Hujan BMKG</p>
            <h4 className="text-2xl font-extrabold text-slate-800 mt-1">{curahHujan} mm</h4>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Klasifikasi: Hujan Sedang</p>
          </div>
        </div>

        {/* Card 3: Pasang Sungai Musi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Ketinggian Pasang Musi</p>
            <h4 className="text-2xl font-extrabold text-slate-800 mt-1">{pasangMusi} m</h4>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Update: 10 Mnt yang lalu</p>
          </div>
        </div>

        {/* Card 4: Laporan Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Laporan Aktif</p>
            <h4 className="text-2xl font-extrabold text-slate-800 mt-1">{activeReportsCount} Kasus</h4>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Butuh Tindak Lanjut</p>
          </div>
        </div>
      </div>

      {/* 3. ROW: CHARTS & LOGS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time SVG Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Tren Grafik Ketinggian Air Kota</h4>
                <p className="text-xs text-slate-400 mt-0.5">Rata-rata level air 11 stasiun pantau (real-time)</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">
                  Rata-rata: {averageWaterLevel} cm
                </span>
              </div>
            </div>
            
            {/* SVG Sparkline Area Chart */}
            <div className="w-full relative h-[140px] bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden flex items-end">
              <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="5 5" />
                <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="5 5" />
                <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="5 5" />

                {/* Filled Area */}
                {levelHistory.length > 1 && (
                  <polygon points={fillPoints} fill="url(#chart-grad)" />
                )}
                
                {/* Stroke Line */}
                {levelHistory.length > 1 && (
                  <polyline points={points} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
                )}

                {/* Markers for last points */}
                {levelHistory.map((val, idx) => {
                  const x = (idx / (levelHistory.length - 1)) * chartWidth;
                  const ratio = (val - minVal) / (maxVal - minVal);
                  const y = chartHeight - ratio * (chartHeight - 20) - 10;
                  const isLast = idx === levelHistory.length - 1;
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r={isLast ? 4.5 : 2}
                      fill={isLast ? "#EF4444" : "#2563EB"}
                      stroke="#ffffff"
                      strokeWidth={isLast ? 2 : 0.5}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4 text-[10px] text-slate-400 font-semibold border-t border-slate-50 pt-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Kekeruhan Rata-rata: {averageTurbidity} NTU
            </span>
            <span>Sensor interval update: 8 detik</span>
          </div>
        </div>

        {/* EWS Notification & Broadcast Logs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-[270px] lg:h-auto">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Log EWS & WA Broadcast</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Siaran peringatan otomatis ke grup koordinasi</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[190px] lg:max-h-[220px] overflow-y-auto pr-1">
              {notifications.filter(n => n.channel === "WhatsApp" || n.channel === "SMS").length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-medium">
                  Belum ada broadcast peringatan terkirim. Status aman.
                </div>
              ) : (
                notifications
                  .filter(n => n.channel === "WhatsApp" || n.channel === "SMS")
                  .map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl border border-slate-50 bg-slate-50/50 flex flex-col gap-1.5 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[9px] font-bold">
                        <span className={`inline-flex px-1.5 py-0.5 rounded ${
                          log.type === "DARURAT"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {log.type}
                        </span>
                        <span className="font-mono text-slate-400">{log.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-normal">{log.message}</p>
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <span className="text-[9px] font-bold text-blue-600">Broadcast {log.channel}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-medium border-t border-slate-50 pt-3 mt-3 flex items-center justify-between">
            <span>WhatsApp Business API Gateway:</span>
            <span className={`font-bold uppercase ${config.isWaEnabled ? "text-emerald-500" : "text-slate-400"}`}>
              {config.isWaEnabled ? "Aktif" : "Non-aktif"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM AREA: CRITICAL POINTS OVERVIEW LIST */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h4 className="font-bold text-slate-800 text-sm">Status Stasiun Sensor Kritis Terdekat</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sensors
            .filter(s => s.waterLevel >= config.siaga)
            .map((sensor) => {
              const isDarurat = sensor.waterLevel >= config.darurat;
              return (
                <div
                  key={sensor.id}
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    isDarurat ? "bg-red-50/50 border-red-100" : "bg-amber-50/50 border-amber-100"
                  }`}
                >
                  <div className="space-y-1">
                    <h5 className="font-bold text-xs text-slate-800 truncate max-w-[160px]">{sensor.street}</h5>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">{sensor.kecamatan}</p>
                    <p className="text-[11px] font-bold text-slate-700 mt-1">
                      Level: <span className={isDarurat ? "text-red-600" : "text-amber-600"}>{sensor.waterLevel} cm</span>
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                    isDarurat ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {isDarurat ? "DARURAT" : "SIAGA"}
                  </span>
                </div>
              );
            })}
          {sensors.filter(s => s.waterLevel >= config.siaga).length === 0 && (
            <div className="col-span-full py-4 text-center text-xs text-slate-400 font-semibold bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              ✓ 11 Stasiun Pemantau dalam kondisi normal. Tidak ada siaga banjir terdeteksi.
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};
