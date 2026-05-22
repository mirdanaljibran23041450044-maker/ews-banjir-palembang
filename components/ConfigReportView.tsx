"use client";

import React, { useState, useRef } from "react";
import { useEws, FieldReport } from "./EwsContext";

export const ConfigReportView: React.FC = () => {
  const {
    config,
    updateConfig,
    addReport,
    reports,
    user,
  } = useEws();

  // Threshold States
  const [siagaVal, setSiagaVal] = useState(config.siaga);
  const [daruratVal, setDaruratVal] = useState(config.darurat);

  // Form States
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState<FieldReport["status"]>("Belum Ditangani");
  const [streetName, setStreetName] = useState("");
  const [lat, setLat] = useState<number | "">("");
  const [lng, setLng] = useState<number | "">("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean, type: 'success' | 'error', message: string }>({ show: false, type: 'success', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleThresholdSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      siaga: Number(siagaVal),
      darurat: Number(daruratVal),
    });
  };

  // Mock GPS Capture (centered around Palembang areas)
  const handleGpsCapture = () => {
    setGpsLoading(true);
    setTimeout(() => {
      // Simulate random coordinates around Palembang critical zone
      const mockLat = -2.95 + (Math.random() * 0.06 - 0.03);
      const mockLng = 104.73 + (Math.random() * 0.04 - 0.02);
      
      setLat(Number(mockLat.toFixed(6)));
      setLng(Number(mockLng.toFixed(6)));
      setStreetName("Jl. Demang Lebar Daun (Terdeteksi GPS)");
      setGpsLoading(false);
    }, 800);
  };

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetName || !desc || lat === "" || lng === "") {
      showToast('error', "Harap lengkapi semua kolom formulir (termasuk koordinat GPS).");
      return;
    }

    setIsSubmitting(true);
    const result = await addReport({
      officerName: user?.name || "Petugas Lapangan",
      street: streetName,
      description: desc,
      status,
      lat: Number(lat),
      lng: Number(lng),
      photoUrl: photoPreview,
    });
    setIsSubmitting(false);

    if (result.success) {
      // Reset Form
      setDesc("");
      setStreetName("");
      setLat("");
      setLng("");
      setPhotoPreview(null);
      setStatus("Belum Ditangani");
      showToast('success', "Laporan berhasil disubmit dan ditambahkan ke dashboard!");
    } else {
      showToast('error', `Gagal mengirim laporan: ${result.message}`);
    }
  };

  const handleToggleWa = () => {
    updateConfig({ isWaEnabled: !config.isWaEnabled });
  };

  const handleToggleSms = () => {
    updateConfig({ isSmsEnabled: !config.isSmsEnabled });
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Toast Notification */}
      <div className={`fixed top-4 right-4 z-50 transition-all duration-500 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
        <div className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl max-w-sm border ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          {toast.type === 'success' ? (
            <div className="bg-emerald-100 p-1 rounded-full shrink-0">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="bg-red-100 p-1 rounded-full shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          <div>
            <h4 className="text-sm font-bold">{toast.type === 'success' ? 'Berhasil' : 'Terjadi Kesalahan'}</h4>
            <p className="text-xs font-medium mt-0.5 leading-relaxed">{toast.message}</p>
            {toast.type === 'error' && (
              <p className="text-[10px] text-red-600/70 mt-1">Cek koneksi, kebijakan database RLS (Row Level Security), atau hak akses Supabase.</p>
            )}
          </div>
        </div>
      </div>

      {/* 2-COLUMN GRID Layout (desktop side by side, mobile stacked) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SECTION 1: THRESHOLD CONFIGURATION */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Pengaturan Ambang Batas & Gerbang Notifikasi</h4>
              <p className="text-xs text-slate-400 mt-0.5">Konfigurasi parameter EWS reaktif dan integrasi pihak ketiga</p>
            </div>

            <form onSubmit={handleThresholdSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Ambang Status SIAGA (cm)</label>
                  <input
                    type="number"
                    value={siagaVal}
                    onChange={(e) => setSiagaVal(Number(e.target.value))}
                    className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Ambang Status DARURAT (cm)</label>
                  <input
                    type="number"
                    value={daruratVal}
                    onChange={(e) => setDaruratVal(Number(e.target.value))}
                    className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
              >
                Simpan & Terapkan Threshold
              </button>
            </form>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Aktivasi Integrasi API Gateway</h5>
            
            <div className="space-y-3.5">
              {/* WA Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100/50">
                <div>
                  <h6 className="text-xs font-bold text-slate-800">WhatsApp Business API</h6>
                  <p className="text-[10px] text-slate-400 mt-0.5">Kirim pesan grup koordinasi Dinas PUPR otomatis</p>
                </div>
                {/* Custom Toggle Switch */}
                <button
                  onClick={handleToggleWa}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none ${
                    config.isWaEnabled ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-200 ${
                    config.isWaEnabled ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* SMS Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100/50">
                <div>
                  <h6 className="text-xs font-bold text-slate-800">SMS Gateway Alert</h6>
                  <p className="text-[10px] text-slate-400 mt-0.5">Kirim pesan darurat SMS ke nomor warga bantaran sungai</p>
                </div>
                {/* Custom Toggle Switch */}
                <button
                  onClick={handleToggleSms}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none ${
                    config.isSmsEnabled ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-200 ${
                    config.isSmsEnabled ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: FIELD REPORT FORM */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Formulir Laporan Petugas Lapangan</h4>
            <p className="text-xs text-slate-400 mt-0.5">Kirim laporan kendala drainase, sedimentasi, atau sumbatan banjir</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* GPS Detect & Location name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase">Deteksi Lokasi (GPS)</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleGpsCapture}
                    disabled={gpsLoading}
                    className="flex-shrink-0 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <svg className={`w-3.5 h-3.5 ${gpsLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {gpsLoading ? "Mendeteksi..." : "GPS"}
                  </button>
                  <input
                    type="text"
                    placeholder="Nama Jalan Lokasi Laporan..."
                    value={streetName}
                    onChange={(e) => setStreetName(e.target.value)}
                    required
                    className="block w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase">Koordinat Spasial (Lat, Lng)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Latitude"
                    value={lat}
                    onChange={(e) => setLat(e.target.value === "" ? "" : Number(e.target.value))}
                    required
                    className="block w-full px-2.5 py-2 border border-slate-200 rounded-xl text-slate-850 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono font-semibold"
                  />
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Longitude"
                    value={lng}
                    onChange={(e) => setLng(e.target.value === "" ? "" : Number(e.target.value))}
                    required
                    className="block w-full px-2.5 py-2 border border-slate-200 rounded-xl text-slate-850 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Description & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase">Deskripsi Kendala Drainase</label>
                <textarea
                  placeholder="Deskripsikan penyumbatan saluran atau genangan air..."
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                  className="block w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase">Status Awal</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="block w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold cursor-pointer h-[50px] sm:h-[45px]"
                >
                  <option value="Belum Ditangani">Belum Ditangani</option>
                  <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
            </div>

            {/* Drag & Drop Photo Upload Area */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-600 uppercase">Dokumentasi Foto Banjir</label>
              
              <div
                onClick={triggerFileInput}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center justify-center min-h-[90px] relative overflow-hidden"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {photoPreview ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={photoPreview}
                      alt="Preview Laporan"
                      className="h-14 w-14 rounded-xl object-cover border border-slate-200"
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-700">Foto Siap Diupload</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Klik area ini untuk mengganti gambar</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <svg className="w-6 h-6 text-slate-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[10px] font-bold text-slate-600">Seret foto kesini, atau klik untuk memilih file</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Format JPG, PNG (Maks 5MB)</p>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full h-11 text-white font-bold rounded-xl shadow-md shadow-slate-900/10 focus:outline-none transition-all flex items-center justify-center gap-2 text-xs ${
                isSubmitting ? 'bg-slate-700 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Mengirim...
                </>
              ) : (
                'Kirim Laporan Lapangan Petugas'
              )}
            </button>
          </form>
        </div>

      </div>

      {/* 3. LIST OF SUBMITTED REPORTS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h4 className="font-bold text-slate-800 text-sm">Daftar Pengaduan Lapangan Terkini</h4>
        
        <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
          {reports.map((rep) => (
            <div key={rep.id} className="p-4 rounded-xl border border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                {rep.photoUrl ? (
                  <img
                    src={rep.photoUrl}
                    alt={rep.street}
                    className="h-12 w-12 rounded-xl object-cover border border-slate-100 shrink-0 mt-0.5"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-bold text-slate-400">{rep.id}</span>
                    <h5 className="font-bold text-xs text-slate-800">{rep.street}</h5>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">Petugas: {rep.officerName} | {rep.timestamp}</p>
                  <p className="text-xs text-slate-650 leading-relaxed mt-1.5">{rep.description}</p>
                  <p className="text-[9px] font-mono font-bold text-slate-400 mt-1">Koordinat: {rep.lat}, {rep.lng}</p>
                </div>
              </div>

              <span className={`inline-flex shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-extrabold ${
                rep.status === "Selesai"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : rep.status === "Sedang Dikerjakan"
                  ? "bg-blue-50 text-blue-700 border border-blue-100"
                  : "bg-red-50 text-red-700 border border-red-100"
              }`}>
                {rep.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
