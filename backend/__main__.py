import uvicorn

if __name__ == "__main__":
    print("🚀 Starting ParkShare Python FastAPI server on http://127.0.0.1:8000")
    print("📖 Interactive OpenAPI / Swagger Docs at: http://127.0.0.1:8000/docs")
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
