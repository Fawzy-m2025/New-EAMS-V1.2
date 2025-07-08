#!/usr/bin/env python3
"""
Enhanced Predictive Analytics Backend Startup Script

This script starts the FastAPI backend server with proper configuration,
health checks, and monitoring setup.

Usage:
    python start_backend.py [--host HOST] [--port PORT] [--reload]
"""

import os
import sys
import argparse
import logging
import uvicorn
from pathlib import Path

# Add the services directory to Python path
sys.path.insert(0, str(Path(__file__).parent / "src" / "services"))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/backend.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

def check_dependencies():
    """Check if all required dependencies are available"""
    required_packages = [
        'fastapi',
        'uvicorn',
        'numpy',
        'pandas',
        'scipy',
        'scikit-learn',
        'redis',
        'celery'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        logger.error(f"Missing required packages: {', '.join(missing_packages)}")
        logger.error("Please install missing packages: pip install -r requirements.txt")
        return False
    
    logger.info("All required dependencies are available")
    return True

def check_environment():
    """Check environment configuration"""
    required_env_vars = [
        'DATABASE_URL',
        'REDIS_URL',
        'JWT_SECRET_KEY'
    ]
    
    missing_env_vars = []
    for var in required_env_vars:
        if not os.getenv(var):
            missing_env_vars.append(var)
    
    if missing_env_vars:
        logger.warning(f"Missing environment variables: {', '.join(missing_env_vars)}")
        logger.warning("Using default values for development")
        
        # Set default values for development
        os.environ.setdefault('DATABASE_URL', 'postgresql://localhost/eams_db')
        os.environ.setdefault('REDIS_URL', 'redis://localhost:6379')
        os.environ.setdefault('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
    
    logger.info("Environment configuration checked")

def create_directories():
    """Create necessary directories"""
    directories = [
        'logs',
        'data',
        'models',
        'reports'
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
    
    logger.info("Directories created/verified")

def health_check():
    """Perform health checks"""
    try:
        import redis
        from sqlalchemy import create_engine
        
        # Check Redis connection
        redis_client = redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379'))
        redis_client.ping()
        logger.info("Redis connection: OK")
        
        # Check database connection
        engine = create_engine(os.getenv('DATABASE_URL', 'postgresql://localhost/eams_db'))
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        logger.info("Database connection: OK")
        
        return True
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return False

def main():
    """Main startup function"""
    parser = argparse.ArgumentParser(description='Start Enhanced Predictive Analytics Backend')
    parser.add_argument('--host', default='0.0.0.0', help='Host to bind to')
    parser.add_argument('--port', type=int, default=8000, help='Port to bind to')
    parser.add_argument('--reload', action='store_true', help='Enable auto-reload')
    parser.add_argument('--workers', type=int, default=1, help='Number of worker processes')
    parser.add_argument('--log-level', default='info', help='Log level')
    
    args = parser.parse_args()
    
    logger.info("Starting Enhanced Predictive Analytics Backend...")
    
    # Pre-startup checks
    if not check_dependencies():
        sys.exit(1)
    
    check_environment()
    create_directories()
    
    if not health_check():
        logger.warning("Health checks failed, but continuing startup...")
    
    # Start the server
    try:
        uvicorn.run(
            "src.services.python.api_endpoints:app",
            host=args.host,
            port=args.port,
            reload=args.reload,
            workers=args.workers,
            log_level=args.log_level,
            access_log=True
        )
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server startup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 