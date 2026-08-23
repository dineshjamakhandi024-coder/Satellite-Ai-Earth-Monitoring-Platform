# 02. REST API Specification & Endpoint Reference

## 1. Overview
The Satellite AI Platform exposes a FastAPI REST API running by default on `http://127.0.0.1:8000`. Interactive OpenAPI documentation is accessible at `http://127.0.0.1:8000/docs` or `http://127.0.0.1:8000/redoc`.

---

## 2. Base Configuration & CORS
- **Base URL**: `http://127.0.0.1:8000`
- **Allowed Origins**: `*` (configured via `CORSMiddleware`)
- **Static Mount**: `/uploads` -> `Backend of satelite platform/uploads/`

---

## 3. Authentication & User Endpoints

### 3.1 User Registration
- **Endpoint**: `POST /register`
- **Request Body**:
```json
{
  "name": "Dr. Sarah Connor",
  "email": "sarah@satellite.ai",
  "mobile": "+1 (555) 019-2834",
  "password": "SecurePassword123",
  "role": "Satellite Analyst"
}
```
- **Response**: `200 OK`
```json
{
  "status": "success",
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "Dr. Sarah Connor",
    "email": "sarah@satellite.ai",
    "role": "Satellite Analyst"
  }
}
```

### 3.2 User Login
- **Endpoint**: `POST /login`
- **Request Body**:
```json
{
  "email": "sarah@satellite.ai",
  "password": "SecurePassword123"
}
```
- **Response**: `200 OK` (Returns user details and authentication status)

### 3.3 Password Reset Request
- **Endpoint**: `POST /forgot-password`
- **Request Body**: `{"email": "sarah@satellite.ai"}`
- **Response**: `200 OK`

---

## 4. Computer Vision Analysis Endpoints

### 4.1 Dual-Temporal Change Detection
- **Endpoint**: `POST /change-detection`
- **Content-Type**: `multipart/form-data`
- **Form Parameters**:
  - `before_image` (UploadFile, required): Baseline satellite image.
  - `after_image` (UploadFile, required): Recent satellite image.
  - `method` (str, default="ai"): Algorithm mode (`"ai"`, `"edge"`, `"pixel"`).
  - `location` (str, default="Monitored Sector"): Geographical label.
- **Response**:
```json
{
  "status": "success",
  "report_id": 12,
  "overall_change": 14.82,
  "changed_pixels": 85420,
  "total_pixels": 576400,
  "change_map_url": "/uploads/uuid_change_map.png",
  "before_image_url": "/uploads/uuid_before.png",
  "after_image_url": "/uploads/uuid_after.png",
  "method": "ai",
  "location": "Monitored Sector",
  "created_at": "2026-08-23T11:20:00"
}
```

### 4.2 Change Detection History
- **Endpoint**: `GET /change-detection/history`
- **Query Params**: `limit` (int, default=20)
- **Response**: List of historic change detection records.

### 4.3 Change Detection PDF Report Download
- **Endpoint**: `GET /change-detection/report/{report_id}`
- **Response**: `application/pdf` (FileResponse with generated PDF report).

---

### 4.4 Urban Growth Analysis
- **Endpoint**: `POST /urban-growth`
- **Content-Type**: `multipart/form-data`
- **Form Parameters**:
  - `before_image` (UploadFile, required)
  - `after_image` (UploadFile, required)
  - `location` (str, optional)
  - `notes` (str, optional)
- **Response**:
```json
{
  "status": "success",
  "report_id": 8,
  "urban_expansion": 18.45,
  "changed_pixels": 105200,
  "total_pixels": 576400,
  "change_map_url": "/uploads/uuid_urban_map.png",
  "before_image_url": "/uploads/uuid_before.png",
  "after_image_url": "/uploads/uuid_after.png",
  "location": "Sector 9 Metro",
  "created_at": "2026-08-23T11:22:00"
}
```

### 4.5 Urban Growth History & PDF Report
- **Endpoint**: `GET /urban-growth/history`
- **Endpoint**: `GET /urban-growth/{report_id}`
- **Endpoint**: `GET /urban-growth/report/{report_id}` -> Returns PDF file.

---

### 4.6 Flood Impact & Inundation Analysis
- **Endpoint**: `POST /flood-analysis`
- **Content-Type**: `multipart/form-data`
- **Form Parameters**:
  - `before_image` (UploadFile, required)
  - `after_image` (UploadFile, required)
  - `location` (str, optional)
  - `severity_override` (str, optional)
- **Response**:
```json
{
  "status": "success",
  "report_id": 5,
  "flood_coverage": 32.6,
  "flood_depth": 4.8,
  "rainfall_mm": 312.0,
  "buildings_damaged": 248,
  "population_affected": 18500,
  "severity_level": "Critical",
  "change_map_url": "/uploads/uuid_flood_map.png"
}
```

### 4.7 Flood Reports History & PDF Download
- **Endpoint**: `GET /flood-analysis/history`
- **Endpoint**: `GET /flood-analysis/report/{report_id}` -> Returns PDF file.

---

### 4.8 Forest Monitoring & Canopy Loss
- **Endpoint**: `POST /forest-monitoring`
- **Content-Type**: `multipart/form-data`
- **Form Parameters**:
  - `before_image` (UploadFile, required)
  - `after_image` (UploadFile, required)
  - `location` (str, optional)
- **Response**:
```json
{
  "status": "success",
  "report_id": 4,
  "forest_coverage": 76.4,
  "trees_lost": 8.2,
  "new_plantation": 2.1,
  "risk_level": "High",
  "area_scanned_km2": 450,
  "confidence": 98.7,
  "change_map_url": "/uploads/uuid_forest_map.png"
}
```

### 4.9 Forest Reports History & PDF Download
- **Endpoint**: `GET /forest-monitoring/history`
- **Endpoint**: `GET /forest-monitoring/report/{report_id}` -> Returns PDF file.

---

## 5. Telemetry & Disaster Alert Endpoints

### 5.1 Real-Time Disaster Alerts Feed
- **Endpoint**: `GET /disaster-alerts`
- **Query Params**: `category` (optional), `severity` (optional)
- **Response**: List of active global hazard alerts.

### 5.2 Create Custom Disaster Alert
- **Endpoint**: `POST /disaster-alerts`
- **Request Body**: `DisasterAlertCreate` schema
- **Response**: `200 OK` with created alert record.

### 5.3 Disaster Alert PDF Briefing
- **Endpoint**: `GET /disaster-alerts/report/{alert_id}` -> Returns PDF file.

---

### 5.4 Live Climate Telemetry
- **Endpoint**: `GET /climate-monitoring/live`
- **Response**:
```json
{
  "temperature": 29.4,
  "rainfall_mm": 82.0,
  "wind_speed": 18.2,
  "humidity": 68.0,
  "aqi": 48,
  "cloud_cover": 45.0,
  "region": "Global Overview",
  "status": "Normal",
  "timestamp": "2026-08-23T11:25:00"
}
```

### 5.5 Submit Climate Record & Download Report
- **Endpoint**: `POST /climate-monitoring/report`
- **Endpoint**: `GET /climate-monitoring/report/{report_id}` -> Returns PDF file.

---

## 6. Global Analytics & Master Reports

### 6.1 Mission Dashboard Overview
- **Endpoint**: `GET /dashboard/overview`
- **Response**: Aggregated counts of satellites, analyses performed, alerts active, and system health status.

### 6.2 Consolidated Reports Registry
- **Endpoint**: `GET /reports/all`
- **Response**: Unified list combining Urban, Flood, Forest, Change Detection, Climate, and Disaster reports for the central Reports Archive UI.
