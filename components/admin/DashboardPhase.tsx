import React from 'react';
import { useAdmin } from './AdminContext';
import { useEws } from '../EwsContext';

export const DashboardPhase: React.FC = () => {
  const { healthMetrics, auditLogs } = useAdmin();
  const { sensors, reports } = useEws();

  const solarBatteryAvg = sensors.length > 0 ? sensors.reduce((acc, curr) => acc + curr.battery, 0) / sensors.length : 100;
  const pendingReportsCount = reports.filter(r => r.status === 'Belum Ditangani' || r.status === 'Sedang Dikerjakan').length;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Dashboard Eksekutif</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
          <div className="text-sm text-slate-500 mb-1">Total Titik Observasi</div>
          <div className="text-3xl font-bold text-slate-800">
            {sensors.length}
          </div>
          <div className="text-sm mt-2 text-green-500">
            Status Jaringan Online
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
          <div className="text-sm text-slate-500 mb-1">Antrean Laporan Masuk</div>
          <div className="text-3xl font-bold text-slate-800">
            {pendingReportsCount}
          </div>
          <div className={`text-sm mt-2 ${pendingReportsCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
            Perlu Tindakan
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
          <div className="text-sm text-slate-500 mb-1">Daya Solar Panel (Rata-rata)</div>
          <div className="text-3xl font-bold text-slate-800">
            {solarBatteryAvg.toFixed(1)}%
          </div>
          <div className={`text-sm mt-2 ${solarBatteryAvg < 20 ? 'text-red-500 font-bold' : 'text-green-500'}`}>
            {solarBatteryAvg < 20 ? 'Peringatan: Baterai Rendah' : 'Normal'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
          <div className="text-sm text-slate-500 mb-1">Antrean Notifikasi EWS</div>
          <div className="text-3xl font-bold text-slate-800">
            {healthMetrics.notificationQueue} msg
          </div>
          <div className={`text-sm mt-2 ${healthMetrics.notificationQueue > 10 ? 'text-yellow-500' : 'text-green-500'}`}>
            Latensi {healthMetrics.notificationQueue > 0 ? '> 1s' : '< 1s'}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">System Logs & Audit Trail</h2>
        <div className="bg-slate-900 text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
          {auditLogs.slice(0, 10).map((log, i) => (
            <div key={i}>[{new Date(log.timestamp).toLocaleTimeString()}] [{log.user}] {log.action}</div>
          ))}
          {auditLogs.length === 0 && (
            <div>[INFO] System initialized. Waiting for actions...</div>
          )}
          {solarBatteryAvg < 20 && (
            <div className="text-red-400">[WARN] Low battery detected on some nodes.</div>
          )}
          {pendingReportsCount > 0 && (
            <div className="text-yellow-400">[WARN] Terdapat {pendingReportsCount} laporan yang belum ditangani.</div>
          )}
          <div className="animate-pulse">_</div>
        </div>
      </div>
    </div>
  );
};
