import os
import sys
from pathlib import Path

root_dir = str(Path(__file__).resolve().parent.parent)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

current_pythonpath = os.environ.get("PYTHONPATH", "")
if root_dir not in current_pythonpath:
    os.environ["PYTHONPATH"] = f"{root_dir}{os.pathsep}{current_pythonpath}" if current_pythonpath else root_dir

import uvicorn

if __name__ == "__main__":
    print("[ParkShare] Starting Python FastAPI server on http://127.0.0.1:8000")
    print("[ParkShare] Interactive Swagger Documentation: http://127.0.0.1:8000/docs")
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
