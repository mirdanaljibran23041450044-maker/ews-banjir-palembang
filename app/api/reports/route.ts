import { NextResponse } from "next/server";

// Static mock state for reports
const reportsList = [
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

export async function GET() {
  return NextResponse.json({
    status: "success",
    count: reportsList.length,
    reports: reportsList,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { officerName, street, description, status, lat, lng, photoUrl } = body;
    
    if (!street || !description || lat === undefined || lng === undefined) {
      return NextResponse.json({ status: "error", message: "Parameter tidak lengkap" }, { status: 400 });
    }

    const timestamp = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }) + " " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    const newReport = {
      id: `REP-${String(reportsList.length + 1).padStart(3, "0")}`,
      officerName: officerName || "Petugas Lapangan",
      street,
      description,
      status: status || "Belum Ditangani",
      lat,
      lng,
      photoUrl: photoUrl || null,
      timestamp,
    };

    reportsList.unshift(newReport);

    return NextResponse.json({
      status: "success",
      message: "Laporan petugas lapangan berhasil ditambahkan.",
      report: newReport,
    });
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Gagal memproses data laporan" }, { status: 400 });
  }
}
