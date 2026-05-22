"use client";

import React, { useState } from "react";
import { useEws, Sensor } from "./EwsContext";

export const MapView: React.FC = () => {
  const { sensors, config, selectedSensor, setSelectedSensor } = useEws();
  const [searchQuery, setSearchQuery] = useState("");

  // Projection function: maps Palembang Lat/Lng coordinates to SVG viewBox (800x500)
  // Bounding box: Lat -2.90 to -3.00, Lng 104.70 to 104.78
  const project = (lat: number, lng: number) => {
    const minLng = 104.70;
    const maxLng = 104.78;
    const minLat = -2.90;
    const maxLat = -3.00;

    const x = ((lng - minLng) / (maxLng - minLng)) * 700 + 50;
    const y = ((lat - minLat) / (maxLat - minLat)) * 400 + 50; // invert y as SVG goes down
    return { x, y };
  };

  // Status check helper
  const getSensorStatus = (sensor: Sensor) => {
    if (sensor.waterLevel >= config.darurat) return "DARURAT";
    if (sensor.waterLevel >= config.siaga) return "SIAGA";
    return "NORMAL";
  };

  // Filter sensors based on search query (by street or kecamatan)
  const filteredSensors = sensors.filter(
    (s) =>
      s.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.kecamatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMarkerClick = (sensor: Sensor) => {
    setSelectedSensor(sensor);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedSensor(null);
  };

  return (
    <div className="flex-1 flex flex-col relative min-h-[500px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
      
      {/* 1. FLOATING CONTROLS: SEARCH BAR */}
      <div className="absolute top-4 left-4 z-10 w-full max-w-xs sm:max-w-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Cari Kecamatan atau Jalan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-8 py-2.5 bg-slate-900/90 text-white placeholder-slate-400 border border-slate-800 rounded-2xl shadow-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 2. FLOATING CONTROLS: LEGEND OVERLAY */}
      <div className="absolute bottom-4 right-4 z-10 bg-slate-900/90 border border-slate-850 p-3.5 rounded-2xl shadow-lg backdrop-blur-md text-[10px] space-y-2 text-slate-300">
        <p className="font-bold text-white uppercase tracking-wider mb-1.5 border-b border-slate-800 pb-1">Status Sensor</p>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20" />
          <span>Normal (&lt; {config.siaga}cm)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/20" />
          <span>Siaga ({config.siaga}cm - {config.darurat}cm)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/20 animate-pulse" />
          <span>Darurat (&ge; {config.darurat}cm)</span>
        </div>
      </div>

      {/* 3. SVG MAP CANVAS */}
      <div className="flex-1 w-full h-full min-h-[460px] relative overflow-hidden flex items-center justify-center p-4">
        <svg
          viewBox="0 0 800 500"
          className="w-full h-full max-h-[460px] opacity-90 transition-all select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Graticule Grid */}
          <g stroke="#1e293b" strokeWidth="0.5" opacity="0.3">
            {[100, 200, 300, 400, 500, 600, 700].map(x => <line key={x} x1={x} y1={0} x2={x} y2={500} strokeDasharray="3 3" />)}
            {[100, 200, 300, 400].map(y => <line key={y} x1={0} y1={y} x2={800} y2={y} strokeDasharray="3 3" />)}
          </g>

          {/* BACKGROUND DISTRICT BOUNDARIES (Representing Palembang regions) */}
          {/* Kecamatan Sukarami Area */}
          <path d="M 50,50 L 250,50 L 300,200 L 150,220 Z" fill="#1e293b" opacity="0.1" stroke="#334155" strokeWidth="1" />
          <text x="120" y="80" fill="#475569" className="font-mono text-[9px] font-bold">Kec. Sukarami</text>

          {/* Kecamatan Kemuning & IT I Area */}
          <path d="M 250,50 L 450,50 L 500,230 L 300,200 Z" fill="#1e293b" opacity="0.15" stroke="#334155" strokeWidth="1" />
          <text x="350" y="100" fill="#475569" className="font-mono text-[9px] font-bold">Kec. Kemuning</text>

          {/* Kecamatan Ilir Barat I Area */}
          <path d="M 50,250 L 300,250 L 300,450 L 50,450 Z" fill="#1e293b" opacity="0.1" stroke="#334155" strokeWidth="1" />
          <text x="120" y="380" fill="#475569" className="font-mono text-[9px] font-bold">Kec. Ilir Barat I</text>

          {/* Kecamatan Seberang Ulu & Jakabaring */}
          <path d="M 300,320 L 750,320 L 750,450 L 300,450 Z" fill="#1e293b" opacity="0.2" stroke="#334155" strokeWidth="1" />
          <text x="500" y="420" fill="#475569" className="font-mono text-[9px] font-bold">Kec. Seberang Ulu & Jakabaring</text>

          {/* SUNGAI MUSI (Stylized flowing river) */}
          <path
            d="M 50,300 C 150,280, 250,420, 450,400 C 650,380, 750,240, 750,240 L 780,240"
            stroke="#1d4ed8"
            strokeWidth="32"
            strokeLinecap="round"
            className="opacity-40"
          />
          <path
            d="M 50,300 C 150,280, 250,420, 450,400 C 650,380, 750,240, 750,240"
            stroke="#3b82f6"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="12 8"
            className="animate-wave opacity-80"
          />
          <text x="260" y="340" fill="#3b82f6" className="font-mono text-[9px] font-bold opacity-60">Aliran Sungai Musi</text>

          {/* JEMBATAN AMPERA */}
          <line x1="500" y1="280" x2="520" y2="440" stroke="#ef4444" strokeWidth="6" className="opacity-80" />
          <text x="525" y="360" fill="#ef4444" className="font-mono text-[8px] font-bold rotate-90 origin-left opacity-70">Jembatan Ampera</text>

          {/* INTERACTIVE MARKERS (11 PIN LOCATIONS) */}
          {filteredSensors.map((sensor) => {
            const { x, y } = project(sensor.lat, sensor.lng);
            const status = getSensorStatus(sensor);
            
            // Map colors based on status
            const colorClass =
              status === "DARURAT"
                ? "#ef4444"
                : status === "SIAGA"
                ? "#f59e0b"
                : "#10b981";

            const isSelected = selectedSensor?.id === sensor.id;

            return (
              <g
                key={sensor.id}
                className="cursor-pointer group"
                onClick={() => handleMarkerClick(sensor)}
              >
                {/* Ring glow for Siaga/Darurat */}
                {(status === "SIAGA" || status === "DARURAT") && (
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 16 : 10}
                    fill={colorClass}
                    opacity="0.3"
                    className={status === "DARURAT" ? "animate-pulse-danger" : "animate-pulse-warning"}
                  />
                )}

                {/* Pin outer border */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 8 : 6}
                  fill={isSelected ? "#ffffff" : colorClass}
                  stroke={isSelected ? colorClass : "#ffffff"}
                  strokeWidth="2"
                  className="transition-all duration-300 group-hover:scale-125"
                />

                {/* Inner center dot */}
                <circle
                  cx={x}
                  cy={y}
                  r="2"
                  fill={isSelected ? colorClass : "#ffffff"}
                />

                {/* Text Node ID Label on hover */}
                <text
                  x={x}
                  y={y - 12}
                  textAnchor="middle"
                  fill="#ffffff"
                  className="font-mono text-[8px] font-bold bg-slate-900 px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                >
                  {sensor.nodeId}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Informative notification if search returns empty */}
        {filteredSensors.length === 0 && (
          <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center p-6 text-center z-10">
            <div>
              <p className="text-slate-400 font-bold text-sm">Tidak Ada Lokasi Ditemukan</p>
              <p className="text-xs text-slate-500 mt-1">Coba ketik kata kunci jalan lain (contoh: Polda, Basuki, Burlian)</p>
            </div>
          </div>
        )}
      </div>

      {/* 4. DETAILS VIEW: ADAPTIVE DESKTOP VS MOBILE */}
      {/* CASE A: DESKTOP LEFT SIDE PANEL */}
      {selectedSensor && (
        <div className="hidden lg:block absolute left-4 bottom-4 top-16 w-80 bg-slate-900/95 border border-slate-800 text-white rounded-2xl shadow-2xl p-5 backdrop-blur-md overflow-y-auto space-y-4">
          <div className="flex justify-between items-start border-b border-slate-800 pb-3">
            <div>
              <span className="font-mono text-[10px] font-bold text-blue-400 tracking-wider">
                {selectedSensor.nodeId}
              </span>
              <h4 className="font-bold text-sm mt-0.5">{selectedSensor.name}</h4>
            </div>
            <button onClick={clearSelection} className="text-slate-400 hover:text-white p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Status Badge */}
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Status Node:</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                getSensorStatus(selectedSensor) === "DARURAT"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : getSensorStatus(selectedSensor) === "SIAGA"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}>
                {getSensorStatus(selectedSensor)}
              </span>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Lokasi Stasiun:</span>
              <p className="font-bold text-slate-200 leading-normal">{selectedSensor.street}</p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase">KECAMATAN {selectedSensor.kecamatan}</p>
            </div>

            {/* Core Issue */}
            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Masalah Utama Drainase:</span>
              <p className="font-bold text-slate-300 leading-normal">{selectedSensor.issue}</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-slate-800">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/60">
                <p className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">Ketinggian Air</p>
                <p className="text-base font-extrabold text-blue-400 mt-1">{selectedSensor.waterLevel} cm</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/60">
                <p className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">Kekeruhan</p>
                <p className="text-base font-extrabold text-teal-400 mt-1">{selectedSensor.turbidity} NTU</p>
              </div>
            </div>

            {/* Additional info */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-800 pt-3">
              <span>Baterai Node: {selectedSensor.battery}%</span>
              <span>Update: {selectedSensor.lastUpdated}</span>
            </div>
          </div>
        </div>
      )}

      {/* CASE B: MOBILE BOTTOM DRAWER SHEET VIEW */}
      {selectedSensor && (
        <div className="lg:hidden fixed bottom-14 inset-x-0 bg-slate-900 border-t border-slate-800 text-white rounded-t-3xl shadow-2xl z-40 p-5 space-y-4 max-h-[300px] overflow-y-auto">
          <div className="flex justify-between items-start border-b border-slate-800 pb-2">
            <div>
              <span className="font-mono text-[9px] font-bold text-blue-400">{selectedSensor.nodeId}</span>
              <h4 className="font-bold text-xs mt-0.5 truncate max-w-[200px]">{selectedSensor.name}</h4>
            </div>
            <button onClick={clearSelection} className="text-slate-400 hover:text-white p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Status */}
            <div>
              <span className="text-slate-400 text-[10px]">Status:</span>
              <p className={`font-bold mt-0.5 ${
                getSensorStatus(selectedSensor) === "DARURAT"
                  ? "text-red-500"
                  : getSensorStatus(selectedSensor) === "SIAGA"
                  ? "text-amber-500"
                  : "text-emerald-500"
              }`}>
                {getSensorStatus(selectedSensor)}
              </p>
            </div>

            {/* Metrics */}
            <div>
              <span className="text-slate-400 text-[10px]">Level / Turbidity:</span>
              <p className="font-bold text-slate-200 mt-0.5">
                {selectedSensor.waterLevel}cm | {selectedSensor.turbidity} NTU
              </p>
            </div>

            {/* Address */}
            <div className="col-span-2">
              <span className="text-slate-400 text-[10px]">Jalan:</span>
              <p className="font-bold text-slate-300 leading-normal truncate">{selectedSensor.street}</p>
            </div>

            {/* Issue */}
            <div className="col-span-2">
              <span className="text-slate-400 text-[10px]">Masalah Utama:</span>
              <p className="font-bold text-slate-300 leading-normal truncate">{selectedSensor.issue}</p>
            </div>
          </div>
          <div className="flex justify-between items-center text-[9px] text-slate-500 border-t border-slate-800 pt-2">
            <span>Baterai IoT: {selectedSensor.battery}%</span>
            <span>Terakhir Dibaca: {selectedSensor.lastUpdated}</span>
          </div>
        </div>
      )}

    </div>
  );
};
