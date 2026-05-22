import React, { useState } from 'react';
import Link from 'next/link';
import { useEws } from '../EwsContext';
import { DashboardPhase } from './DashboardPhase';
import { NodeManagementPhase } from './NodeManagementPhase';
import { UserManagementPhase } from './UserManagementPhase';
import { RulesEnginePhase } from './RulesEnginePhase';
import { ReportDispatchPhase } from './ReportDispatchPhase';
import { AnalyticsPhase } from './AnalyticsPhase';
// Icon placeholders – replace with lucide/react or heroicons later
const Icon = ({ name }: { name: string }) => (
  <span className={`inline-block w-5 h-5 mr-2`}>{name}</span>
);

const adminMenu = [
  { label: 'Dashboard', icon: '📊', key: 'dashboard' },
  { label: 'Manajemen Node', icon: '🔧', key: 'nodes' },
  { label: 'Manajemen Pengguna', icon: '👥', key: 'users' },
  { label: 'Rules Engine', icon: '⚡', key: 'rules' },
  { label: 'Dispatch Laporan', icon: '📋', key: 'dispatch' },
  { label: 'Analitik & Ekspor', icon: '📈', key: 'analytics' },
];

export const AdminShell: React.FC = () => {
  const { user, logout } = useEws();
  const [active, setActive] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const renderContent = () => {
    switch (active) {
      case 'dashboard':
        return <DashboardPhase />;
      case 'nodes':
        return <NodeManagementPhase />;
      case 'users':
        return <UserManagementPhase />;
      case 'rules':
        return <RulesEnginePhase />;
      case 'dispatch':
        return <ReportDispatchPhase />;
      case 'analytics':
        return <AnalyticsPhase />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 bg-slate-900 text-white p-4">
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-semibold">EWS Admin</h2>
        </div>
        <nav className="space-y-2">
          {adminMenu.map((item) => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={`w-full text-left flex items-center py-2 px-3 rounded hover:bg-slate-800 transition-colors ${active === item.key ? 'bg-slate-800' : ''}`}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-sm">{user?.name}</span>
            <button onClick={logout} className="text-xs underline">Logout</button>
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div className="md:hidden absolute top-0 left-0 z-20">
        <button
          className="p-2 m-2 text-gray-800 bg-white rounded"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setSidebarOpen(false)}>
            <aside className="w-64 h-full bg-slate-900 text-white p-4 drawer-overlay animate-slide-in-left">
              <nav className="space-y-2">
                {adminMenu.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => { setActive(item.key); setSidebarOpen(false); }}
                    className={`w-full text-left flex items-center py-2 px-3 rounded hover:bg-slate-800 transition-colors ${active === item.key ? 'bg-slate-800' : ''}`}
                  >
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </aside>
          </div>
        )}
      </div>

      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminShell;
