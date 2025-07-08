"""
Background Tasks for Enhanced Predictive Analytics

This module implements background tasks for:
- Equipment health score calculations
- Maintenance schedule optimization
- Real-time data processing
- Report generation
- Data quality monitoring

Standards Compliance:
- ISO 55001 asset management
- CRE reliability engineering standards
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import numpy as np
import pandas as pd
from celery import shared_task
from sqlalchemy import create_engine, text
from redis import Redis

# Import our services
from ml_pipeline_service import RULPredictor, AnomalyDetector
from reliability_engine import WeibullAnalysis, RCFAAnalysis

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database and Redis connections
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost/eams_db")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

engine = create_engine(DATABASE_URL)
redis_client = Redis.from_url(REDIS_URL, decode_responses=True)

@shared_task(bind=True, max_retries=3)
def calculate_equipment_health_scores(self) -> Dict[str, Any]:
    """
    Calculate health scores for all equipment based on:
    - Vibration analysis
    - Temperature monitoring
    - Operating hours
    - Maintenance history
    - Failure predictions
    """
    try:
        logger.info("Starting equipment health score calculation")
        
        # Get equipment data from database
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT id, name, category, manufacturer, 
                       operating_hours, last_maintenance_date,
                       vibration_rms, temperature, pressure
                FROM equipment 
                WHERE status = 'operational'
            """))
            equipment_data = [dict(row) for row in result]
        
        health_scores = []
        
        for equipment in equipment_data:
            # Calculate health score components
            vibration_score = calculate_vibration_health(equipment.get('vibration_rms', 0))
            temperature_score = calculate_temperature_health(equipment.get('temperature', 0))
            age_score = calculate_age_health(equipment.get('operating_hours', 0))
            maintenance_score = calculate_maintenance_health(equipment.get('last_maintenance_date'))
            
            # Weighted health score (0-100)
            health_score = (
                vibration_score * 0.3 +
                temperature_score * 0.25 +
                age_score * 0.25 +
                maintenance_score * 0.2
            )
            
            # Determine health status
            if health_score >= 90:
                status = "excellent"
            elif health_score >= 80:
                status = "good"
            elif health_score >= 70:
                status = "fair"
            elif health_score >= 60:
                status = "poor"
            else:
                status = "critical"
            
            health_scores.append({
                "equipment_id": equipment['id'],
                "health_score": round(health_score, 2),
                "status": status,
                "components": {
                    "vibration": vibration_score,
                    "temperature": temperature_score,
                    "age": age_score,
                    "maintenance": maintenance_score
                },
                "timestamp": datetime.utcnow().isoformat()
            })
        
        # Store health scores in Redis for real-time access
        redis_client.setex(
            "equipment_health_scores",
            3600,  # 1 hour cache
            json.dumps(health_scores)
        )
        
        # Update database
        with engine.connect() as conn:
            for score in health_scores:
                conn.execute(text("""
                    UPDATE equipment 
                    SET health_score = :health_score, 
                        health_status = :status,
                        health_updated_at = :timestamp
                    WHERE id = :equipment_id
                """), score)
            conn.commit()
        
        logger.info(f"Calculated health scores for {len(health_scores)} equipment")
        return {"status": "success", "count": len(health_scores)}
        
    except Exception as exc:
        logger.error(f"Health score calculation failed: {exc}")
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
        return {"status": "error", "message": str(exc)}

