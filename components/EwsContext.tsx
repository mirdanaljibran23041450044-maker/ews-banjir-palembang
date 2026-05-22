"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from '../lib/supabaseClient';

export interface Sensor {
  id: number | string;
  nodeId: string;
  name: string;
  street: string;
  kecamatan: string;
  issue: string;
  waterLevel: number;
  turbidity: number;
  battery: number;
  lat: number;
  lng: number;
  lastUpdated: string;
  siagaThreshold?: number;
  daruratThreshold?: number;
}

export interface FieldReport {
  id: string;
  officerName: string;
  street: string;
  description: string;
  status: "Belum Ditangani" | "Sedang Dikerjakan" | "Selesai";
  lat: number;
  lng: number;
  photoUrl: string | null;
  timestamp: string;
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  type: "INFO" | "SIAGA" | "DARURAT";
  message: string;
  channel: string; // "WhatsApp" | "SMS" | "System"
}

export interface ThresholdConfig {
  nodeId?: string;
  siaga: number; // cm
  darurat: number; // cm
  isWaEnabled: boolean;
  isSmsEnabled: boolean;
}

export interface User {
  nip: string;
  name: string;
  role: "operator" | "public" | "super_admin" | "admin_ops" | "field_officer";
  avatar: string;
}

interface EwsContextProps {
  sensors: Sensor[];
  reports: FieldReport[];
  notifications: NotificationLog[];
  config: ThresholdConfig;
  user: User | null;
  activeTab: "dashboard" | "map" | "sensors" | "config";
  selectedSensor: Sensor | null;
  isLoggedIn: boolean;
  login: (nipOrEmail: string, role: "operator" | "public" | "super_admin") => Promise<boolean>;
  logout: () => void;
  updateConfig: (newConfig: Partial<ThresholdConfig>) => void;
  addReport: (report: Omit<FieldReport, "id" | "timestamp">) => void;
  setSelectedSensor: (sensor: Sensor | null) => void;
  setActiveTab: (tab: "dashboard" | "map" | "sensors" | "config") => void;
  triggerMockUpdate: () => void;
  addSensor: (name: string, lat: number, lng: number, problemType: string) => Promise<void>;
  updateReportStatus: (reportId: string | number, newStatus: 'pending' | 'dispatched' | 'resolved' | 'rejected') => Promise<void>;
  updateSensorThresholds: (sensorId: string | number, siaga: number, darurat: number) => Promise<void>;
}

const EwsContext = createContext<EwsContextProps | undefined>(undefined);

