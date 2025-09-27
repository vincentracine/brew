import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "brewing.api:app",
        host="0.0.0.0",
        port=9680,
        reload=True,
        log_level="info",
    )
