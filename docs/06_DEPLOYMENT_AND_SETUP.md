# 06. Deployment, Setup & Operational Guide

## 1. Prerequisites
- **Operating System**: Windows 10/11, macOS, or Linux
- **Python**: Version 3.9, 3.10, 3.11, or 3.12
- **Web Browser**: Modern browser with WebGL enabled (Google Chrome, Microsoft Edge, Firefox, Brave)
- **Optional**: Visual Studio Code with Live Server extension

---

## 2. Installation & Dependency Setup

### Step 1: Clone or Navigate to Project Directory
```powershell
cd "c:\Users\admin\OneDrive\Desktop\Satellite  Platform"
```

### Step 2: Create and Activate Virtual Environment (Recommended)
```powershell
# Create virtual environment
python -m venv venv

# Activate on Windows PowerShell
.\venv\Scripts\Activate.ps1

# Activate on Linux/macOS
source venv/bin/activate
```

### Step 3: Install Required Dependencies
```powershell
pip install -r requirements.txt
```

---

## 3. Launching the Platform

### Method A: One-Click Launch (Windows Batch File)
Double-click `run_satellite_platform.bat` or run:
```powershell
.\run_satellite_platform.bat
```
This automatically:
1. Opens the workspace in Visual Studio Code.
2. Starts the FastAPI backend on `http://127.0.0.1:8000` with auto-reload.
3. Launches `index.html` in your default browser.

---

### Method B: Manual Command-Line Startup

#### 1. Start the FastAPI Backend Server
```powershell
# Navigate to backend folder or run from root
python main.py
```
Or directly with Uvicorn:
```powershell
cd "Backend of satelite platform"
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- **Backend API**: `http://127.0.0.1:8000`
- **Swagger Documentation**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

#### 2. Open the Frontend
Open `index.html` directly in your browser or serve via Live Server or Python HTTP server:
```powershell
python -m http.server 5500
```
Then visit `http://127.0.0.1:5500/index.html`.

---

## 4. Mobile Live Access & QR Pairing

To view the platform on your smartphone or tablet connected to the same local Wi-Fi network:

1. Double-click `open_on_mobile.bat` or run:
```powershell
python start_mobile_server.py
```
2. The script will automatically detect your local IP address (e.g., `http://192.168.1.X:5500/index.html`), generate `mobile_qr_code.png`, and open `mobile_access.html`.
3. Scan the QR code with your mobile camera to test the platform on mobile.

---

## 5. Verification & Health Checks

Run the automated backend test suite to verify database tables and Computer Vision algorithms:
```powershell
python test_backend.py
```
Expected output:
- `Database initialized with 8 tables.`
- `Running Change Detection CV... -> Change Detection OK`
- `Running Urban Growth CV... -> Urban Growth OK`
- `Running Flood CV... -> Flood Analysis OK`
- `Running Forest CV... -> Forest Monitoring OK`
- `All backend algorithms verified successfully!`
