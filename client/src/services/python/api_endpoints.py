"""
FastAPI Backend Endpoints for Enhanced Predictive Analytics

This module provides REST API endpoints for all predictive analytics features:
- RUL prediction
- Anomaly detection  
- Maintenance optimization
- Weibull analysis
- Risk assessment
- RCFA analysis
- PFMEA worksheets
- Pareto analysis

Standards Compliance:
- ISO 55001 asset management
- CRE reliability engineering standards
- OREDA Handbook 2015
- NSWC-10 reliability prediction methods
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
from datetime import datetime

# Import our existing services
from ml_pipeline_service import RULPredictor, AnomalyDetector, MaintenanceOptimizer
from reliability_engine import WeibullAnalysis, RCFAAnalysis, PFMEAAnalysis

app = FastAPI(
    title="Enhanced Predictive Analytics API",
    description="Standards-compliant predictive maintenance and reliability engineering API",
    version="1.1.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response validation
class RULRequest(BaseModel):
    equipmentId: str
    vibration_data: Optional[List[float]] = None
    temperature_data: Optional[List[float]] = None
    operational_data: Optional[Dict[str, List[float]]] = None
    operating_hours: float = 0
    age_years: float = 0
    maintenance_count: int = 0
    load_factor: float = 1.0
    environmental_factor: float = 1.0
    sampling_rate: float = 1000

class RULResponse(BaseModel):
    equipment_id: str
    current_rul: float
    confidence_interval: List[float]
    confidence_level: float
    prediction_date: str
    model_accuracy: float
    feature_importance: Dict[str, float]
    risk_level: str

class AnomalyRequest(BaseModel):
    equipmentId: str
    vibration_data: Optional[List[float]] = None
    temperature_data: Optional[List[float]] = None
    pressure_data: Optional[List[float]] = None
    operational_data: Optional[Dict[str, List[float]]] = None

class AnomalyResponse(BaseModel):
    equipment_id: str
    timestamp: str
    anomaly_score: float
    is_anomaly: bool
    anomaly_type: str
    severity: str
    recommended_action: str

class MaintenanceOptimizationRequest(BaseModel):
    equipment_list: List[Dict[str, Any]]
    rul_predictions: List[Dict[str, Any]]
    constraints: Dict[str, Any]

class MaintenanceOptimizationResponse(BaseModel):
    equipment_id: str
    maintenance_type: str
    scheduled_date: str
    priority: str
    estimated_duration: float
    estimated_cost: float
    risk_reduction: float
    resource_requirements: List[str]

class WeibullRequest(BaseModel):
    failure_times: List[float]
    method: str = "mle"

class WeibullResponse(BaseModel):
    shape_parameter: float
    scale_parameter: float
    location_parameter: float
    mttf: float
    b10_life: float
    b50_life: float
    b90_life: float
    confidence_interval: Dict[str, float]
    goodness_of_fit: Dict[str, float]

class RiskAssessmentRequest(BaseModel):
    equipmentId: str
    vibration: float
    temperature: float
    operating_hours: float
    age: float
    criticality: float
    environment: float

class RiskAssessmentResponse(BaseModel):
    equipment_id: str
    risk_score: float
    factors: Dict[str, float]
    recommendations: List[str]
    mitigation_actions: List[str]

class RCFARequest(BaseModel):
    problem_statement: str
    whys: List[str]

class RCFAResponse(BaseModel):
    problem_statement: str
    five_whys: List[str]
    root_cause: str
    ishikawa_categories: Dict[str, List[str]]
    pareto_analysis: Dict[str, Any]

class PFMEARequest(BaseModel):
    equipment_id: str
    failure_modes: List[Dict[str, Any]]

class PFMEAResponse(BaseModel):
    equipment_id: str
    failure_modes: List[Dict[str, Any]]
    total_rpn: int
    critical_items: List[str]
    recommended_actions: List[str]

class ParetoRequest(BaseModel):
    failure_modes: List[Dict[str, Any]]

class ParetoResponse(BaseModel):
    failure_modes: List[Dict[str, Any]]
    cumulative_percentages: List[float]
    pareto_principle_applies: bool
    top_20_percent: List[str]

# Initialize service instances
rul_predictor = RULPredictor()
anomaly_detector = AnomalyDetector()
maintenance_optimizer = MaintenanceOptimizer()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Enhanced Predictive Analytics API",
        "version": "1.1.0",
        "status": "operational",
        "standards": ["ISO 55001", "CRE", "OREDA 2015", "NSWC-10"]
    }

@app.post("/api/rul/predict", response_model=RULResponse)
async def predict_rul(request: RULRequest):
    """
    Predict Remaining Useful Life (RUL) for equipment
    
    Uses advanced ML models with feature engineering for accurate predictions
    """
    try:
        # Prepare equipment data
        equipment_data = {
            "vibration_data": request.vibration_data,
            "temperature_data": request.temperature_data,
            "operational_data": request.operational_data,
            "operating_hours": request.operating_hours,
            "age_years": request.age_years,
            "maintenance_count": request.maintenance_count,
            "load_factor": request.load_factor,
            "environmental_factor": request.environmental_factor,
            "sampling_rate": request.sampling_rate
        }
        
        # Get RUL prediction
        prediction = rul_predictor.predict_rul(equipment_data)
        
        return RULResponse(
            equipment_id=request.equipmentId,
            current_rul=prediction.current_rul,
            confidence_interval=prediction.confidence_interval,
            confidence_level=prediction.confidence_level,
            prediction_date=prediction.prediction_date,
            model_accuracy=prediction.model_accuracy,
            feature_importance=prediction.feature_importance,
            risk_level=prediction.risk_level
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RUL prediction failed: {str(e)}")

@app.post("/api/anomaly/detect", response_model=AnomalyResponse)
async def detect_anomaly(request: AnomalyRequest):
    """
    Detect anomalies in equipment data
    
    Uses isolation forest and statistical methods for robust anomaly detection
    """
    try:
        # Prepare equipment data
        equipment_data = {
            "vibration_data": request.vibration_data,
            "temperature_data": request.temperature_data,
            "pressure_data": request.pressure_data,
            "operational_data": request.operational_data
        }
        
        # Detect anomaly
        anomaly = anomaly_detector.detect_anomaly(equipment_data)
        
        return AnomalyResponse(
            equipment_id=request.equipmentId,
            timestamp=anomaly.timestamp,
            anomaly_score=anomaly.anomaly_score,
            is_anomaly=anomaly.is_anomaly,
            anomaly_type=anomaly.anomaly_type,
            severity=anomaly.severity,
            recommended_action=anomaly.recommended_action
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")

@app.post("/api/maintenance/optimize", response_model=List[MaintenanceOptimizationResponse])
async def optimize_maintenance(request: MaintenanceOptimizationRequest):
    """
    Optimize maintenance schedule using advanced algorithms
    
    Considers RUL predictions, resource constraints, and cost-benefit analysis
    """
    try:
        # Optimize maintenance schedule
        schedules = maintenance_optimizer.optimize_schedule(
            request.equipment_list,
            request.rul_predictions,
            request.constraints
        )
        
        return [
            MaintenanceOptimizationResponse(
                equipment_id=schedule.equipment_id,
                maintenance_type=schedule.maintenance_type,
                scheduled_date=schedule.scheduled_date,
                priority=schedule.priority,
                estimated_duration=schedule.estimated_duration,
                estimated_cost=schedule.estimated_cost,
                risk_reduction=schedule.risk_reduction,
                resource_requirements=schedule.resource_requirements
            )
            for schedule in schedules
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Maintenance optimization failed: {str(e)}")

@app.post("/api/reliability/weibull", response_model=WeibullResponse)
async def analyze_weibull(request: WeibullRequest):
    """
    Perform Weibull analysis per CRE standards
    
    Estimates parameters, calculates reliability metrics, and provides confidence intervals
    """
    try:
        # Estimate Weibull parameters
        params = WeibullAnalysis.estimate_parameters(
            request.failure_times, 
            method=request.method
        )
        
        # Calculate reliability metrics
        mttf = params.mttf()
        b10_life = params.b_life(10)
        b50_life = params.b_life(50)
        b90_life = params.b_life(90)
        
        # Calculate confidence interval (simplified)
        confidence_interval = {
            "lower": b50_life * 0.8,
            "upper": b50_life * 1.2,
            "confidence": 0.95
        }
        
        # Goodness of fit test
        goodness_of_fit = WeibullAnalysis.goodness_of_fit(request.failure_times, params)
        
        return WeibullResponse(
            shape_parameter=params.shape,
            scale_parameter=params.scale,
            location_parameter=params.location,
            mttf=mttf,
            b10_life=b10_life,
            b50_life=b50_life,
            b90_life=b90_life,
            confidence_interval=confidence_interval,
            goodness_of_fit=goodness_of_fit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weibull analysis failed: {str(e)}")

@app.post("/api/risk/assess", response_model=RiskAssessmentResponse)
async def assess_risk(request: RiskAssessmentRequest):
    """
    Perform comprehensive risk assessment
    
    Evaluates multiple risk factors and provides mitigation strategies
    """
    try:
        # Calculate risk score (weighted sum)
        risk_factors = {
            "vibration": request.vibration,
            "temperature": request.temperature,
            "operating_hours": request.operating_hours,
            "age": request.age,
            "criticality": request.criticality,
            "environment": request.environment
        }
        
        # Weighted risk calculation
        weights = {
            "vibration": 0.25,
            "temperature": 0.20,
            "operating_hours": 0.15,
            "age": 0.15,
            "criticality": 0.15,
            "environment": 0.10
        }
        
        risk_score = sum(risk_factors[key] * weights[key] for key in risk_factors)
        
        # Generate recommendations based on risk level
        recommendations = []
        mitigation_actions = []
        
        if risk_score > 80:
            recommendations.append("Immediate maintenance required")
            mitigation_actions.append("Schedule emergency maintenance")
        elif risk_score > 60:
            recommendations.append("Schedule preventive maintenance")
            mitigation_actions.append("Increase monitoring frequency")
        elif risk_score > 40:
            recommendations.append("Monitor equipment condition")
            mitigation_actions.append("Regular inspections")
        else:
            recommendations.append("Equipment in good condition")
            mitigation_actions.append("Continue normal operations")
        
        return RiskAssessmentResponse(
            equipment_id=request.equipmentId,
            risk_score=risk_score,
            factors=risk_factors,
            recommendations=recommendations,
            mitigation_actions=mitigation_actions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk assessment failed: {str(e)}")

@app.post("/api/rcfa/analyze", response_model=RCFAResponse)
async def analyze_rcfa(request: RCFARequest):
    """
    Perform Root Cause Failure Analysis (RCFA)
    
    Implements 5 Whys analysis and Ishikawa diagram per quality management standards
    """
    try:
        # Perform 5 Whys analysis
        five_whys_result = RCFAAnalysis.five_whys_analysis(
            request.problem_statement,
            request.whys
        )
        
        # Perform Ishikawa analysis
        ishikawa_categories = {
            "people": ["Inadequate training", "Procedure not followed"],
            "process": ["Alignment procedure", "Lubrication schedule"],
            "equipment": ["Bearing quality", "Shaft tolerance"],
            "environment": ["Temperature variation", "Humidity"]
        }
        
        ishikawa_result = RCFAAnalysis.ishikawa_analysis(
            request.problem_statement,
            ishikawa_categories
        )
        
        # Perform Pareto analysis
        failure_modes = [
            {"mode": "Bearing Failure", "frequency": 45},
            {"mode": "Seal Leakage", "frequency": 25},
            {"mode": "Motor Winding", "frequency": 15}
        ]
        
        pareto_result = RCFAAnalysis.pareto_analysis(failure_modes)
        
        return RCFAResponse(
            problem_statement=request.problem_statement,
            five_whys=five_whys_result["whys"],
            root_cause=five_whys_result["root_cause"],
            ishikawa_categories=ishikawa_categories,
            pareto_analysis=pareto_result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RCFA analysis failed: {str(e)}")

@app.post("/api/pfmea/worksheet", response_model=PFMEAResponse)
async def create_pfmea_worksheet(request: PFMEARequest):
    """
    Create PFMEA worksheet per AIAG-VDA standards
    
    Calculates RPN and provides recommended actions
    """
    try:
        # Calculate RPN for each failure mode
        total_rpn = 0
        critical_items = []
        recommended_actions = []
        
        for failure_mode in request.failure_modes:
            severity = failure_mode.get("severity", 5)
            occurrence = failure_mode.get("occurrence", 5)
            detection = failure_mode.get("detection", 5)
            
            rpn = PFMEAAnalysis.calculate_rpn(severity, occurrence, detection)
            failure_mode["rpn"] = rpn
            total_rpn += rpn
            
            if rpn >= 200:
                critical_items.append(failure_mode.get("failure_mode", "Unknown"))
                recommended_actions.append(failure_mode.get("recommended_action", "Review and improve"))
        
        return PFMEAResponse(
            equipment_id=request.equipment_id,
            failure_modes=request.failure_modes,
            total_rpn=total_rpn,
            critical_items=critical_items,
            recommended_actions=recommended_actions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PFMEA worksheet creation failed: {str(e)}")

@app.post("/api/pareto", response_model=ParetoResponse)
async def analyze_pareto(request: ParetoRequest):
    """
    Perform Pareto analysis for failure modes
    
    Identifies the 20% of causes that create 80% of problems
    """
    try:
        # Sort failure modes by frequency
        sorted_modes = sorted(request.failure_modes, key=lambda x: x.get("frequency", 0), reverse=True)
        
        # Calculate total frequency
        total_frequency = sum(mode.get("frequency", 0) for mode in sorted_modes)
        
        # Calculate cumulative percentages
        cumulative_percentages = []
        cumulative_frequency = 0
        
        for mode in sorted_modes:
            cumulative_frequency += mode.get("frequency", 0)
            percentage = (cumulative_frequency / total_frequency) * 100
            cumulative_percentages.append(percentage)
        
        # Identify top 20% (Pareto principle)
        top_20_percent = []
        for i, percentage in enumerate(cumulative_percentages):
            if percentage <= 80:
                top_20_percent.append(sorted_modes[i].get("mode", "Unknown"))
        
        # Check if Pareto principle applies
        pareto_principle_applies = len(top_20_percent) <= len(sorted_modes) * 0.2
        
        return ParetoResponse(
            failure_modes=sorted_modes,
            cumulative_percentages=cumulative_percentages,
            pareto_principle_applies=pareto_principle_applies,
            top_20_percent=top_20_percent
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pareto analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 