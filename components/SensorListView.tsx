"use client";

import React, { useState } from "react";
import { useEws, Sensor } from "./EwsContext";

export const SensorListView: React.FC = () => {
  const { sensors, config } = useEws();
  const [filterQuery, setFilterQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "NORMAL" | "SIAGA" | "DARURAT">("ALL");

  // Helper to determine status
  const getStatus = (level: number) => {
    if (level >= config.darurat) return "DARURAT";
    if (level >= config.siaga) return "SIAGA";
    return "NORMAL";
  };

  // Filtered list
  const filteredList = sensors.filter((sensor) => {
    const status = getStatus(sensor.waterLevel);
    const matchesSearch =
      sensor.street.toLowerCase().includes(filterQuery.toLowerCase()) ||
      sensor.kecamatan.toLowerCase().includes(filterQuery.toLowerCase()) ||
      sensor.nodeId.toLowerCase().includes(filterQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">

      {/* 1. FILTER & SEARCH AREA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-800 text-sm">Pemantauan Metrik Sensor IoT</h4>
          <p className="text-xs text-slate-400 mt-0.5">Daftar stasiun telemetri JSN-SR04T & Turbidity Kota Palembang</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari jalan / node..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="block w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="NORMAL">Normal</option>
            <option value="SIAGA">Siaga</option>
            <option value="DARURAT">Darurat</option>
          </select>
        </div>
      </div>

      {/* 2. RESPONSIVE CONTAINER */}
      {/* A. DESKTOP VIEW: FULL COMPREHENSIVE DATA TABLE (Hidden on screen < 1024px) */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-slate-100">
        <table className="min-w-full divide-y divide-slate-100 text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">ID Node</th>
              <th className="px-5 py-3.5">Nama Stasiun</th>
              <th className="px-5 py-3.5">Masalah Utama</th>
              <th className="px-5 py-3.5 text-center">Ketinggian Air (cm)</th>
              <th className="px-5 py-3.5 text-center">Kekeruhan (NTU)</th>
              <th className="px-5 py-3.5 text-center">Daya Baterai</th>
              <th className="px-5 py-3.5 text-center">Status</th>
              <th className="px-5 py-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white font-medium">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                  Tidak ada data sensor yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              filteredList.map((sensor) => {
                const status = getStatus(sensor.waterLevel);
                return (
                  <tr key={sensor.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-400">{sensor.nodeId}</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-800">{sensor.street}</div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">{sensor.kecamatan}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{sensor.issue}</td>
                    <td className="px-5 py-4 text-center font-bold text-blue-600">
                      {sensor.waterLevel} cm
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-teal-600">
                      {sensor.turbidity} NTU
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`h-1.5 w-3 rounded-sm ${sensor.battery > 30 ? "bg-emerald-500" : "bg-red-500"}`} />
                        <span className="font-bold text-slate-600">{sensor.battery}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold ${status === "DARURAT"
                        ? "bg-red-100 text-red-700 animate-pulse"
                        : status === "SIAGA"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                        }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button className="px-2.5 py-1 border border-slate-200 text-[10px] font-bold rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm cursor-pointer transition-all">
                        Riwayat
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* B. MOBILE VIEW: VERTICAL STACK OF LIST CARDS (Hidden on screen >= 1024px) */}
      <div className="lg:hidden space-y-3">
        {filteredList.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-semibold bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Tidak ada data sensor yang cocok dengan filter.
          </div>
        ) : (
          filteredList.map((sensor) => {
            const status = getStatus(sensor.waterLevel);
            return (
              <div
                key={sensor.id}
                className="p-4 rounded-xl border border-slate-100 shadow-sm bg-white flex items-center justify-between gap-3 hover:shadow transition-shadow"
              >
                {/* Left Area: Name & Metrics */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] font-bold text-slate-400 shrink-0">{sensor.nodeId}</span>
                    <h5 className="font-bold text-xs text-slate-800 truncate">{sensor.street}</h5>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">{sensor.kecamatan}</p>
                  <p className="text-[11px] font-bold text-slate-700 mt-1">
                    Air: <span className="text-blue-600">{sensor.waterLevel}cm</span> | Keruh: <span className="text-teal-600">{sensor.turbidity} NTU</span>
                  </p>
                </div>

                {/* Right Area: Status Badge & Chevron */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${status === "DARURAT"
                    ? "bg-red-100 text-red-700"
                    : status === "SIAGA"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                    }`}>
                    {status}
                  </span>

                  {/* Chevron Right Icon */}
                  <button className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
