import React, { useState } from 'react';
import { useEws } from '../EwsContext';
import { useAdmin } from './AdminContext';

export const NodeManagementPhase: React.FC = () => {
  const { sensors, addSensor } = useEws();
  const { addAuditLog } = useAdmin();

  const [formData, setFormData] = useState({
    name: '',
    problemType: 'Bottleneck',
    lat: '',
    lng: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.lat || !formData.lng) return;
    
    await addSensor(formData.name, parseFloat(formData.lat), parseFloat(formData.lng), formData.problemType);
    addAuditLog({ timestamp: new Date().toISOString(), user: 'admin_ops', action: `Register new sensor node: ${formData.name}` });
    setFormData({ name: '', problemType: 'Bottleneck', lat: '', lng: '' });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Manajemen Node & Hardware</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors text-sm font-medium">
          + Registrasi Node Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">Registrasi Sensor</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Stasiun</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nama Jalan / Lokasi" className="w-full border border-slate-300 rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Masalah Utama Titik</label>
                <select value={formData.problemType} onChange={e => setFormData({...formData, problemType: e.target.value})} className="w-full border border-slate-300 rounded p-2 text-sm">
                  <option>Bottleneck</option>
                  <option>Sedimentasi</option>
                  <option>Pasang Surut</option>
                  <option>Limpasan</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                  <input required type="text" value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} placeholder="-2.976" className="w-full border border-slate-300 rounded p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                  <input required type="text" value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} placeholder="104.775" className="w-full border border-slate-300 rounded p-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kalibrasi Nilai (cm)</label>
                <input type="number" defaultValue="0" className="w-full border border-slate-300 rounded p-2 text-sm" />
                <p className="text-xs text-slate-500 mt-1">Toleransi akurasi pembacaan &plusmn;2 cm</p>
              </div>
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-md shadow-sm transition-colors text-sm font-medium mt-2">
                Simpan & Sinkronisasi PostGIS
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">Daftar Modul Aktif</h2>
              <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">{sensors.length}/{sensors.length} Online</span>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-medium">Stasiun</th>
                    <th className="p-3 font-medium">IP / MAC</th>
                    <th className="p-3 font-medium">Baterai</th>
                    <th className="p-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sensors.map((s, i) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-800">{s.name}</td>
                      <td className="p-3 font-mono text-xs">192.168.1.{10+(i%50)}</td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <div className="w-16 h-2 bg-slate-200 rounded mr-2 overflow-hidden">
                            <div className="h-full bg-green-500 rounded" style={{width: `${s.battery}%`}}></div>
                          </div>
                          <span className="text-xs">{s.battery}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button className="text-blue-600 hover:underline text-xs">Ping</button>
                        <button className="text-amber-600 hover:underline text-xs">Restart</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {sensors.map((s, i) => (
                <div key={s.id} className="p-4">
                  <div className="font-medium text-slate-800 mb-1">{s.name}</div>
                  <div className="text-xs font-mono text-slate-500 mb-2">IP: 192.168.1.{10+(i%50)}</div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs">Baterai: {s.battery}%</div>
                    <div className="space-x-2">
                      <button className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">Ping</button>
                      <button className="px-2 py-1 bg-amber-50 text-amber-600 rounded text-xs">Restart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};
