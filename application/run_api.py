#!/usr/bin/env python3
"""
Simple script to run the FastAPI server
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "brewing.api:app",
        host="0.0.0.0",
        port=9680,
        reload=True,  # Enable auto-reload for development
        log_level="info",
    )
