import { AppShell } from "../components/AppShell";
import { EwsProvider } from "../components/EwsContext";
import { Suspense } from "react";

export const unstable_instant = { prefetch: 'static', unstable_disableValidation: true };

export default function Home() {
  return (
    <EwsProvider>
      <Suspense fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-bold tracking-widest uppercase animate-pulse">Memuat EWS Palembang...</p>
          </div>
        </div>
      }>
        <AppShell />
      </Suspense>
    </EwsProvider>
  );
}

