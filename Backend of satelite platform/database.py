import sqlite3
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent
DATABASE_NAME = str(BASE_DIR / "satellite_ai.db")


# ============================================================
# DATABASE CONNECTION
# ============================================================

def get_connection():
    connection = sqlite3.connect(
        DATABASE_NAME,
        check_same_thread=False
    )
    connection.row_factory = sqlite3.Row
    return connection


def ensure_column_exists(cursor, table_name, column_name, column_def):
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [row[1] for row in cursor.fetchall()]
    if column_name not in columns:
        try:
            cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_def}")
        except Exception as e:
            print(f"Column migration notice ({table_name}.{column_name}):", e)


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

def create_database():
    connection = get_connection()
    cursor = connection.cursor()

    # 1. USERS TABLE
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            mobile TEXT DEFAULT '',
            password TEXT NOT NULL,
            role TEXT DEFAULT 'Researcher',
            created_at TEXT NOT NULL
        )
    """)
    ensure_column_exists(cursor, "users", "role", "TEXT DEFAULT 'Researcher'")
    ensure_column_exists(cursor, "users", "mobile", "TEXT DEFAULT ''")
    ensure_column_exists(cursor, "users", "created_at", "TEXT DEFAULT ''")

    # 2. URBAN GROWTH REPORTS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS urban_growth_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            before_image TEXT,
            after_image TEXT,
            change_map TEXT,
            urban_expansion REAL DEFAULT 0,
            changed_pixels INTEGER DEFAULT 0,
            total_pixels INTEGER DEFAULT 0,
            image_width INTEGER DEFAULT 0,
            image_height INTEGER DEFAULT 0,
            method TEXT,
            location TEXT DEFAULT 'Global Sector',
            notes TEXT DEFAULT '',
            created_at TEXT NOT NULL
        )
    """)
    ensure_column_exists(cursor, "urban_growth_reports", "location", "TEXT DEFAULT 'Global Sector'")
    ensure_column_exists(cursor, "urban_growth_reports", "notes", "TEXT DEFAULT ''")

    # 3. CHANGE DETECTION REPORTS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS change_detection_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            before_image TEXT,
            after_image TEXT,
            change_map TEXT,
            overall_change REAL DEFAULT 0,
            changed_pixels INTEGER DEFAULT 0,
            total_pixels INTEGER DEFAULT 0,
            image_width INTEGER DEFAULT 0,
            image_height INTEGER DEFAULT 0,
            method TEXT,
            location TEXT DEFAULT 'Monitored Region',
            created_at TEXT NOT NULL
        )
    """)

    # 4. FLOOD ANALYSIS REPORTS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS flood_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            before_image TEXT,
            after_image TEXT,
            change_map TEXT,
            flood_coverage REAL DEFAULT 0,
            changed_pixels INTEGER DEFAULT 0,
            total_pixels INTEGER DEFAULT 0,
            flood_depth REAL DEFAULT 4.8,
            rainfall_mm REAL DEFAULT 312,
            buildings_damaged INTEGER DEFAULT 248,
            population_affected INTEGER DEFAULT 18500,
            severity_level TEXT DEFAULT 'Critical',
            location TEXT DEFAULT 'Flood Zone Sector 4',
            created_at TEXT NOT NULL
        )
    """)

    # 5. FOREST MONITORING REPORTS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS forest_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            before_image TEXT,
            after_image TEXT,
            change_map TEXT,
            forest_coverage REAL DEFAULT 82.0,
            trees_lost REAL DEFAULT 6.4,
            new_plantation REAL DEFAULT 3.2,
            risk_level TEXT DEFAULT 'Medium',
            area_scanned_km2 REAL DEFAULT 245,
            confidence REAL DEFAULT 98.7,
            location TEXT DEFAULT 'Amazon Basin',
            created_at TEXT NOT NULL
        )
    """)

    # 6. CLIMATE REPORTS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS climate_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            temperature REAL DEFAULT 29.0,
            rainfall_mm REAL DEFAULT 82.0,
            wind_speed REAL DEFAULT 18.0,
            humidity REAL DEFAULT 68.0,
            aqi INTEGER DEFAULT 48,
            cloud_cover REAL DEFAULT 45.0,
            status TEXT DEFAULT 'Active',
            region TEXT DEFAULT 'Global Overview',
            notes TEXT DEFAULT '',
            created_at TEXT NOT NULL
        )
    """)

    # 7. DISASTER ALERTS TABLE
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS disaster_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            location TEXT NOT NULL,
            severity TEXT NOT NULL,
            magnitude TEXT DEFAULT '',
            status TEXT DEFAULT 'Active',
            details TEXT DEFAULT '',
            created_at TEXT NOT NULL
        )
    """)

    # 8. UPLOADED SATELLITE IMAGES CATALOGUE
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS uploaded_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            category TEXT DEFAULT 'General',
            resolution TEXT DEFAULT '10m/px',
            file_size INTEGER DEFAULT 0,
            uploaded_at TEXT NOT NULL
        )
    """)

    # Seed initial disaster alerts if empty
    cursor.execute("SELECT COUNT(*) FROM disaster_alerts")
    if cursor.fetchone()[0] == 0:
        now = datetime.now().isoformat()
        initial_alerts = [
            ("Earthquake Detected", "earthquake", "Tokyo, Japan", "Critical", "Magnitude 7.2", "Active", "Tectonic shift recorded along Pacific Rim. Evacuation advisory active.", now),
            ("Flood Warning", "flood", "Kerala, India", "High", "River Level +4.2m", "Active", "Continuous heavy monsoon rain exceeding seasonal thresholds. Relief camps deployed.", now),
            ("Forest Wildfire", "fire", "California, USA", "High", "Area 1,200 ha", "Active", "Thermal anomaly detected by infrared orbiters. Fire containment at 35%.", now),
            ("Cyclone Category-3", "cyclone", "Bay of Bengal", "Critical", "Wind 145 km/h", "Active", "Deep atmospheric depression moving northwest. Coastal alerts issued.", now),
            ("Landslide Alert", "earthquake", "Himalayan Foothills", "Medium", "Risk Index 68%", "Monitoring", "Soil saturation warning following torrential rainfall.", now)
        ]
        cursor.executemany("""
            INSERT INTO disaster_alerts (title, category, location, severity, magnitude, status, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, initial_alerts)

    # Seed initial climate record if empty
    cursor.execute("SELECT COUNT(*) FROM climate_reports")
    if cursor.fetchone()[0] == 0:
        now = datetime.now().isoformat()
        cursor.execute("""
            INSERT INTO climate_reports (temperature, rainfall_mm, wind_speed, humidity, aqi, cloud_cover, status, region, notes, created_at)
            VALUES (29.0, 82.0, 18.0, 68.0, 48, 45.0, 'Normal', 'Global Average', 'Atmospheric parameters within seasonal expectations.', ?)
        """, (now,))

    # Seed default demo user if not exists
    cursor.execute("SELECT id FROM users WHERE email = 'demo@satellite.ai'")
    if not cursor.fetchone():
        now = datetime.now().isoformat()
        cursor.execute("""
            INSERT INTO users (name, email, mobile, password, role, created_at)
            VALUES ('Dr. Sarah Connor', 'demo@satellite.ai', '+1 (555) 019-2834', 'satellite123', 'Chief Satellite Analyst', ?)
        """, (now,))

    connection.commit()
    connection.close()


if __name__ == "__main__":
    create_database()
    print("Database tables initialized successfully.")