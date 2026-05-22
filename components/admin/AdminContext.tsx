import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Sensor, FieldReport, NotificationLog, ThresholdConfig, User } from '../EwsContext';

export interface AdminUser extends User {
  role: 'super_admin' | 'admin_ops' | 'field_officer';
}

interface AdminContextProps {
  // State slices
  healthMetrics: {
    uptime: number; // percent
    mqttConnected: boolean;
    lorawanConnected: boolean;
    solarBatteryAvg: number; // percent
    notificationQueue: number;
  };
  thresholds: ThresholdConfig[]; // per node
  contacts: { name: string; phone: string; channel: 'WA' | 'SMS'; active: boolean }[];
  auditLogs: { timestamp: string; user: string; action: string; details?: string }[];
  // Actions
  updateThreshold: (nodeId: string, newConfig: Partial<ThresholdConfig>) => void;
  addContact: (contact: { name: string; phone: string; channel: 'WA' | 'SMS' }) => void;
  toggleContactActive: (index: number) => void;
  addAuditLog: (log: { timestamp: string; user: string; action: string; details?: string }) => void;
}

const AdminContext = createContext<AdminContextProps | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [healthMetrics, setHealthMetrics] = useState({
    uptime: 99,
    mqttConnected: true,
    lorawanConnected: true,
    solarBatteryAvg: 85,
    notificationQueue: 0,
  });

  const [thresholds, setThresholds] = useState<ThresholdConfig[]>([]);
  const [contacts, setContacts] = useState([] as any[]);
  const [auditLogs, setAuditLogs] = useState([] as any[]);

  useEffect(() => {
    const fetchAdminData = async () => {
      const { data: dbContacts } = await supabase.from('contacts').select('*');
      if (dbContacts) setContacts(dbContacts);

      const { data: dbLogs } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200);
      if (dbLogs) {
        setAuditLogs(dbLogs.map(l => ({
          timestamp: l.created_at,
          user: l.user_name,
          action: l.action,
          details: l.details
        })));
      }
    };
    fetchAdminData();
  }, []);

  // Simulate reactive health updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHealthMetrics((prev) => ({
        ...prev,
        uptime: Math.min(100, prev.uptime + (Math.random() - 0.5) * 0.2),
        solarBatteryAvg: Math.max(0, Math.min(100, prev.solarBatteryAvg + (Math.random() - 0.5) * 1)),
        notificationQueue: Math.max(0, prev.notificationQueue + Math.round(Math.random() * 2 - 1)),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateThreshold = async (nodeId: string, newConfig: Partial<ThresholdConfig>) => {
    setThresholds((prev) =>
      prev.map((t) => (t.nodeId === nodeId ? { ...t, ...newConfig } : t))
    );
    addAuditLog({
      timestamp: new Date().toISOString(),
      user: 'system',
      action: `Update threshold for ${nodeId}`,
    });
  };

  const addContact = async (contact: { name: string; phone: string; channel: 'WA' | 'SMS' }) => {
    const { data } = await supabase.from('contacts').insert([{
      name: contact.name,
      phone: contact.phone,
      channel: contact.channel,
      is_active: true
    }]).select();

    if (data && data[0]) {
      setContacts((prev) => [...prev, data[0]]);
    }
    
    addAuditLog({
      timestamp: new Date().toISOString(),
      user: 'system',
      action: `Add contact ${contact.name}`,
    });
  };

  const toggleContactActive = async (index: number) => {
    const contact = contacts[index];
    if (!contact) return;
    
    const newActive = !contact.is_active;
    if (contact.id) {
      await supabase.from('contacts').update({ is_active: newActive }).eq('id', contact.id);
    }

    setContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, is_active: newActive, active: newActive } : c))
    );
  };

  const addAuditLog = async (log: { timestamp: string; user: string; action: string; details?: string }) => {
    await supabase.from('audit_logs').insert([{
      user_name: log.user,
      action: log.action,
      details: log.details || null
    }]);
    
    setAuditLogs((prev) => [log, ...prev].slice(0, 200)); // keep recent 200
  };

  return (
    <AdminContext.Provider
      value={{
        healthMetrics,
        thresholds,
        contacts,
        auditLogs,
        updateThreshold,
        addContact,
        toggleContactActive,
        addAuditLog,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
};