@shared_task(bind=True, max_retries=3)
def optimize_maintenance_schedule(self) -> Dict[str, Any]:
    """
    Optimize maintenance schedule based on:
    - Equipment health scores
    - RUL predictions
    - Resource availability
    - Cost optimization
    """
    try:
        logger.info("Starting maintenance schedule optimization")
        
        # Get equipment requiring maintenance
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT id, name, category, health_score, 
                       last_maintenance_date, next_maintenance_date,
                       criticality, estimated_rul
                FROM equipment 
                WHERE health_score < 80 OR 
                      next_maintenance_date <= :next_week
            """), {"next_week": datetime.utcnow() + timedelta(days=7)})
            equipment_list = [dict(row) for row in result]
        
        optimized_schedule = []
        
        for equipment in equipment_list:
            # Calculate maintenance priority
            priority = calculate_maintenance_priority(equipment)
            
            # Determine optimal maintenance date
            optimal_date = calculate_optimal_maintenance_date(equipment)
            
            # Estimate duration and cost
            duration, cost = estimate_maintenance_requirements(equipment)
            
            optimized_schedule.append({
                "equipment_id": equipment['id'],
                "equipment_name": equipment['name'],
                "priority": priority,
                "scheduled_date": optimal_date.isoformat(),
                "estimated_duration": duration,
                "estimated_cost": cost,
                "maintenance_type": determine_maintenance_type(equipment),
                "risk_reduction": calculate_risk_reduction(equipment)
            })
        
        # Sort by priority and resource constraints
        optimized_schedule.sort(key=lambda x: x['priority'], reverse=True)
        
        # Store optimized schedule
        redis_client.setex(
            "optimized_maintenance_schedule",
            86400,  # 24 hours cache
            json.dumps(optimized_schedule)
        )
        
        logger.info(f"Optimized maintenance schedule for {len(optimized_schedule)} equipment")
        return {"status": "success", "schedule": optimized_schedule}
        
    except Exception as exc:
        logger.error(f"Maintenance optimization failed: {exc}")
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
        return {"status": "error", "message": str(exc)}

@shared_task(bind=True, max_retries=3)
def process_real_time_data(self) -> Dict[str, Any]:
    """
    Process real-time sensor data for:
    - Anomaly detection
    - Trend analysis
    - Alert generation
    - Data quality checks
    """
    try:
        logger.info("Processing real-time sensor data")
        
        # Get latest sensor data
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT equipment_id, sensor_type, value, timestamp
                FROM sensor_data 
                WHERE timestamp >= :start_time
                ORDER BY timestamp DESC
            """), {"start_time": datetime.utcnow() - timedelta(minutes=10)})
            sensor_data = [dict(row) for row in result]
        
        processed_data = []
        anomalies = []
        
        # Group data by equipment
        equipment_data = {}
        for data in sensor_data:
            if data['equipment_id'] not in equipment_data:
                equipment_data[data['equipment_id']] = []
            equipment_data[data['equipment_id']].append(data)
        
        # Process each equipment's data
        for equipment_id, data_list in equipment_data.items():
            # Detect anomalies
            anomaly_result = detect_anomalies_in_data(equipment_id, data_list)
            if anomaly_result['is_anomaly']:
                anomalies.append(anomaly_result)
            
            # Calculate trends
            trends = calculate_data_trends(data_list)
            
            # Update processed data
            processed_data.append({
                "equipment_id": equipment_id,
                "anomalies": anomaly_result,
                "trends": trends,
                "timestamp": datetime.utcnow().isoformat()
            })
        
        # Store processed data
        redis_client.setex(
            "processed_sensor_data",
            300,  # 5 minutes cache
            json.dumps(processed_data)
        )
        
        # Generate alerts for anomalies
        if anomalies:
            generate_anomaly_alerts(anomalies)
        
        logger.info(f"Processed data for {len(equipment_data)} equipment, found {len(anomalies)} anomalies")
        return {"status": "success", "processed": len(processed_data), "anomalies": len(anomalies)}
        
    except Exception as exc:
        logger.error(f"Real-time data processing failed: {exc}")
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
        return {"status": "error", "message": str(exc)}

@shared_task(bind=True, max_retries=3)
def generate_monthly_reports(self) -> Dict[str, Any]:
    """
    Generate comprehensive monthly reports:
    - Equipment performance summary
    - Maintenance effectiveness
    - Reliability metrics
    - Cost analysis
    - Recommendations
    """
    try:
        logger.info("Generating monthly reports")
        
        report_date = datetime.utcnow()
        month_start = report_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Collect monthly data
        with engine.connect() as conn:
            # Equipment performance
            performance_result = conn.execute(text("""
                SELECT category, 
                       AVG(health_score) as avg_health,
                       COUNT(*) as total_equipment,
                       COUNT(CASE WHEN health_score < 60 THEN 1 END) as critical_count
                FROM equipment 
                WHERE health_updated_at >= :month_start
                GROUP BY category
            """), {"month_start": month_start})
            performance_data = [dict(row) for row in performance_result]
            
            # Maintenance activities
            maintenance_result = conn.execute(text("""
                SELECT maintenance_type,
                       COUNT(*) as count,
                       AVG(duration_hours) as avg_duration,
                       SUM(cost) as total_cost
                FROM maintenance_activities 
                WHERE completed_date >= :month_start
                GROUP BY maintenance_type
            """), {"month_start": month_start})
            maintenance_data = [dict(row) for row in maintenance_result]
            
            # Reliability metrics
            reliability_result = conn.execute(text("""
                SELECT equipment_id,
                       AVG(estimated_rul) as avg_rul,
                       COUNT(CASE WHEN anomaly_detected THEN 1 END) as anomaly_count
                FROM reliability_data 
                WHERE timestamp >= :month_start
                GROUP BY equipment_id
            """), {"month_start": month_start})
            reliability_data = [dict(row) for row in reliability_result]
        
        # Generate report
        report = {
            "report_period": {
                "start": month_start.isoformat(),
                "end": report_date.isoformat()
            },
            "equipment_performance": performance_data,
            "maintenance_summary": maintenance_data,
            "reliability_metrics": reliability_data,
            "key_insights": generate_key_insights(performance_data, maintenance_data, reliability_data),
            "recommendations": generate_recommendations(performance_data, maintenance_data, reliability_data),
            "generated_at": report_date.isoformat()
        }
        
        # Store report
        report_key = f"monthly_report_{report_date.strftime('%Y_%m')}"
        redis_client.setex(report_key, 2592000, json.dumps(report))  # 30 days cache
        
        # Save to database
        with engine.connect() as conn:
            conn.execute(text("""
                INSERT INTO monthly_reports (report_data, generated_at)
                VALUES (:report_data, :generated_at)
            """), {
                "report_data": json.dumps(report),
                "generated_at": report_date
            })
            conn.commit()
        
        logger.info("Monthly report generated successfully")
        return {"status": "success", "report_key": report_key}
        
    except Exception as exc:
        logger.error(f"Monthly report generation failed: {exc}")
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
        return {"status": "error", "message": str(exc)}

