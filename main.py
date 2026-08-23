# ============================================================
# SATELLITE AI - ROOT ASGI ENTRYPOINT
# Earth Observation, Computer Vision & Monitoring Platform
# ============================================================

import importlib.util
import os
import sys
from pathlib import Path

# Set working directory & sys.path for backend imports (database, reports, uploads)
ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "Backend of satelite platform"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Ensure backend directory is current working context for relative DB/folder lookups
os.chdir(BACKEND_DIR)

# Dynamically load the backend application module
backend_main_path = BACKEND_DIR / "main.py"
spec = importlib.util.spec_from_file_location("satellite_backend_main", backend_main_path)
backend_module = importlib.util.module_from_spec(spec)
sys.modules["satellite_backend_main"] = backend_module
spec.loader.exec_module(backend_module)

# Expose FastAPI application instance for ASGI servers (uvicorn main:app)
app = backend_module.app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
