"""
Celery Configuration for Background Tasks

This module configures Celery for handling background tasks in the predictive analytics system:
- Model training and retraining
- Data processing and feature engineering
- Scheduled maintenance calculations
- Real-time data analysis
- Report generation

Standards Compliance:
- ISO 55001 asset management
- CRE reliability engineering standards
"""

import os
from celery import Celery
from celery.schedules import crontab
from typing import Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Celery configuration
celery_app = Celery(
    "enhanced_predictive_analytics",
    broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    include=[
        "services.ml_pipeline_service",
        "services.reliability_engine",
        "services.background_tasks"
    ]
)

# Celery settings
celery_app.conf.update(
    # Task routing
    task_routes={
        "services.ml_pipeline_service.*": {"queue": "ml_tasks"},
        "services.reliability_engine.*": {"queue": "reliability_tasks"},
        "services.background_tasks.*": {"queue": "background_tasks"},
    },
    
    # Task serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    # Task execution
    task_always_eager=False,
    task_eager_propagates=True,
    task_ignore_result=False,
    task_store_errors_even_if_ignored=True,
    
    # Worker settings
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    worker_disable_rate_limits=False,
    
    # Result backend settings
    result_expires=3600,  # 1 hour
    result_persistent=True,
    
    # Beat schedule for periodic tasks
    beat_schedule={
        # Daily model retraining
        "retrain-models-daily": {
            "task": "services.ml_pipeline_service.retrain_all_models",
            "schedule": crontab(hour=2, minute=0),  # 2 AM daily
            "args": (),
        },
        
        # Hourly health score calculation
        "calculate-health-scores": {
            "task": "services.background_tasks.calculate_equipment_health_scores",
            "schedule": crontab(minute=0),  # Every hour
            "args": (),
        },
        
        # Daily reliability analysis
        "daily-reliability-analysis": {
            "task": "services.reliability_engine.daily_reliability_analysis",
            "schedule": crontab(hour=6, minute=0),  # 6 AM daily
            "args": (),
        },
        
        # Weekly maintenance optimization
        "weekly-maintenance-optimization": {
            "task": "services.background_tasks.optimize_maintenance_schedule",
            "schedule": crontab(day_of_week=1, hour=8, minute=0),  # Monday 8 AM
            "args": (),
        },
        
        # Monthly report generation
        "monthly-reports": {
            "task": "services.background_tasks.generate_monthly_reports",
            "schedule": crontab(day=1, hour=9, minute=0),  # 1st of month 9 AM
            "args": (),
        },
        
        # Real-time data processing (every 5 minutes)
        "process-real-time-data": {
            "task": "services.background_tasks.process_real_time_data",
            "schedule": crontab(minute="*/5"),  # Every 5 minutes
            "args": (),
        },
        
        # Anomaly detection (every 15 minutes)
        "detect-anomalies": {
            "task": "services.ml_pipeline_service.detect_anomalies_batch",
            "schedule": crontab(minute="*/15"),  # Every 15 minutes
            "args": (),
        },
        
        # Data quality checks (every 30 minutes)
        "data-quality-check": {
            "task": "services.background_tasks.check_data_quality",
            "schedule": crontab(minute="*/30"),  # Every 30 minutes
            "args": (),
        },
    },
    
    # Task retry settings
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_remote_tracebacks=True,
    
    # Monitoring
    worker_send_task_events=True,
    task_send_sent_event=True,
)

# Task error handling
@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def handle_task_failure(self, exc, task_id, args, kwargs, einfo):
    """Handle task failures with retry logic"""
    logger.error(f"Task {task_id} failed: {exc}")
    
    if self.request.retries < self.max_retries:
        logger.info(f"Retrying task {task_id} (attempt {self.request.retries + 1})")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
    else:
        logger.error(f"Task {task_id} failed permanently after {self.max_retries} retries")
        # Send notification to administrators
        # notify_admin_task_failure(task_id, exc, args, kwargs)

# Health check task
@celery_app.task
def health_check() -> Dict[str, Any]:
    """Health check for Celery workers"""
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z",
        "workers": "active",
        "queues": "operational"
    }

# Task monitoring
@celery_app.task
def monitor_task_queue() -> Dict[str, Any]:
    """Monitor task queue status"""
    inspector = celery_app.control.inspect()
    
    active_tasks = inspector.active()
    reserved_tasks = inspector.reserved()
    registered_tasks = inspector.registered()
    
    return {
        "active_tasks": active_tasks,
        "reserved_tasks": reserved_tasks,
        "registered_tasks": registered_tasks,
        "timestamp": "2024-01-01T00:00:00Z"
    }

if __name__ == "__main__":
    celery_app.start() 