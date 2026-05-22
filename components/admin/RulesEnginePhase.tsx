import React, { useState } from 'react';
import { useAdmin } from './AdminContext';

export const RulesEnginePhase: React.FC = () => {
  const { contacts, addContact, toggleContactActive, addAuditLog } = useAdmin();
  
  const [newContact, setNewContact] = useState({ name: '', phone: '', channel: 'WA' as 'WA' | 'SMS' });

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContact.name && newContact.phone) {
      addContact(newContact);
      setNewContact({ name: '', phone: '', channel: 'WA' });
    }
  };

  const stations = [
    { id: '1', name: 'Simpang Polda', defaultSiaga: 100, defaultDarurat: 150 },
    { id: '2', name: 'Kambang Iwak', defaultSiaga: 80, defaultDarurat: 120 },
    { id: '3', name: 'Jl. Mayor Ruslan', defaultSiaga: 90, defaultDarurat: 130 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Pusat Kendali Ambang Batas & Notifikasi</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-800">Threshold Customization (Rules Engine)</h2>
            <p className="text-xs text-slate-500 mt-1">Atur batas cm air untuk status Siaga dan Darurat berbeda per titik</p>
          </div>
          <div className="p-4 space-y-4">
            {stations.map(st => (
              <div key={st.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="font-medium text-slate-800 mb-3">{st.name}</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-amber-600 mb-1">Batas Siaga (cm)</label>
                    <div className="flex">
                      <input type="number" defaultValue={st.defaultSiaga} className="w-full border border-slate-300 rounded-l p-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
                      <span className="bg-slate-100 border border-l-0 border-slate-300 rounded-r px-3 flex items-center text-sm text-slate-500">cm</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-red-600 mb-1">Batas Darurat (cm)</label>
                    <div className="flex">
                      <input type="number" defaultValue={st.defaultDarurat} className="w-full border border-slate-300 rounded-l p-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
                      <span className="bg-slate-100 border border-l-0 border-slate-300 rounded-r px-3 flex items-center text-sm text-slate-500">cm</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => addAuditLog({timestamp: new Date().toISOString(), user: 'admin_ops', action: `Update threshold ${st.name}`})}
                  className="mt-3 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded transition-colors"
                >
                  Simpan Aturan
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-800">Manajemen Kontak Broadcast WhatsApp API</h2>
            <p className="text-xs text-slate-500 mt-1">Penerima peringatan otomatis saat sensor menyentuh ambang kritis</p>
          </div>
          
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <form onSubmit={handleAddContact} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-700 mb-1">Nama/Grup</label>
                <input required type="text" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className="w-full border border-slate-300 rounded p-2 text-sm" placeholder="Grup Dinas PUPR" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-700 mb-1">Nomor WA</label>
                <input required type="text" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} className="w-full border border-slate-300 rounded p-2 text-sm" placeholder="62812..." />
              </div>
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors h-[38px]">
                Tambah
              </button>
            </form>
          </div>

          <div className="p-0">
            {contacts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Belum ada kontak broadcast terdaftar.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-medium">Nama/Grup</th>
                    <th className="p-3 font-medium">Nomor</th>
                    <th className="p-3 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contacts.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-800 font-medium">{c.name}</td>
                      <td className="p-3 text-slate-600 font-mono text-xs">{c.phone}</td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => toggleContactActive(i)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                        >
                          {c.active ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
