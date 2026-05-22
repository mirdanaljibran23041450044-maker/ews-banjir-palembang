import { NextResponse } from "next/server";

// Static mock state for API endpoints
// This mimics the shared cache between Python reactive worker and the API Bridge
let thresholds = {
  siaga: 100,
  darurat: 150,
  isWaEnabled: true,
  isSmsEnabled: false,
};

let sensorsData = [
  { id: 1, nodeId: "NODE-01", name: "Stasiun 01 - Simpang Polda", street: "Jl. Demang Lebar Daun (Simpang Polda)", kecamatan: "Kemuning", issue: "Penyempitan Saluran & Air Pasang", waterLevel: 85, turbidity: 120, battery: 92, lat: -2.9625, lng: 104.7390 },
  { id: 2, nodeId: "NODE-02", name: "Stasiun 02 - Bank Sinarmas", street: "Jl. Basuki Rahmat (Depan Bank Sinarmas)", kecamatan: "Kemuning", issue: "Sedimentasi & Sumbatan Sampah", waterLevel: 115, turbidity: 245, battery: 89, lat: -2.9555, lng: 104.7432 },
  { id: 3, nodeId: "NODE-03", name: "Stasiun 03 - RSUD Siti Fatimah", street: "Jl. Kolonel H. Burlian (Punti Kayu)", kecamatan: "Sukarami", issue: "Limpasan Drainase Jalan Utama", waterLevel: 60, turbidity: 95, battery: 95, lat: -2.9360, lng: 104.7305 },
  { id: 4, nodeId: "NODE-04", name: "Stasiun 04 - Kolam Retensi IBA", street: "Jl. Mayor Ruslan (Kolam IBA)", kecamatan: "Ilir Timur II", issue: "Kapasitas Kolam Retensi Penuh", waterLevel: 145, turbidity: 310, battery: 84, lat: -2.9730, lng: 104.7570 },
  { id: 5, nodeId: "NODE-05", name: "Stasiun 05 - RS Siti Khodijah", street: "Jl. Demang Lebar Daun (RS Siti Khodijah)", kecamatan: "Ilir Barat I", issue: "Sedimentasi & Backwater Sungai Musi", waterLevel: 90, turbidity: 180, battery: 76, lat: -2.9695, lng: 104.7265 },
  { id: 6, nodeId: "NODE-06", name: "Stasiun 06 - Simpang Kapt. A. Rivai", street: "Jl. Kapten A. Rivai (Simpang 5)", kecamatan: "Ilir Barat I", issue: "Crossing Drainase Tersumbat", waterLevel: 165, turbidity: 420, battery: 81, lat: -2.9812, lng: 104.7420 },
  { id: 7, nodeId: "NODE-07", name: "Stasiun 07 - Kambang Iwak", street: "Jl. Tasik (Kambang Iwak Besak)", kecamatan: "Ilir Barat I", issue: "Limpasan Outflow Danau Retensi", waterLevel: 75, turbidity: 88, battery: 98, lat: -2.9890, lng: 104.7505 },
  { id: 8, nodeId: "NODE-08", name: "Stasiun 08 - Depan Damri", street: "Jl. Kolonel H. Burlian (Km 6)", kecamatan: "Sukarami", issue: "Saluran Tersumbat Sampah Domestik", waterLevel: 130, turbidity: 290, battery: 90, lat: -2.9245, lng: 104.7245 },
  { id: 9, nodeId: "NODE-09", name: "Stasiun 09 - Cekungan Km 9", street: "Jl. Kolonel H. Burlian (Km 9)", kecamatan: "Sukarami", issue: "Elevasi Jalan Rendah (Cekungan DA)", waterLevel: 155, turbidity: 380, battery: 87, lat: -2.9150, lng: 104.7170 },
  { id: 10, nodeId: "NODE-10", name: "Stasiun 10 - Simpang Asrama Haji", street: "Jl. Asrama Haji (Sukarami)", kecamatan: "Sukarami", issue: "Dimensi Box Culvert Kurang Memadai", waterLevel: 50, turbidity: 70, battery: 94, lat: -2.9090, lng: 104.7075 },
  { id: 11, nodeId: "NODE-11", name: "Stasiun 11 - Depan Aston Hotel", street: "Jl. Basuki Rahmat (Depan Aston)", kecamatan: "Kemuning", issue: "Penyempitan Bottle-neck Saluran", waterLevel: 105, turbidity: 190, battery: 91, lat: -2.9592, lng: 104.7405 },
];

export async function GET() {
  const timestamp = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  
  // Oscillate sensor levels slightly for external API clients
  sensorsData = sensorsData.map(sensor => {
    const diff = Math.floor(Math.random() * 7) - 3;
    const newLvl = Math.max(10, Math.min(220, sensor.waterLevel + diff));
    return {
      ...sensor,
      waterLevel: newLvl,
      lastUpdated: timestamp
    };
  });

  return NextResponse.json({
    status: "success",
    timestamp,
    config: thresholds,
    sensors: sensorsData,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.config) {
      thresholds = { ...thresholds, ...body.config };
    }
    if (body.sensors) {
      sensorsData = body.sensors;
    }
    return NextResponse.json({
      status: "success",
      message: "Data sensor & konfigurasi berhasil diperbarui via API Bridge.",
      config: thresholds,
    });
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Gagal memproses data" }, { status: 400 });
  }
}
