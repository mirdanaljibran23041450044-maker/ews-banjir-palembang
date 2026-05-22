import React from 'react';
import { useAdmin } from './AdminContext';

export const DashboardPhase: React.FC = () => {
  const { healthMetrics } = useAdmin();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Dashboard Eksekutif</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
          <div className="text-sm text-slate-500 mb-1">Uptime Server & MQTT</div>
          <div className="text-3xl font-bold text-slate-800">
            {healthMetrics.uptime.toFixed(2)}%
          </div>
          <div className={`text-sm mt-2 ${healthMetrics.uptime >= 99 ? 'text-green-500' : 'text-red-500'}`}>
            Target &ge; 99%
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
          <div className="text-sm text-slate-500 mb-1">Konektivitas LoRaWAN / 4G</div>
          <div className="text-3xl font-bold text-slate-800">
            {healthMetrics.lorawanConnected ? 'Online' : 'Offline'}
          </div>
          <div className={`text-sm mt-2 ${healthMetrics.lorawanConnected ? 'text-green-500' : 'text-red-500'}`}>
            Status Jaringan
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
          <div className="text-sm text-slate-500 mb-1">Daya Solar Panel (Rata-rata)</div>
          <div className="text-3xl font-bold text-slate-800">
            {healthMetrics.solarBatteryAvg.toFixed(1)}%
          </div>
          <div className={`text-sm mt-2 ${healthMetrics.solarBatteryAvg < 20 ? 'text-red-500 font-bold' : 'text-green-500'}`}>
            {healthMetrics.solarBatteryAvg < 20 ? 'Peringatan: Baterai Rendah' : 'Normal'}
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
        <h2 className="text-lg font-semibold mb-4 text-slate-800">System Logs</h2>
        <div className="bg-slate-900 text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
          <div>[INFO] System initialized. Uptime tracking started.</div>
          <div>[INFO] MQTT Broker listening on port 1883.</div>
          <div>[INFO] Connect to PostGIS database successful.</div>
          {healthMetrics.solarBatteryAvg < 20 && (
            <div className="text-red-400">[WARN] Low battery detected on some nodes.</div>
          )}
          {healthMetrics.notificationQueue > 0 && (
            <div className="text-yellow-400">[WARN] Notification queue has {healthMetrics.notificationQueue} messages.</div>
          )}
          <div className="animate-pulse">_</div>
        </div>
      </div>
    </div>
  );
};
