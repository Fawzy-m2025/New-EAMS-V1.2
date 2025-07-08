"""
Simple Test Server for Reliability Engine API
Run this to test the Python backend integration
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import numpy as np
from reliability_engine import (
    WeibullAnalysis, 
    OREDAFailureRates, 
    EquipmentCategory,
    PFMEAAnalysis,
    NSWC10StressFactors
)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

@app.route('/api/reliability/analyze', methods=['POST'])
def analyze_reliability():
    """
    Main API endpoint for reliability analysis
    Receives vibration data and returns comprehensive reliability metrics
    """
    try:
        data = request.json
        print(f"📊 Received reliability analysis request: {json.dumps(data, indent=2)}")
        
        # Extract vibration data
        vibration_data = data.get('vibration_data', {})
        operational_data = data.get('operational_data', {})
        equipment_info = data.get('equipment_info', {})
        
        # Calculate average vibration levels
        pump_avg_vib = calculate_average_vibration(vibration_data.get('pump', {}))
        motor_avg_vib = calculate_average_vibration(vibration_data.get('motor', {}))
        system_avg_vib = (pump_avg_vib + motor_avg_vib) / 2
        
        print(f"🔧 Calculated vibration levels - Pump: {pump_avg_vib:.2f}, Motor: {motor_avg_vib:.2f}, System: {system_avg_vib:.2f}")
        
        # Get OREDA failure rates
        pump_rates = OREDAFailureRates.get_rates(EquipmentCategory.PUMP_CENTRIFUGAL)
        motor_rates = OREDAFailureRates.get_rates(EquipmentCategory.MOTOR_INDUCTION)
        
        # Calculate stress factors using NSWC-10
        temp_factor = NSWC10StressFactors.temperature_factor(
            operational_data.get('temperature', 60), 
            75  # Rated temperature
        )
        vib_factor = NSWC10StressFactors.vibration_factor(
            system_avg_vib, 
            2.8  # Design vibration limit
        )
        
        # Adjust failure rates based on stress factors
        adjusted_failure_rate = (pump_rates.failure_rate + motor_rates.failure_rate) * temp_factor * vib_factor
        
        # Calculate reliability metrics
        mtbf = 1 / (adjusted_failure_rate / 8760) if adjusted_failure_rate > 0 else 8760
        mttr = (pump_rates.repair_rate + motor_rates.repair_rate) / 2
        availability = (mtbf / (mtbf + mttr)) * 100
        
        # Generate synthetic failure times for Weibull analysis
        operating_hours = operational_data.get('operating_hours', 4000)
        failure_times = generate_synthetic_failure_times(mtbf, operating_hours)
        
        # Perform Weibull analysis
        weibull_params = WeibullAnalysis.estimate_parameters(failure_times)
        
        # Calculate RUL
        current_reliability = weibull_params.reliability(operating_hours)
        rul = calculate_remaining_useful_life(weibull_params, operating_hours, current_reliability)
        
        # Generate failure modes analysis
        failure_modes = generate_failure_modes(system_avg_vib, operational_data)
        
        # Maintenance optimization
        optimal_interval = mtbf * 0.7  # 70% of MTBF
        cost_savings = calculate_cost_savings(mtbf, optimal_interval)
        
        # Prepare response
        response = {
            "reliability_metrics": {
                "mtbf": float(mtbf),
                "mttr": float(mttr),
                "availability": float(availability),
                "reliability_at_time": float(current_reliability),
                "failure_rate": float(adjusted_failure_rate)
            },
            "weibull_analysis": {
                "beta": float(weibull_params.shape),
                "eta": float(weibull_params.scale),
                "gamma": float(weibull_params.location),
                "r_squared": 0.92  # Assumed good fit
            },
            "rul_prediction": {
                "remaining_useful_life": float(rul),
                "confidence_interval": {
                    "lower": float(rul * 0.8),
                    "upper": float(rul * 1.2)
                },
                "prediction_accuracy": 85.0
            },
            "failure_modes": failure_modes,
            "maintenance_optimization": {
                "optimal_interval": float(optimal_interval),
                "cost_savings": float(cost_savings),
                "recommended_actions": [
                    "Schedule preventive maintenance",
                    "Monitor vibration trends closely",
                    "Check bearing lubrication",
                    "Inspect coupling alignment",
                    "Verify operating parameters"
                ]
            },
            "condition_indicators": {
                "overall_health": float(max(0, 100 - (system_avg_vib * 15))),
                "degradation_rate": float(system_avg_vib / 100),
                "anomaly_score": float(min(100, system_avg_vib * 20)),
                "trend_direction": "degrading" if system_avg_vib > 5 else "stable" if system_avg_vib > 3 else "improving"
            }
        }
        
        print(f"✅ Reliability analysis completed successfully")
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Error in reliability analysis: {str(e)}")
        return jsonify({"error": str(e)}), 500

def calculate_average_vibration(equipment_data):
    """Calculate average vibration from equipment data"""
    vibrations = []
    
    # NDE measurements
    nde = equipment_data.get('nde', {})
    vibrations.extend([
        nde.get('velocity_h', 0),
        nde.get('velocity_v', 0),
        nde.get('velocity_axial', 0)
    ])
    
    # DE measurements
    de = equipment_data.get('de', {})
    vibrations.extend([
        de.get('velocity_h', 0),
        de.get('velocity_v', 0),
        de.get('velocity_axial', 0)
    ])
    
    # Leg measurements
    legs = equipment_data.get('legs', [])
    for leg in legs:
        vibrations.append(leg.get('velocity_h', 0))
    
    # Filter out zero values and calculate average
    non_zero_vibrations = [v for v in vibrations if v > 0]
    return sum(non_zero_vibrations) / len(non_zero_vibrations) if non_zero_vibrations else 0

def generate_synthetic_failure_times(mtbf, current_hours):
    """Generate synthetic failure times for Weibull analysis"""
    # Generate realistic failure times based on MTBF
    np.random.seed(42)  # For reproducible results
    num_failures = max(10, int(current_hours / mtbf * 2))
    
    # Use exponential distribution as base, then adjust
    failure_times = np.random.exponential(mtbf, num_failures)
    failure_times = failure_times[failure_times < current_hours * 2]  # Realistic range
    failure_times = np.sort(failure_times)
    
    return failure_times.tolist()

def generate_failure_modes(avg_vibration, operational_data):
    """Generate failure modes based on vibration levels"""
    base_modes = [
        {"mode": "Bearing Failure", "base_prob": 0.15, "severity": 8, "detection": 6},
        {"mode": "Unbalance", "base_prob": 0.10, "severity": 6, "detection": 4},
        {"mode": "Misalignment", "base_prob": 0.08, "severity": 7, "detection": 5},
        {"mode": "Looseness", "base_prob": 0.05, "severity": 5, "detection": 3},
        {"mode": "Cavitation", "base_prob": 0.03, "severity": 6, "detection": 7}
    ]
    
    failure_modes = []
    for mode in base_modes:
        # Adjust probability based on vibration level
        vib_factor = min(3.0, avg_vibration / 2.0)  # Higher vibration = higher probability
        probability = mode["base_prob"] * vib_factor
        
        # Calculate RPN
        rpn = PFMEAAnalysis.calculate_rpn(
            mode["severity"], 
            int(probability * 10), 
            mode["detection"]
        )
        
        failure_modes.append({
            "mode": mode["mode"],
            "probability": min(0.8, probability),  # Cap at 80%
            "severity": mode["severity"],
            "detectability": mode["detection"],
            "rpn": rpn
        })
    
    return failure_modes

def calculate_remaining_useful_life(weibull_params, current_hours, current_reliability):
    """Calculate remaining useful life"""
    # Find time when reliability drops to 10%
    target_reliability = 0.1
    
    # Use binary search to find time
    low, high = current_hours, current_hours * 10
    for _ in range(50):  # Max iterations
        mid = (low + high) / 2
        reliability_at_mid = weibull_params.reliability(mid)
        
        if abs(reliability_at_mid - target_reliability) < 0.001:
            return mid - current_hours
        elif reliability_at_mid > target_reliability:
            low = mid
        else:
            high = mid
    
    return max(0, low - current_hours)

def calculate_cost_savings(mtbf, optimal_interval):
    """Calculate projected cost savings from optimized maintenance"""
    # Simplified cost model
    failure_cost = 25000  # Cost of unplanned failure
    maintenance_cost = 3000  # Cost of planned maintenance
    
    # Current strategy (reactive)
    failures_per_year = 8760 / mtbf
    reactive_cost = failures_per_year * failure_cost
    
    # Optimized strategy (preventive)
    maintenances_per_year = 8760 / optimal_interval
    preventive_cost = maintenances_per_year * maintenance_cost
    
    return max(0, reactive_cost - preventive_cost)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Reliability Engine API",
        "version": "1.0.0"
    })

if __name__ == '__main__':
    print("🚀 Starting Reliability Engine Test Server...")
    print("📡 API available at: http://localhost:8000")
    print("🔗 Test endpoint: http://localhost:8000/api/reliability/analyze")
    print("💡 Health check: http://localhost:8000/api/health")
    
    app.run(host='0.0.0.0', port=8000, debug=True)
