import React from 'react';
import { useAdmin } from './AdminContext';

export const UserManagementPhase: React.FC = () => {
  const { auditLogs } = useAdmin();

  const roles = [
    { name: 'Super Admin (Tim TI)', access: 'Akses penuh konfigurasi server & AI' },
    { name: 'Admin Ops (PUPR/BPBD)', access: 'Ubah ambang EWS, validasi laporan, WA Broadcast' },
    { name: 'Petugas Lapangan', access: 'Kirim laporan dokumentasi, GPS tagging' }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Manajemen Pengguna & Hak Akses</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">Tingkat Peran (Role Tiering)</h2>
              <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
                + Tambah Role
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {roles.map((r, i) => (
                <div key={i} className="p-4 flex items-start justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-medium text-slate-800">{r.name}</div>
                    <div className="text-sm text-slate-500 mt-1">{r.access}</div>
                  </div>
                  <button className="text-slate-400 hover:text-blue-600 transition-colors text-sm">Edit</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Pengguna Aktif</h2>
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs">TI</div>
                <div>
                  <div className="text-sm font-medium text-slate-800">Admin TI Pusat</div>
                  <div className="text-xs text-slate-500">super_admin</div>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            </div>
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-xs">BP</div>
                <div>
                  <div className="text-sm font-medium text-slate-800">Operator BPBD</div>
                  <div className="text-xs text-slate-500">admin_ops</div>
                </div>
              </div>
              <span className="text-xs text-slate-400">Offline</span>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800">Security Control Panel (Audit Trail)</h2>
              <p className="text-xs text-slate-500 mt-1">Riwayat log aktivitas admin</p>
            </div>
            <div className="p-4 flex-1 overflow-y-auto bg-slate-900 text-slate-300 font-mono text-xs space-y-2 h-96">
              {auditLogs.length === 0 ? (
                <div className="text-slate-500 italic">Belum ada riwayat aktivitas.</div>
              ) : (
                auditLogs.map((log, idx) => (
                  <div key={idx} className="border-b border-slate-800 pb-2">
                    <span className="text-blue-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                    <span className="text-green-400">{log.user}</span>:{' '}
                    <span className="text-slate-100">{log.action}</span>
                    {log.details && <div className="text-slate-500 ml-4 mt-1">↳ {log.details}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
