"use client";

import React, { useState } from "react";
import { useEws } from "./EwsContext";

// Inline icons for simplicity if Lucide isn't installed. Let's provide SVG icons or check if we can install Lucide icons.
// Wait, we can install lucide-react if needed, but we can write simple inline SVGs to guarantee zero dependency issues! Inline SVGs are extremely safe, lightweight and reliable. Let's write them cleanly.

export const LoginPage: React.FC = () => {
  const { login } = useEws();
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent, role: "operator" | "public") => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (role === "operator" && !nip) {
      setError("NIP atau Email Petugas wajib diisi.");
      setLoading(false);
      return;
    }

    try {
      const success = await login(nip, role);
      if (!success) {
        setError("Gagal masuk. Periksa kembali NIP/Email dan Password Anda.");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC]">
      {/* LEFT COLUMN: Topografi Sungai Musi (Desktop Only >= 1024px) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 flex-col justify-between p-12 text-white">
        {/* Animated grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />
        
        {/* Glowing orb */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Brand / Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wider">EWS BANJIR</h1>
            <p className="text-xs text-slate-400 font-semibold">KOTA PALEMBANG</p>
          </div>
        </div>

        {/* Winding River Musi Custom SVG & Contour Waves */}
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <svg className="w-[120%] h-[80%] opacity-25" viewBox="0 0 1000 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Contour Lines */}
            <path d="M 0 100 Q 250 80 500 200 T 1000 150" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5 5" />
            <path d="M 0 160 Q 250 140 500 260 T 1000 210" stroke="#38bdf8" strokeWidth="1" />
            <path d="M 0 220 Q 250 200 500 320 T 1000 270" stroke="#38bdf8" strokeWidth="1" />
            
            {/* Sungai Musi Winding Path */}
            <path 
              d="M -50 300 C 150 280, 250 420, 450 400 C 650 380, 750 240, 1050 250" 
              stroke="#2563EB" 
              strokeWidth="48" 
              strokeLinecap="round"
              className="opacity-70"
            />
            {/* Inner flow line for aesthetics */}
            <path 
              d="M -50 300 C 150 280, 250 420, 450 400 C 650 380, 750 240, 1050 250" 
              stroke="#60a5fa" 
              strokeWidth="4" 
              strokeLinecap="round"
              strokeDasharray="20 15"
              className="animate-wave"
            />
            
            <path d="M 0 400 Q 250 380 500 500 T 1000 450" stroke="#38bdf8" strokeWidth="1" />
            <path d="M 0 460 Q 250 440 500 560 T 1000 510" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="10 5" />

            {/* Simulated coordinates overlay text */}
            <text x="200" y="250" fill="#64748b" className="font-mono text-xs">SEBERANG ILIR</text>
            <text x="650" y="470" fill="#64748b" className="font-mono text-xs">SEBERANG ULU</text>
            
            {/* Ampera Bridge representation */}
            <line x1="500" y1="280" x2="520" y2="440" stroke="#ef4444" strokeWidth="10" />
            <circle cx="505" cy="320" r="4" fill="#ffffff" />
            <circle cx="515" cy="400" r="4" fill="#ffffff" />
          </svg>
        </div>

        {/* Left Side Content Info */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            Sistem Informasi Geografis & IoT Terpadu
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight leading-tight">
              Kajian 11 Titik Kritis <br />
              Banjir Kota Palembang
            </h2>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Early Warning System (EWS) memantau fluktuasi level air & kekeruhan Sungai Musi dan drainase utama kota secara reaktif guna meminimalisir dampak bencana.
            </p>
          </div>
          <div className="border-t border-slate-800 pt-6 flex gap-8">
            <div>
              <p className="text-2xl font-bold text-blue-500">11</p>
              <p className="text-xs text-slate-400">Node Sensor IoT</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-500">Real-time</p>
              <p className="text-xs text-slate-400">Reactive State Engine</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-500">PUPR & BPBD</p>
              <p className="text-xs text-slate-400">Siaran Group WhatsApp</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between">
          <p>© 2026 Pemerintah Kota Palembang</p>
          <p>Kajian Infrastruktur TI PUPR</p>
        </div>
      </div>

      {/* RIGHT COLUMN: Login Form (Mobile and Desktop) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 transition-all duration-300">
          
          {/* Header Mobile Brand */}
          <div className="lg:hidden flex flex-col items-center text-center space-y-2 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">EWS BANJIR PALEMBANG</h2>
              <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Dinas PUPR / BPBD</p>
            </div>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="hidden lg:block text-2xl font-bold text-slate-900 tracking-tight">Selamat Datang Kembali</h2>
            <p className="text-sm text-slate-500">Pilih akses masuk untuk memonitor titik banjir Kota Palembang</p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-700 text-xs">
              <span className="mt-0.5 text-red-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
              <div>
                <p className="font-semibold">Terjadi Kesalahan</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={(e) => handleLogin(e, "operator")}>
            <div className="space-y-1.5">
              <label htmlFor="nip" className="block text-xs font-semibold text-slate-700">
                NIP ATAU EMAIL PETUGAS
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="nip"
                  name="nip"
                  type="text"
                  required
                  placeholder="Contoh: 198804122010121003 atau email@pupr.go.id"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pass" className="block text-xs font-semibold text-slate-700">
                KATA SANDI
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="pass"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                Ingat Saya
              </label>
              <a href="#" className="text-blue-600 hover:underline">Lupa Kata Sandi?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center h-12 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 transition-all cursor-pointer text-sm"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Masuk Ke Sistem (Petugas)"
              )}
            </button>
          </form>

          {/* Separator */}
          <div className="relative my-6 flex items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atau Masuk Sebagai</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Public Access Link */}
          <button
            onClick={(e) => handleLogin(e, "public")}
            className="w-full flex items-center justify-center gap-2.5 h-12 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all cursor-pointer text-sm"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Lihat Sebagai Pengunjung Publik
          </button>

          {/* Disclaimer */}
          <div className="text-center">
            <p className="text-[10px] text-slate-400 leading-normal max-w-xs mx-auto">
              Sistem ini dilindungi hak cipta kedinasan. Penggunaan akses admin di luar wewenang Dinas PUPR Palembang melanggar hukum.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
