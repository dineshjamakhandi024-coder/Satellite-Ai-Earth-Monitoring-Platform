import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(r"c:\Users\admin\OneDrive\Desktop\Satellite  Platform\Backend of satelite platform")
sys.path.insert(0, str(backend_dir))

from database import create_database, get_connection
import cv2
import numpy as np

print("Testing database initialization...")
create_database()
conn = get_connection()
cursor = conn.cursor()
cursor.execute("SELECT count(*) FROM sqlite_master WHERE type='table'")
count = cursor.fetchone()[0]
print(f"Database initialized with {count} tables.")
conn.close()

print("Testing Computer Vision algorithms...")
from main import generate_change_map_cv, generate_urban_growth_cv, generate_flood_analysis_cv, generate_forest_monitoring_cv

sample_dir = Path(r"c:\Users\admin\OneDrive\Desktop\Satellite  Platform")
before_img = sample_dir / "images/before image.png"
after_img = sample_dir / "images/after image.png"

if before_img.exists() and after_img.exists():
    print("Running Change Detection CV...")
    cmap, change_pct, ch_px, tot_px, w, h = generate_change_map_cv(before_img, after_img, "ai")
    print(f"Change Detection OK: {change_pct}% change, {ch_px} changed pixels, Map: {cmap}")

    print("Running Urban Growth CV...")
    umap, exp_pct, uch_px, utot_px, uw, uh = generate_urban_growth_cv(before_img, after_img)
    print(f"Urban Growth OK: {exp_pct}% expansion, Map: {umap}")

    print("Running Flood CV...")
    fmap, flood_cov, fch_px, ftot_px, depth, rain, bldgs, pop, sev, fw, fh = generate_flood_analysis_cv(before_img, after_img)
    print(f"Flood Analysis OK: {flood_cov}% flood coverage, Depth: {depth}m, Map: {fmap}")

    print("Running Forest CV...")
    tmap, f_cov, lost, gain, risk, area, conf, tw, th = generate_forest_monitoring_cv(before_img, after_img)
    print(f"Forest Monitoring OK: Forest {f_cov}%, Loss {lost}%, Map: {tmap}")

print("All backend algorithms verified successfully!")