// Initial 11 Critical points in Palembang
const initialSensors: Sensor[] = [
  {
    id: 1,
    nodeId: "NODE-01",
    name: "Stasiun 01 - Simpang Polda",
    street: "Jl. Demang Lebar Daun (Simpang Polda)",
    kecamatan: "Kemuning",
    issue: "Penyempitan Saluran & Air Pasang",
    waterLevel: 85,
    turbidity: 120,
    battery: 92,
    lat: -2.9625,
    lng: 104.7390,
    lastUpdated: "",
  },
  {
    id: 2,
    nodeId: "NODE-02",
    name: "Stasiun 02 - Bank Sinarmas",
    street: "Jl. Basuki Rahmat (Depan Bank Sinarmas)",
    kecamatan: "Kemuning",
    issue: "Sedimentasi & Sumbatan Sampah",
    waterLevel: 115,
    turbidity: 245,
    battery: 89,
    lat: -2.9555,
    lng: 104.7432,
    lastUpdated: "",
  },
  {
    id: 3,
    nodeId: "NODE-03",
    name: "Stasiun 03 - RSUD Siti Fatimah",
    street: "Jl. Kolonel H. Burlian (Punti Kayu)",
    kecamatan: "Sukarami",
    issue: "Limpasan Drainase Jalan Utama",
    waterLevel: 60,
    turbidity: 95,
    battery: 95,
    lat: -2.9360,
    lng: 104.7305,
    lastUpdated: "",
  },
  {
    id: 4,
    nodeId: "NODE-04",
    name: "Stasiun 04 - Kolam Retensi IBA",
    street: "Jl. Mayor Ruslan (Kolam IBA)",
    kecamatan: "Ilir Timur II",
    issue: "Kapasitas Kolam Retensi Penuh",
    waterLevel: 145,
    turbidity: 310,
    battery: 84,
    lat: -2.9730,
    lng: 104.7570,
    lastUpdated: "",
  },
  {
    id: 5,
    nodeId: "NODE-05",
    name: "Stasiun 05 - RS Siti Khodijah",
    street: "Jl. Demang Lebar Daun (RS Siti Khodijah)",
    kecamatan: "Ilir Barat I",
    issue: "Sedimentasi & Backwater Sungai Musi",
    waterLevel: 90,
    turbidity: 180,
    battery: 76,
    lat: -2.9695,
    lng: 104.7265,
    lastUpdated: "",
  },
  {
    id: 6,
    nodeId: "NODE-06",
    name: "Stasiun 06 - Simpang Kapt. A. Rivai",
    street: "Jl. Kapten A. Rivai (Simpang 5)",
    kecamatan: "Ilir Barat I",
    issue: "Crossing Drainase Tersumbat",
    waterLevel: 165,
    turbidity: 420,
    battery: 81,
    lat: -2.9812,
    lng: 104.7420,
    lastUpdated: "",
  },
  {
    id: 7,
    nodeId: "NODE-07",
    name: "Stasiun 07 - Kambang Iwak",
    street: "Jl. Tasik (Kambang Iwak Besak)",
    kecamatan: "Ilir Barat I",
    issue: "Limpasan Outflow Danau Retensi",
    waterLevel: 75,
    turbidity: 88,
    battery: 98,
    lat: -2.9890,
    lng: 104.7505,
    lastUpdated: "",
  },
  {
    id: 8,
    nodeId: "NODE-08",
    name: "Stasiun 08 - Depan Damri",
    street: "Jl. Kolonel H. Burlian (Km 6)",
    kecamatan: "Sukarami",
    issue: "Saluran Tersumbat Sampah Domestik",
    waterLevel: 130,
    turbidity: 290,
    battery: 90,
    lat: -2.9245,
    lng: 104.7245,
    lastUpdated: "",
  },
  {
    id: 9,
    nodeId: "NODE-09",
    name: "Stasiun 09 - Cekungan Km 9",
    street: "Jl. Kolonel H. Burlian (Km 9)",
    kecamatan: "Sukarami",
    issue: "Elevasi Jalan Rendah (Cekungan DA)",
    waterLevel: 155,
    turbidity: 380,
    battery: 87,
    lat: -2.9150,
    lng: 104.7170,
    lastUpdated: "",
  },
  {
    id: 10,
    nodeId: "NODE-10",
    name: "Stasiun 10 - Simpang Asrama Haji",
    street: "Jl. Asrama Haji (Sukarami)",
    kecamatan: "Sukarami",
    issue: "Dimensi Box Culvert Kurang Memadai",
    waterLevel: 50,
    turbidity: 70,
    battery: 94,
    lat: -2.9090,
    lng: 104.7075,
    lastUpdated: "",
  },
  {
    id: 11,
    nodeId: "NODE-11",
    name: "Stasiun 11 - Depan Aston Hotel",
    street: "Jl. Basuki Rahmat (Depan Aston)",
    kecamatan: "Kemuning",
    issue: "Penyempitan Bottle-neck Saluran",
    waterLevel: 105,
    turbidity: 190,
    battery: 91,
    lat: -2.9592,
    lng: 104.7405,
    lastUpdated: "",
  },
];

const initialReports: FieldReport[] = [
  {
    id: "REP-001",
    officerName: "Hendra Wijaya (PUPR)",
    street: "Jl. Demang Lebar Daun (Simpang Polda)",
    description: "Saluran air di samping UIGM mengalami pendangkalan hebat akibat endapan semen proyek konstruksi ruko.",
    status: "Sedang Dikerjakan",
    lat: -2.9620,
    lng: 104.7385,
    photoUrl: null,
    timestamp: "Kamis, 21 Mei 2026 14:30",
  },
  {
    id: "REP-002",
    officerName: "Ahmad Bastari (PUPR)",
    street: "Jl. Mayor Ruslan (Kolam IBA)",
    description: "Sampah bambu menyumbat kisi masuk air kolam retensi IBA. Dibutuhkan tim pembersih manual.",
    status: "Belum Ditangani",
    lat: -2.9725,
    lng: 104.7565,
    photoUrl: null,
    timestamp: "Kamis, 21 Mei 2026 16:15",
  },
];

