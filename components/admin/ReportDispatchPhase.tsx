import React, { useState } from 'react';
import { useEws } from '../EwsContext';
import { useAdmin } from './AdminContext';

export const ReportDispatchPhase: React.FC = () => {
  const { reports, updateReportStatus } = useEws();
  const { addAuditLog } = useAdmin();
  const [activeReportId, setActiveReportId] = useState<string | number | null>(null);

  const pendingReports = reports.filter(r => r.status === 'Belum Ditangani' || r.status === 'Sedang Dikerjakan');

  const handleAction = async (status: 'resolved' | 'dispatched' | 'rejected') => {
    if (!activeReportId) return;
    await updateReportStatus(activeReportId, status);
    addAuditLog({ timestamp: new Date().toISOString(), user: 'admin_ops', action: `Update report status to ${status}` });
    setActiveReportId(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Validasi & Distribusi Laporan (Dispatch Center)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
        
        {/* Left Column - Report List */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">Antrean Laporan Masuk</h2>
            <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold">{pendingReports.length} Baru</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {pendingReports.map((rep) => (
              <div 
                key={rep.id} 
                onClick={() => setActiveReportId(rep.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  activeReportId === rep.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-slate-800">{rep.street}</div>
                  <div className="text-xs text-slate-500">{rep.timestamp.split(' ')[1] || rep.timestamp}</div>
                </div>
                <div className="text-xs text-slate-600 line-clamp-2 mb-2">{rep.description}</div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-slate-400">Dari: {rep.officerName}</div>
                  {rep.status === 'Belum Ditangani' 
                    ? <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)] animate-pulse"></span>
                    : <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center/Right Column - Map & Actions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Map Mockup */}
          <div className="bg-slate-200 rounded-lg shadow-sm border border-slate-300 flex-1 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-40 bg-[url('https://maps.wikimedia.org/osm-intl/13/6513/4198.png')] bg-cover bg-center mix-blend-multiply"></div>
            
            {/* Map Pins */}
            <div className="absolute top-[40%] left-[50%] flex flex-col items-center group cursor-pointer">
              <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg animate-bounce flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="mt-1 bg-white px-2 py-1 rounded shadow text-xs font-bold text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                Simpang Polda
              </div>
            </div>

            <div className="absolute top-[60%] left-[30%] flex flex-col items-center group cursor-pointer">
              <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow flex items-center justify-center"></div>
            </div>

            <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded shadow backdrop-blur-sm border border-slate-200 text-xs">
              <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 bg-red-500 rounded-full"></span> Laporan Baru</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Telah Ditangani</div>
            </div>
          </div>

          {/* Action Panel for Active Report */}
          {activeReportId && (() => {
            const activeReport = pendingReports.find(r => r.id === activeReportId);
            if (!activeReport) return null;
            return (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{activeReport.street}</h3>
                  <p className="text-sm text-slate-500">Dilaporkan pada {activeReport.timestamp} oleh {activeReport.officerName}</p>
                </div>
                {activeReport.status === 'Belum Ditangani' && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-medium border border-yellow-200">
                    Menunggu Validasi
                  </span>
                )}
              </div>
              
              <div className="bg-slate-50 p-4 rounded border border-slate-100 mb-6">
                <p className="text-slate-700">"{activeReport.description}"</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => handleAction('resolved')} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded shadow-sm font-medium transition-colors">
                  ✓ Terima & Sebarkan ke Peta Publik
                </button>
                <button onClick={() => handleAction('dispatched')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow-sm font-medium transition-colors">
                  🛠 Kirim Disposisi Regu Teknis
                </button>
                <button onClick={() => handleAction('rejected')} className="bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 px-4 rounded border border-slate-200 font-medium transition-colors">
                  Tolak (Spam)
                </button>
              </div>
            </div>
          )})()}
        </div>
        
      </div>
    </div>
  );
};