@shared_task(bind=True, max_retries=3)
def check_data_quality(self) -> Dict[str, Any]:
    """
    Check data quality for:
    - Missing data
    - Outliers
    - Data consistency
    - Sensor calibration
    """
    try:
        logger.info("Checking data quality")
        
        # Get recent sensor data
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT equipment_id, sensor_type, value, timestamp
                FROM sensor_data 
                WHERE timestamp >= :start_time
            """), {"start_time": datetime.utcnow() - timedelta(hours=1)})
            sensor_data = [dict(row) for row in result]
        
        quality_issues = []
        
        # Check for missing data
        missing_data = check_missing_data(sensor_data)
        if missing_data:
            quality_issues.extend(missing_data)
        
        # Check for outliers
        outliers = check_outliers(sensor_data)
        if outliers:
            quality_issues.extend(outliers)
        
        # Check for data consistency
        consistency_issues = check_data_consistency(sensor_data)
        if consistency_issues:
            quality_issues.extend(consistency_issues)
        
        # Store quality report
        quality_report = {
            "timestamp": datetime.utcnow().isoformat(),
            "total_data_points": len(sensor_data),
            "quality_issues": quality_issues,
            "quality_score": calculate_quality_score(sensor_data, quality_issues)
        }
        
        redis_client.setex(
            "data_quality_report",
            1800,  # 30 minutes cache
            json.dumps(quality_report)
        )
        
        logger.info(f"Data quality check completed: {len(quality_issues)} issues found")
        return {"status": "success", "issues": len(quality_issues), "score": quality_report["quality_score"]}
        
    except Exception as exc:
        logger.error(f"Data quality check failed: {exc}")
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
        return {"status": "error", "message": str(exc)}

# Helper functions
def calculate_vibration_health(vibration_rms: float) -> float:
    """Calculate health score based on vibration levels"""
    if vibration_rms < 2.8:
        return 100
    elif vibration_rms < 4.5:
        return 85
    elif vibration_rms < 7.1:
        return 70
    elif vibration_rms < 11.2:
        return 50
    else:
        return 20

def calculate_temperature_health(temperature: float) -> float:
    """Calculate health score based on temperature"""
    if temperature < 60:
        return 100
    elif temperature < 75:
        return 90
    elif temperature < 85:
        return 75
    elif temperature < 95:
        return 60
    else:
        return 30

def calculate_age_health(operating_hours: float) -> float:
    """Calculate health score based on operating hours"""
    years = operating_hours / 8760
    if years < 5:
        return 100
    elif years < 10:
        return 85
    elif years < 15:
        return 70
    elif years < 20:
        return 55
    else:
        return 40

def calculate_maintenance_health(last_maintenance_date: Optional[str]) -> float:
    """Calculate health score based on maintenance history"""
    if not last_maintenance_date:
        return 50
    
    last_maintenance = datetime.fromisoformat(last_maintenance_date)
    days_since_maintenance = (datetime.utcnow() - last_maintenance).days
    
    if days_since_maintenance < 30:
        return 100
    elif days_since_maintenance < 90:
        return 85
    elif days_since_maintenance < 180:
        return 70
    elif days_since_maintenance < 365:
        return 55
    else:
        return 40

def calculate_maintenance_priority(equipment: Dict[str, Any]) -> float:
    """Calculate maintenance priority score"""
    health_score = equipment.get('health_score', 100)
    criticality = equipment.get('criticality', 1)
    days_to_maintenance = 0
    
    if equipment.get('next_maintenance_date'):
        next_maintenance = datetime.fromisoformat(equipment['next_maintenance_date'])
        days_to_maintenance = (next_maintenance - datetime.utcnow()).days
    
    # Priority formula: (100 - health_score) * criticality * urgency_factor
    urgency_factor = max(1, 30 / max(1, days_to_maintenance))
    priority = (100 - health_score) * criticality * urgency_factor
    
    return priority

def calculate_optimal_maintenance_date(equipment: Dict[str, Any]) -> datetime:
    """Calculate optimal maintenance date"""
    current_date = datetime.utcnow()
    health_score = equipment.get('health_score', 100)
    
    # Base maintenance interval (days)
    base_interval = 90
    
    # Adjust based on health score
    if health_score < 60:
        interval = 7  # Critical - immediate
    elif health_score < 70:
        interval = 14  # Poor - soon
    elif health_score < 80:
        interval = 30  # Fair - moderate
    else:
        interval = base_interval  # Good - normal
    
    return current_date + timedelta(days=interval)

def estimate_maintenance_requirements(equipment: Dict[str, Any]) -> tuple:
    """Estimate maintenance duration and cost"""
    category = equipment.get('category', 'other')
    health_score = equipment.get('health_score', 100)
    
    # Base estimates
    base_duration = {
        'pump': 8,
        'motor': 6,
        'compressor': 12,
        'valve': 4,
        'other': 6
    }.get(category, 6)
    
    base_cost = {
        'pump': 2000,
        'motor': 1500,
        'compressor': 5000,
        'valve': 800,
        'other': 1000
    }.get(category, 1000)
    
    # Adjust based on health score
    health_factor = max(0.5, health_score / 100)
    duration = base_duration * (2 - health_factor)
    cost = base_cost * (1.5 - health_factor * 0.5)
    
    return round(duration, 1), round(cost, 2)

def determine_maintenance_type(equipment: Dict[str, Any]) -> str:
    """Determine maintenance type based on equipment condition"""
    health_score = equipment.get('health_score', 100)
    
    if health_score < 60:
        return "emergency"
    elif health_score < 70:
        return "corrective"
    elif health_score < 80:
        return "predictive"
    else:
        return "preventive"

def calculate_risk_reduction(equipment: Dict[str, Any]) -> float:
    """Calculate risk reduction percentage after maintenance"""
    health_score = equipment.get('health_score', 100)
    
    if health_score < 60:
        return 80  # High risk reduction for critical equipment
    elif health_score < 70:
        return 60
    elif health_score < 80:
        return 40
    else:
        return 20

def detect_anomalies_in_data(equipment_id: str, data_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Detect anomalies in sensor data"""
    # Simple anomaly detection based on statistical thresholds
    values = [d['value'] for d in data_list]
    mean_val = np.mean(values)
    std_val = np.std(values)
    
    # Check for values beyond 3 standard deviations
    anomalies = [v for v in values if abs(v - mean_val) > 3 * std_val]
    
    return {
        "equipment_id": equipment_id,
        "is_anomaly": len(anomalies) > 0,
        "anomaly_count": len(anomalies),
        "severity": "high" if len(anomalies) > 2 else "medium" if len(anomalies) > 0 else "low"
    }

