import React from 'react';

export const AnalyticsPhase: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Analitik Data & Ekspor Evaluasi</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Data Exporter Engine</h2>
          <p className="text-sm text-slate-500 mb-6">Unduh laporan historis ketinggian air, debit drainase, dan catatan log bencana untuk keperluan rapat evaluasi dinas.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rentang Waktu</label>
              <select className="w-full border border-slate-300 rounded p-2 text-sm bg-slate-50">
                <option>Bulan Ini (Mei 2026)</option>
                <option>Bulan Lalu (April 2026)</option>
                <option>Kuartal 1 (Jan-Mar 2026)</option>
                <option>Kustom...</option>
              </select>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 py-2 px-4 rounded font-medium transition-colors">
                <span className="font-bold">PDF</span> Resmi Pemerintahan
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 py-2 px-4 rounded font-medium transition-colors">
                <span className="font-bold">Excel</span> (.xlsx)
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg shadow-sm border border-slate-700 p-6 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
          
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <span className="text-blue-400">⚡</span> AI Training Trigger Preparation
          </h2>
          <p className="text-sm text-slate-300 mb-6">Konsolidasi dan sanitasi data time-series (ketinggian, kekeruhan, cuaca) 6 bulan terakhir untuk di-ingest ke modul Machine Learning (LSTM) Fase II.</p>
          
          <div className="bg-slate-800/50 rounded border border-slate-600 p-4 mb-4 font-mono text-xs text-slate-300">
            <div>Dataset terdeteksi: 1,245,000 baris (11 stasiun)</div>
            <div>Missing values: ~0.4% (akan di-impute)</div>
            <div>Format target: Tensor/Parquet</div>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded font-bold shadow-lg shadow-blue-900/50 transition-all flex justify-center items-center gap-2">
            🚀 Generate Training Dataset
          </button>
        </div>
      </div>

      {/* Mock Chart Area */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Tren Ketinggian Air Rata-rata (Minggu Ini)</h2>
        <div className="h-64 flex items-end justify-between gap-2 border-b border-l border-slate-300 p-4 pt-10 relative">
          {/* Y Axis Labels */}
          <div className="absolute left-[-20px] bottom-4 text-xs text-slate-400">0</div>
          <div className="absolute left-[-30px] bottom-[50%] text-xs text-slate-400">50cm</div>
          <div className="absolute left-[-35px] top-0 text-xs text-slate-400">100cm</div>
          
          {/* Bars */}
          {[20, 35, 80, 45, 30, 25, 60].map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
              <div 
                className={`w-full max-w-[40px] rounded-t-sm transition-all duration-500 ${
                  val >= 80 ? 'bg-red-500' : val >= 50 ? 'bg-yellow-400' : 'bg-blue-400'
                }`}
                style={{ height: `${val}%` }}
              ></div>
              <div className="text-xs font-medium text-slate-500">
                {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][idx]}
              </div>
              
              {/* Tooltip */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-xs py-1 px-2 rounded transition-opacity pointer-events-none">
                {val}cm
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
