from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import random

app = Flask(__name__)
CORS(app)

@app.route('/api/v1/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })

@app.route('/api/v1/models', methods=['GET'])
def get_ml_models():
    return jsonify([
        {
            "id": "model-1",
            "name": "Vibration Prediction Model",
            "type": "time-series",
            "accuracy": 94.2,
            "status": "deployed",
            "lastUpdated": datetime.now().isoformat(),
            "version": "2.1.0",
            "features": ["rms_velocity", "peak_velocity", "temperature", "operating_hours"],
            "performance": {
                "precision": 0.92,
                "recall": 0.89,
                "f1Score": 0.90,
                "mse": 0.08,
                "mae": 0.12,
                "rmse": 0.28
            }
        }
    ])

@app.route('/api/v1/alerts', methods=['GET'])
def get_predictive_alerts():
    return jsonify([
        {
            "id": "alert-1",
            "equipmentId": "EQ-001",
            "equipmentName": "Main Water Pump",
            "alertType": "vibration",
            "severity": "high",
            "confidence": 92,
            "predictedFailureTime": (datetime.now() + timedelta(days=7)).isoformat(),
            "rulHours": 168,
            "currentValue": 6.8,
            "threshold": 5.5,
            "trend": "increasing",
            "recommendations": ["Schedule maintenance", "Check bearing condition"],
            "status": "active",
            "createdAt": datetime.now().isoformat(),
            "escalationLevel": 2,
            "notificationSent": True
        }
    ])

@app.route('/api/v1/models/<model_id>/explainability', methods=['GET'])
def get_model_explainability(model_id):
    return jsonify({
        "shapValues": {
            "globalImportance": [
                {"feature": "rms_velocity", "importance": 0.35},
                {"feature": "temperature", "importance": 0.28}
            ]
        },
        "limeExplanations": [],
        "featureImportance": [],
        "globalExplanations": {},
        "localExplanations": [],
        "modelInterpretability": {
            "overallScore": 0.88,
            "featureClarity": 0.92,
            "decisionTransparency": 0.85,
            "biasDetection": 0.78
        }
    })

@app.route('/api/v1/models/<model_id>/shap/<prediction_id>', methods=['GET'])
def get_shap_analysis(model_id, prediction_id):
    return jsonify({
        "globalImportance": [
            {"feature": "rms_velocity", "importance": 0.35},
            {"feature": "temperature", "importance": 0.28}
        ],
        "localImportance": [],
        "interactionValues": [],
        "summaryPlot": {
            "featureNames": ["rms_velocity", "temperature"],
            "shapValues": [[0.15, 0.08]],
            "featureValues": [[4.2, 72.5]]
        }
    })

@app.route('/api/v1/models/<model_id>/lime/<prediction_id>', methods=['GET'])
def get_lime_explanation(model_id, prediction_id):
    return jsonify({
        "predictionId": prediction_id,
        "explanation": [
            {"feature": "rms_velocity", "weight": 0.6, "description": "High vibration levels"}
        ],
        "localPrediction": 0.82,
        "confidence": 0.85,
        "interpretableFeatures": ["rms_velocity", "temperature"]
    })

@app.route('/api/v1/prescriptive-advanced/<equipment_id>', methods=['GET'])
def get_advanced_prescriptive_analytics(equipment_id):
    return jsonify([{
        "id": "prescriptive-1",
        "equipmentId": equipment_id,
        "analysisType": "optimization",
        "priority": "high",
        "confidence": 0.88,
        "implementationPlan": {
            "phases": [],
            "totalCost": 35000,
            "totalDuration": 30,
            "criticalPath": [],
            "resourceRequirements": []
        },
        "createdAt": datetime.now().isoformat(),
        "status": "draft"
    }])

@app.route('/api/v1/notification-workflows', methods=['GET'])
def get_notification_workflows():
    return jsonify([{
        "id": "workflow-1",
        "name": "Critical Alert Escalation",
        "description": "Escalates critical alerts through multiple levels",
        "triggerConditions": [],
        "escalationRules": [],
        "notificationTemplates": [],
        "recipients": [],
        "channels": [],
        "status": "active",
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    }])

@app.route('/api/v1/ml-pipelines', methods=['GET'])
def get_ml_pipelines():
    return jsonify([{
        "id": "pipeline-1",
        "name": "Vibration Analysis Pipeline",
        "description": "End-to-end pipeline for vibration analysis and prediction",
        "version": "2.1.0",
        "status": "active",
        "configuration": {},
        "stages": [],
        "monitoring": {},
        "performance": {},
        "deployment": {},
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat(),
        "createdBy": "ml_engineer"
    }])

@app.route('/api/v1/health-scores', methods=['GET'])
def get_health_scores():
    return jsonify([
        {
            "id": "health-1",
            "assetId": "EQ-001",
            "assetName": "Main Centrifugal Pump P-001",
            "score": 85,
            "componentScores": {
                "vibration": 82,
                "temperature": 88,
                "pressure": 90,
                "oil": 75,
                "alignment": 92
            },
            "trend": "improving",
            "lastUpdated": datetime.now().isoformat(),
            "predictedFailureDate": (datetime.now() + timedelta(days=45)).isoformat(),
            "confidence": 92,
            "riskLevel": "medium"
        },
        {
            "id": "health-2",
            "assetId": "EQ-002",
            "assetName": "Emergency Generator G-001",
            "score": 78,
            "componentScores": {
                "vibration": 75,
                "temperature": 80,
                "pressure": 85,
                "oil": 70,
                "alignment": 88
            },
            "trend": "stable",
            "lastUpdated": datetime.now().isoformat(),
            "predictedFailureDate": (datetime.now() + timedelta(days=30)).isoformat(),
            "confidence": 88,
            "riskLevel": "high"
        },
        {
            "id": "health-3",
            "assetId": "EQ-PUMP-001",
            "assetName": "Main Water Pump",
            "score": 92,
            "componentScores": {
                "vibration": 90,
                "temperature": 94,
                "pressure": 88,
                "oil": 85,
                "alignment": 95
            },
            "trend": "improving",
            "lastUpdated": datetime.now().isoformat(),
            "predictedFailureDate": (datetime.now() + timedelta(days=60)).isoformat(),
            "confidence": 95,
            "riskLevel": "low"
        },
        {
            "id": "health-4",
            "assetId": "EQ-MOTOR-002",
            "assetName": "Drive Motor Unit",
            "score": 65,
            "componentScores": {
                "vibration": 60,
                "temperature": 70,
                "pressure": 75,
                "oil": 65,
                "alignment": 80
            },
            "trend": "declining",
            "lastUpdated": datetime.now().isoformat(),
            "predictedFailureDate": (datetime.now() + timedelta(days=15)).isoformat(),
            "confidence": 85,
            "riskLevel": "critical"
        }
    ])

@app.route('/api/v1/weibull-analysis', methods=['GET'])
def get_weibull_analysis():
    return jsonify([
        {
            "id": "weibull-1",
            "equipmentId": "EQ-PUMP-001",
            "equipmentName": "Main Water Pump",
            "shapeParameter": 3.2,
            "scaleParameter": 8000,
            "locationParameter": 0,
            "confidenceInterval": {
                "lower": 2.9,
                "upper": 3.5
            },
            "goodnessOfFit": {
                "rSquared": 0.94,
                "kolmogorovSmirnov": 0.042,
                "andersonDarling": 0.28
            },
            "failureData": [
                {
                    "timestamp": "2024-01-15T10:30:00",
                    "failureType": "bearing_failure",
                    "operatingHours": 7200
                }
            ],
            "predictedRUL": 2500,
            "confidence": 0.92,
            "lastUpdated": datetime.now().isoformat()
        },
        {
            "id": "weibull-2",
            "equipmentId": "EQ-MOTOR-002",
            "equipmentName": "Drive Motor Unit",
            "shapeParameter": 2.8,
            "scaleParameter": 12000,
            "locationParameter": 0,
            "confidenceInterval": {
                "lower": 2.5,
                "upper": 3.1
            },
            "goodnessOfFit": {
                "rSquared": 0.91,
                "kolmogorovSmirnov": 0.055,
                "andersonDarling": 0.35
            },
            "failureData": [
                {
                    "timestamp": "2024-02-20T14:15:00",
                    "failureType": "winding_failure",
                    "operatingHours": 10800
                }
            ],
            "predictedRUL": 1800,
            "confidence": 0.88,
            "lastUpdated": datetime.now().isoformat()
        }
    ])

@app.route('/api/v1/maintenance-optimization', methods=['GET'])
def get_maintenance_optimization():
    return jsonify([
        {
            "equipmentId": "EQ-PUMP-001",
            "currentStrategy": "preventive",
            "recommendedStrategy": "predictive",
            "costSavings": 35000,
            "reliabilityImprovement": 45,
            "implementationTime": 25,
            "roi": 180,
            "riskReduction": 60,
            "lastUpdated": datetime.now().isoformat()
        },
        {
            "equipmentId": "EQ-MOTOR-002",
            "currentStrategy": "reactive",
            "recommendedStrategy": "predictive",
            "costSavings": 55000,
            "reliabilityImprovement": 75,
            "implementationTime": 30,
            "roi": 220,
            "riskReduction": 80,
            "lastUpdated": datetime.now().isoformat()
        }
    ])

@app.route('/api/v1/prescriptive-actions', methods=['GET'])
def get_prescriptive_actions():
    return jsonify([
        {
            "id": "action-1",
            "equipmentId": "EQ-PUMP-001",
            "type": "maintenance",
            "priority": "high",
            "confidence": 88,
            "impact": {
                "costSavings": 25000,
                "riskReduction": 45,
                "reliabilityImprovement": 35,
                "downtimeReduction": 40
            },
            "recommendation": "Schedule bearing replacement for Main Water Pump",
            "rationale": "Vibration levels trending upward, bearing wear detected",
            "alternatives": [
                {
                    "action": "Continue current maintenance schedule",
                    "impact": { "cost": 0, "risk": 0, "reliability": 0 }
                }
            ],
            "optimalTiming": {
                "recommendedDate": (datetime.now() + timedelta(days=7)).isoformat(),
                "urgency": "soon",
                "constraints": ["Resource availability", "Production schedule"]
            },
            "implementation": {
                "estimatedDuration": 8,
                "requiredResources": ["Technician", "Bearing replacement kit"],
                "prerequisites": ["Safety review", "Work permit"],
                "estimatedCost": 12000
            },
            "status": "pending",
            "createdAt": datetime.now().isoformat()
        },
        {
            "id": "action-2",
            "equipmentId": "EQ-MOTOR-002",
            "type": "inspection",
            "priority": "critical",
            "confidence": 92,
            "impact": {
                "costSavings": 40000,
                "riskReduction": 70,
                "reliabilityImprovement": 50,
                "downtimeReduction": 60
            },
            "recommendation": "Immediate motor winding inspection",
            "rationale": "High temperature readings, potential winding failure",
            "alternatives": [
                {
                    "action": "Continue monitoring",
                    "impact": { "cost": 0, "risk": 0, "reliability": 0 }
                }
            ],
            "optimalTiming": {
                "recommendedDate": datetime.now().isoformat(),
                "urgency": "immediate",
                "constraints": ["Safety protocols", "Emergency procedures"]
            },
            "implementation": {
                "estimatedDuration": 4,
                "requiredResources": ["Electrician", "Thermal camera"],
                "prerequisites": ["Safety review", "Emergency work permit"],
                "estimatedCost": 8000
            },
            "status": "pending",
            "createdAt": datetime.now().isoformat()
        }
    ])

if __name__ == '__main__':
    print("Starting EAMS Backend Server...")
    print("API will be available at: http://localhost:8000")
    app.run(host='0.0.0.0', port=8000, debug=True) 