def calculate_data_trends(data_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate trends in sensor data"""
    values = [d['value'] for d in data_list]
    timestamps = [datetime.fromisoformat(d['timestamp']) for d in data_list]
    
    if len(values) < 2:
        return {"trend": "insufficient_data"}
    
    # Calculate trend (positive = increasing, negative = decreasing)
    trend_slope = np.polyfit(range(len(values)), values, 1)[0]
    
    return {
        "trend": "increasing" if trend_slope > 0 else "decreasing" if trend_slope < 0 else "stable",
        "slope": trend_slope,
        "data_points": len(values)
    }

def generate_anomaly_alerts(anomalies: List[Dict[str, Any]]) -> None:
    """Generate alerts for detected anomalies"""
    for anomaly in anomalies:
        if anomaly['is_anomaly']:
            alert = {
                "type": "anomaly_detection",
                "equipment_id": anomaly['equipment_id'],
                "severity": anomaly['severity'],
                "timestamp": datetime.utcnow().isoformat(),
                "message": f"Anomaly detected in equipment {anomaly['equipment_id']}"
            }
            
            # Store alert in Redis
            redis_client.lpush("alerts", json.dumps(alert))
            redis_client.ltrim("alerts", 0, 999)  # Keep last 1000 alerts

def generate_key_insights(performance_data: List[Dict], maintenance_data: List[Dict], reliability_data: List[Dict]) -> List[str]:
    """Generate key insights from monthly data"""
    insights = []
    
    # Performance insights
    critical_equipment = sum(1 for p in performance_data if p['critical_count'] > 0)
    if critical_equipment > 0:
        insights.append(f"{critical_equipment} equipment categories have critical health issues")
    
    # Maintenance insights
    total_maintenance_cost = sum(m['total_cost'] for m in maintenance_data)
    insights.append(f"Total maintenance cost: ${total_maintenance_cost:,.2f}")
    
    # Reliability insights
    avg_rul = np.mean([r['avg_rul'] for r in reliability_data if r['avg_rul']])
    insights.append(f"Average remaining useful life: {avg_rul:.1f} hours")
    
    return insights

def generate_recommendations(performance_data: List[Dict], maintenance_data: List[Dict], reliability_data: List[Dict]) -> List[str]:
    """Generate recommendations based on monthly data"""
    recommendations = []
    
    # Performance recommendations
    for performance in performance_data:
        if performance['critical_count'] > 0:
            recommendations.append(f"Immediate attention required for {performance['category']} equipment")
    
    # Maintenance recommendations
    preventive_count = sum(1 for m in maintenance_data if m['maintenance_type'] == 'preventive')
    if preventive_count < len(maintenance_data) * 0.7:
        recommendations.append("Increase preventive maintenance activities")
    
    # Reliability recommendations
    low_rul_equipment = [r for r in reliability_data if r['avg_rul'] and r['avg_rul'] < 1000]
    if low_rul_equipment:
        recommendations.append("Plan replacement for equipment with low remaining useful life")
    
    return recommendations

def check_missing_data(sensor_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Check for missing sensor data"""
    issues = []
    equipment_sensors = {}
    
    # Group by equipment and sensor type
    for data in sensor_data:
        key = (data['equipment_id'], data['sensor_type'])
        if key not in equipment_sensors:
            equipment_sensors[key] = []
        equipment_sensors[key].append(data)
    
    # Check for gaps in data
    for (equipment_id, sensor_type), data_list in equipment_sensors.items():
        if len(data_list) < 10:  # Less than 10 readings in the last hour
            issues.append({
                "type": "missing_data",
                "equipment_id": equipment_id,
                "sensor_type": sensor_type,
                "severity": "medium"
            })
    
    return issues

def check_outliers(sensor_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Check for statistical outliers"""
    issues = []
    equipment_sensors = {}
    
    # Group by equipment and sensor type
    for data in sensor_data:
        key = (data['equipment_id'], data['sensor_type'])
        if key not in equipment_sensors:
            equipment_sensors[key] = []
        equipment_sensors[key].append(data['value'])
    
    # Check for outliers using IQR method
    for (equipment_id, sensor_type), values in equipment_sensors.items():
        if len(values) >= 4:
            q1 = np.percentile(values, 25)
            q3 = np.percentile(values, 75)
            iqr = q3 - q1
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            
            outliers = [v for v in values if v < lower_bound or v > upper_bound]
            if outliers:
                issues.append({
                    "type": "outlier",
                    "equipment_id": equipment_id,
                    "sensor_type": sensor_type,
                    "outlier_count": len(outliers),
                    "severity": "low"
                })
    
    return issues

def check_data_consistency(sensor_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Check for data consistency issues"""
    issues = []
    
    # Check for duplicate timestamps
    timestamps = [(d['equipment_id'], d['sensor_type'], d['timestamp']) for d in sensor_data]
    duplicates = len(timestamps) - len(set(timestamps))
    
    if duplicates > 0:
        issues.append({
            "type": "duplicate_data",
            "duplicate_count": duplicates,
            "severity": "low"
        })
    
    return issues

def calculate_quality_score(sensor_data: List[Dict[str, Any]], issues: List[Dict[str, Any]]) -> float:
    """Calculate overall data quality score"""
    if not sensor_data:
        return 0.0
    
    # Base score
    base_score = 100.0
    
    # Deduct points for issues
    for issue in issues:
        if issue['type'] == 'missing_data':
            base_score -= 10
        elif issue['type'] == 'outlier':
            base_score -= 5
        elif issue['type'] == 'duplicate_data':
            base_score -= 2
    
    return max(0.0, base_score) 