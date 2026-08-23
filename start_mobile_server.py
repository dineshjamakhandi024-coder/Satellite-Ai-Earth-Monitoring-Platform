import http.server
import socketserver
import socket
import os
import sys
import qrcode
from pathlib import Path

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

PORT = 5500
PROJECT_DIR = Path(__file__).resolve().parent
os.chdir(PROJECT_DIR)

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

ip = get_local_ip()
mobile_url = f"http://{ip}:{PORT}"
qr_dir = PROJECT_DIR / "images"
qr_dir.mkdir(parents=True, exist_ok=True)
qr_image_path = qr_dir / "mobile_qr_code.png"

# Generate QR code image
qr = qrcode.QRCode(box_size=10, border=2)
qr.add_data(mobile_url)
qr.make(fit=True)
img = qr.make_image(fill_color="black", back_color="white")
img.save(str(qr_image_path))

print("\n" + "=" * 65)
print(" 🛰  SATELLITE PLATFORM - MOBILE LIVE ACCESS SERVER")
print("=" * 65)
print(f"\n📱 1. Scan the QR code or type this URL into your mobile browser:")
print(f"👉 \033[92m\033[1m{mobile_url}\033[0m\n")
print(f"📡 2. Ensure your phone and PC are connected to the SAME Wi-Fi")
print(f"   (or connect your computer to your phone's Mobile Hotspot).")
print(f"\n🖼️  QR Code saved as: {qr_image_path.name}")
print("=" * 65)
print(f"Server is actively running on port {PORT}. Press Ctrl+C to stop.\n")

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and caching headers for mobile devices
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

with socketserver.TCPServer(("0.0.0.0", PORT), CustomHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nMobile server stopped.")
