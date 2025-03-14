"""
Script to run the Smart AI Financial Analyzer application
"""
import uvicorn
import os

if __name__ == "__main__":
    # Get port from environment or use default (8000)
    port = int(os.environ.get("PORT", 8000))
    
    # Run the application with hot reload for development
    uvicorn.run(
        "app:app", 
        host="0.0.0.0",  # Bind to all interfaces for network access
        port=port,
        reload=True      # Enable hot reload for development
    )