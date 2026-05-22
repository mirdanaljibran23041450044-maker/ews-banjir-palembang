#!/usr/bin/env python3
"""
================================================================================
  antigravity_server.py
  Python Reactive Framework Simulation - Early Warning System (EWS) Palembang
================================================================================
  This script acts as the reactive IoT state engine for the Palembang flood
  Early Warning System. It simulates 11 critical sensor nodes, processes
  telemetry updates, triggers reactive alerts based on threshold configurations,
  and synchronizes data with the Next.js API Bridge.
"""

import time
import random
import json
import urllib.request
import urllib.error
from datetime import datetime

# Ambang Batas Status (bisa diperbarui secara reaktif)
THRESHOLDS = {
    "siaga": 100,      # cm
    "darurat": 150,     # cm
    "isWaEnabled": True,
    "isSmsEnabled": False
}

# 11 Titik Kritis Banjir Palembang
SENSORS = [
    {"id": 1, "nodeId": "NODE-01", "street": "Jl. Demang Lebar Daun (Simpang Polda)", "waterLevel": 85, "turbidity": 120, "status": "NORMAL"},
    {"id": 2, "nodeId": "NODE-02", "street": "Jl. Basuki Rahmat (Depan Bank Sinarmas)", "waterLevel": 115, "turbidity": 245, "status": "SIAGA"},
    {"id": 3, "nodeId": "NODE-03", "street": "Jl. Kolonel H. Burlian (Punti Kayu)", "waterLevel": 60, "turbidity": 95, "status": "NORMAL"},
    {"id": 4, "nodeId": "NODE-04", "street": "Jl. Mayor Ruslan (Kolam IBA)", "waterLevel": 145, "turbidity": 310, "status": "SIAGA"},
    {"id": 5, "nodeId": "NODE-05", "street": "Jl. Demang Lebar Daun (RS Siti Khodijah)", "waterLevel": 90, "turbidity": 180, "status": "NORMAL"},
    {"id": 6, "nodeId": "NODE-06", "street": "Jl. Kapten A. Rivai (Simpang 5)", "waterLevel": 165, "turbidity": 420, "status": "DARURAT"},
    {"id": 7, "nodeId": "NODE-07", "street": "Jl. Tasik (Kambang Iwak Besak)", "waterLevel": 75, "turbidity": 88, "status": "NORMAL"},
    {"id": 8, "nodeId": "NODE-08", "street": "Jl. Kolonel H. Burlian (Km 6)", "waterLevel": 130, "turbidity": 290, "status": "SIAGA"},
    {"id": 9, "nodeId": "NODE-09", "street": "Jl. Kolonel H. Burlian (Km 9)", "waterLevel": 155, "turbidity": 380, "status": "DARURAT"},
    {"id": 10, "nodeId": "NODE-10", "street": "Jl. Asrama Haji (Sukarami)", "waterLevel": 50, "turbidity": 70, "status": "NORMAL"},
    {"id": 11, "nodeId": "NODE-11", "street": "Jl. Basuki Rahmat (Depan Aston)", "waterLevel": 105, "turbidity": 190, "status": "SIAGA"},
]

API_URL = "http://localhost:3000/api/sensors"

def get_status_label(level):
    """Fungsi reaktif untuk menentukan status level air"""
    if level >= THRESHOLDS["darurat"]:
        return "DARURAT"
    elif level >= THRESHOLDS["siaga"]:
        return "SIAGA"
    return "NORMAL"

def print_banner():
    print("=" * 80)
    print("  SIMULASI PYTHON REACTIVE ENGINE - EWS BANJIR PALEMBANG (ANTIGRAVITY)")
    print("=" * 80)
    print(f"  Batas Siaga   : {THRESHOLDS['siaga']} cm")
    print(f"  Batas Darurat : {THRESHOLDS['darurat']} cm")
    print(f"  WhatsApp Alert: {'AKTIF' if THRESHOLDS['isWaEnabled'] else 'NON-AKTIF'}")
    print(f"  SMS Alert     : {'AKTIF' if THRESHOLDS['isSmsEnabled'] else 'NON-AKTIF'}")
    print("-" * 80)

def send_to_api_bridge(sensors_list):
    """Mengirim data telemetri terupdate ke API Bridge Next.js"""
    payload = {
        "config": THRESHOLDS,
        "sensors": sensors_list
    }
    req_data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        API_URL, 
        data=req_data, 
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=2) as response:
            res_data = response.read().decode('utf-8')
            res_json = json.loads(res_data)
            # Reaktif: Jika website memperbarui config di database, kita sinkronkan kesini
            if "config" in res_json:
                global THRESHOLDS
                THRESHOLDS = res_json["config"]
    except urllib.error.URLError:
        # API Bridge offline (Server Next.js belum berjalan)
        pass

def main():
    print_banner()
    iteration = 0
    
    while True:
        iteration += 1
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"\n[{timestamp}] Iterasi Simulasi #{iteration}...")
        
        # Simulasikan fluktuasi level air secara reaktif
        for sensor in SENSORS:
            prev_status = sensor["status"]
            
            # Fluktuasi acak level air (-5cm s.d +5cm)
            diff = random.randint(-5, 5)
            sensor["waterLevel"] = max(10, min(220, sensor["waterLevel"] + diff))
            
            # Fluktuasi kekeruhan
            turb_diff = random.randint(-10, 10)
            sensor["turbidity"] = max(10, min(800, sensor["turbidity"] + turb_diff))
            
            # Re-evaluasi Status Reaktif
            new_status = get_status_label(sensor["waterLevel"])
            sensor["status"] = new_status
            
            # Trigger Alarm Peringatan jika status memburuk
            if new_status != prev_status:
                if new_status in ["SIAGA", "DARURAT"]:
                    print(f"  >>> [REAKTIF ALARM] {sensor['nodeId']} ({sensor['street']}) berubah menjadi {new_status}!")
                    print(f"      Tinggi Air: {sensor['waterLevel']} cm | Kekeruhan: {sensor['turbidity']} NTU")
                    
                    # Logika Simulasi Broadcast Notifikasi
                    if THRESHOLDS["isWaEnabled"]:
                        print(f"      [WA BUSINESS] Menyebarkan alert ke WhatsApp Group Koordinasi Dinas PUPR...")
                    if THRESHOLDS["isSmsEnabled"]:
                        print(f"      [SMS GATEWAY] Mengirim SMS peringatan darurat ke warga sekitar {sensor['street']}...")
        
        # Tampilkan ringkasan status stasiun bermasalah di terminal
        active_alerts = [s for s in SENSORS if s["status"] in ["SIAGA", "DARURAT"]]
        print(f"  Summary: {len(active_alerts)}/11 stasiun siaga/darurat banjir.")
        
        # Kirim data ke API Bridge
        send_to_api_bridge(SENSORS)
        
        # Tunggu 8 detik untuk iterasi berikutnya (sesuai interval sensor IoT)
        time.sleep(8)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nSimulasi dihentikan. Keluar...")
