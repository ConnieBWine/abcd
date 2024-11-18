# run.py
import uvicorn
import logging
import os
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    try:
        logger.info("Loading environment variables...")
        load_dotenv()
        
        host = os.getenv("API_HOST", "127.0.0.1")
        port = int(os.getenv("API_PORT", 8000))
        
        logger.info(f"Starting FastAPI server on {host}:{port}")
        
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            reload=True,
            log_level="info",
            access_log=True
        )
    except Exception as e:
        logger.error(f"Failed to start server: {e}", exc_info=True)