export const EwsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [reports, setReports] = useState<FieldReport[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: dbSensors } = await supabase.from('sensors').select('*');
      if (dbSensors) {
        const mappedSensors = dbSensors.map(s => ({
          id: s.id,
          nodeId: s.id,
          name: s.name,
          street: s.name,
          kecamatan: "Palembang",
          issue: s.problem_type,
          waterLevel: 50,
          turbidity: 100,
          battery: 100,
          lat: s.lat,
          lng: s.lng,
          lastUpdated: new Date().toLocaleTimeString("id-ID"),
          siagaThreshold: s.siaga_threshold,
          daruratThreshold: s.darurat_threshold
        }));
        setSensors(mappedSensors);
      }

      const { data: dbReports } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
      if (dbReports) {
        const mappedReports = dbReports.map(r => ({
          id: r.id,
          officerName: r.sender_name,
          street: r.location_desc,
          description: r.description,
          status: r.status === 'dispatched' ? "Sedang Dikerjakan" : r.status === 'resolved' ? "Selesai" : "Belum Ditangani",
          lat: 0,
          lng: 0,
          photoUrl: null,
          timestamp: new Date(r.created_at).toLocaleString("id-ID")
        }));
        setReports(mappedReports as FieldReport[]);
      }
    };
    fetchInitialData();
  }, []);
  const [activeTab, setActiveTab] = useState<"dashboard" | "map" | "sensors" | "config">("dashboard");
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [config, setConfig] = useState<ThresholdConfig>({
    siaga: 100, // cm
    darurat: 150, // cm
    isWaEnabled: true,
    isSmsEnabled: false,
  });

  const [notifications, setNotifications] = useState<NotificationLog[]>([
    {
      id: "NOTIF-001",
      timestamp: "18:00:00",
      type: "INFO",
      message: "Sistem EWS Banjir Kota Palembang diinisialisasi. 11 Node sensor aktif.",
      channel: "System",
    },
  ]);

  // Update logic triggers alerts reactively
  const checkStatusAndAlert = (updatedSensors: Sensor[], currentConfig: ThresholdConfig) => {
    const timestamp = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    
    updatedSensors.forEach(sensor => {
      const prevSensor = sensors.find(s => s.id === sensor.id);
      if (!prevSensor) return;

      const getStatusType = (level: number) => {
        if (level >= currentConfig.darurat) return "DARURAT";
        if (level >= currentConfig.siaga) return "SIAGA";
        return "NORMAL";
      };

      const prevStatus = getStatusType(prevSensor.waterLevel);
      const newStatus = getStatusType(sensor.waterLevel);

      if (newStatus !== prevStatus && newStatus !== "NORMAL") {
        // Trigger alert log
        const alertMsg = `Sensor ${sensor.street} mendeteksi ketinggian air ${sensor.waterLevel} cm (${newStatus}).`;
        const channels = [];
        if (currentConfig.isWaEnabled) channels.push("WhatsApp");
        if (currentConfig.isSmsEnabled) channels.push("SMS");

        channels.forEach(ch => {
          setNotifications(prev => [
            {
              id: `NOTIF-${Date.now()}-${sensor.id}`,
              timestamp,
              type: newStatus as "SIAGA" | "DARURAT",
              message: `${alertMsg} Disiarkan ke Grup Koordinasi via ${ch}.`,
              channel: ch,
            },
            ...prev,
          ]);
        });

        // System notification
        setNotifications(prev => [
          {
            id: `SYS-${Date.now()}-${sensor.id}`,
            timestamp,
            type: newStatus as "SIAGA" | "DARURAT",
            message: `${alertMsg} Status Node berubah menjadi ${newStatus}.`,
            channel: "System",
          },
          ...prev,
        ]);
      }
    });
  };

  const triggerMockUpdate = () => {
    const timestamp = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const updated = sensors.map((sensor) => {
      // Simulate random fluctuations of -8cm to +8cm
      const levelDiff = Math.floor(Math.random() * 17) - 8;
      const newLevel = Math.max(10, Math.min(220, sensor.waterLevel + levelDiff));
      
      // Simulate turbidity fluctuation
      const turbDiff = Math.floor(Math.random() * 31) - 15;
      const newTurb = Math.max(10, Math.min(800, sensor.turbidity + turbDiff));

      // Battery drains slowly (95% probability of staying same or dropping 1%)
      const batteryDiff = Math.random() > 0.95 ? -1 : 0;
      const newBattery = Math.max(5, sensor.battery + batteryDiff);

      return {
        ...sensor,
        waterLevel: newLevel,
        turbidity: newTurb,
        battery: newBattery,
        lastUpdated: timestamp,
      };
    });

    checkStatusAndAlert(updated, config);
    setSensors(updated);
    
    // Update selected sensor details too
    if (selectedSensor) {
      const updatedSel = updated.find(s => s.id === selectedSensor.id);
      if (updatedSel) setSelectedSensor(updatedSel);
    }
  };

  // Run mock updates every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      triggerMockUpdate();
    }, 8000);
    return () => clearInterval(interval);
  }, [sensors, config]);

  const handleLogin = async (e: React.FormEvent, role: "operator" | "public" | "super_admin", nip: string, setLoading: (l: boolean) => void, setError: (s: string) => void) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        if (role === "operator" && !nip) {
          setError("NIP atau Email Petugas wajib diisi.");
          setLoading(false);
          resolve(false);
          return;
        }
        if (role === "operator") {
          setUser({
            nip: nip || "198804122010121003",
            name: "Ir. H. Akhmad Bastari",
            role: "operator",
            avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80",
          });
        } else if (role === "super_admin") {
          setUser({
            nip: "SUPERADMIN-DEM0",
            name: "Super Admin Demo",
            role: "super_admin",
            avatar: "https://images.unsplash.com/photo-1502767089025-6572583495bf?w=120&auto=format&fit=crop&q=80",
          });
        } else {
          setUser({
            nip: "PUBLIK-GUEST",
            name: "Pengunjung Umum",
            role: "public",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
          });
        }
        setIsLoggedIn(true);
        resolve(true);
      }, 400);
    });
  };

  // Wrapper login function matching context signature
  const login = async (nipOrEmail: string, role: "operator" | "public" | "super_admin"): Promise<boolean> => {
    // Create a minimal fake event to satisfy handleLogin signature
    const fakeEvent = { preventDefault: () => {} } as unknown as React.FormEvent;
    // Dummy setters for loading and error (no UI feedback needed here)
    const setLoading = (l: boolean) => {};
    const setError = (s: string) => {};
    // Forward to existing handleLogin implementation
    const result = await handleLogin(fakeEvent, role, nipOrEmail, setLoading, setError);
    return result;
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setActiveTab("dashboard");
  };

  const updateConfig = (newConfig: Partial<ThresholdConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    // Log configuration changes
    const timestamp = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setNotifications(prev => [
      {
        id: `CONFIG-${Date.now()}`,
        timestamp,
        type: "INFO",
        message: `Konfigurasi diubah oleh Operator. Batas Siaga: ${updatedConfig.siaga}cm, Darurat: ${updatedConfig.darurat}cm.`,
        channel: "System",
      },
      ...prev,
    ]);
  };

  const addReport = async (newRep: Omit<FieldReport, "id" | "timestamp">) => {
    const { data, error } = await supabase.from('reports').insert([{
      sender_name: newRep.officerName,
      location_desc: newRep.street,
      description: newRep.description,
      status: 'pending'
    }]).select();

    if (data && data[0]) {
      const r = data[0];
      const rep: FieldReport = {
        id: r.id,
        officerName: r.sender_name,
        street: r.location_desc,
        description: r.description,
        status: "Belum Ditangani",
        lat: 0,
        lng: 0,
        photoUrl: null,
        timestamp: new Date(r.created_at).toLocaleString("id-ID")
      };
      setReports((prev) => [rep, ...prev]);
    }
  };

  const addSensor = async (name: string, lat: number, lng: number, problemType: string) => {
    const { data } = await supabase.from('sensors').insert([{
      name,
      lat,
      lng,
      problem_type: problemType,
      siaga_threshold: 100,
      darurat_threshold: 150
    }]).select();

    if (data && data[0]) {
      const s = data[0];
      const newSensor: Sensor = {
        id: s.id,
        nodeId: s.id,
        name: s.name,
        street: s.name,
        kecamatan: "Palembang",
        issue: s.problem_type,
        waterLevel: 0,
        turbidity: 0,
        battery: 100,
        lat: s.lat,
        lng: s.lng,
        lastUpdated: new Date().toLocaleTimeString("id-ID"),
        siagaThreshold: s.siaga_threshold,
        daruratThreshold: s.darurat_threshold
      };
      setSensors((prev) => [...prev, newSensor]);
    }
  };

  const updateReportStatus = async (reportId: string | number, newStatus: 'pending' | 'dispatched' | 'resolved' | 'rejected') => {
    await supabase.from('reports').update({ status: newStatus }).eq('id', reportId);
    
    setReports((prev) => prev.map((r) => {
      if (r.id === reportId) {
        let displayStatus: "Sedang Dikerjakan" | "Selesai" | "Belum Ditangani" = "Belum Ditangani";
        if (newStatus === 'dispatched') displayStatus = "Sedang Dikerjakan";
        if (newStatus === 'resolved') displayStatus = "Selesai";
        return { ...r, status: displayStatus };
      }
      return r;
    }));
  };

  const updateSensorThresholds = async (sensorId: string | number, siaga: number, darurat: number) => {
    await supabase.from('sensors').update({ siaga_threshold: siaga, darurat_threshold: darurat }).eq('id', sensorId);
    setSensors((prev) => prev.map((s) => s.id === sensorId ? { ...s, siagaThreshold: siaga, daruratThreshold: darurat } : s));
  };

  return (
    <EwsContext.Provider
      value={{
        sensors,
        reports,
        notifications,
        config,
        user,
        activeTab,
        selectedSensor,
        isLoggedIn,
        login: login,
        logout,
        updateConfig,
        addReport,
        setSelectedSensor,
        setActiveTab,
        triggerMockUpdate,
        addSensor,
        updateReportStatus,
        updateSensorThresholds,
      }}
    >
      {children}
    </EwsContext.Provider>
  );
};

export const useEws = () => {
  const context = useContext(EwsContext);
  if (!context) {
    throw new Error("useEws must be used within an EwsProvider");
  }
  return context;
};
