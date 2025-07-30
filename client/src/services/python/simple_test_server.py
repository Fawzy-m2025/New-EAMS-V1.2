"""
Simple Test Server for Reliability Engine API (No Dependencies)
Run this to test the Python backend integration without scipy
"""

import json
import math
import random
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import webbrowser
import time

class ReliabilityAPIHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                "status": "healthy",
                "service": "Simple Reliability Engine API",
                "version": "1.0.0",
                "message": "✅ Python backend is running successfully!"
            }
            self.wfile.write(json.dumps(response, indent=2).encode())
            
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/api/reliability/analyze':
            try:
                # Read request data
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                print(f"📊 Received reliability analysis request")
                print(f"🔧 Processing vibration data...")
                
                # Process the data
                response = self.analyze_reliability(data)
                
                # Send response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response, indent=2).encode())
                
                print(f"✅ Reliability analysis completed successfully")
                
            except Exception as e:
                print(f"❌ Error in reliability analysis: {str(e)}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                error_response = {"error": str(e)}
                self.wfile.write(json.dumps(error_response).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def analyze_reliability(self, data):
        """Analyze reliability data and return comprehensive metrics"""
        
        # Extract vibration data
        vibration_data = data.get('vibration_data', {})
        operational_data = data.get('operational_data', {})
        
        # Calculate average vibrations
        pump_avg = self.calculate_avg_vibration(vibration_data.get('pump', {}))
        motor_avg = self.calculate_avg_vibration(vibration_data.get('motor', {}))
        system_avg = (pump_avg + motor_avg) / 2 if pump_avg > 0 and motor_avg > 0 else max(pump_avg, motor_avg)
        
        print(f"🔧 Vibration levels - Pump: {pump_avg:.2f}, Motor: {motor_avg:.2f}, System: {system_avg:.2f} mm/s")
        
        # Calculate reliability metrics
        base_mtbf = 6000  # Base MTBF in hours
        vibration_factor = max(0.1, 1.0 - (system_avg - 2.0) / 10.0)  # Reduce MTBF with higher vibration
        mtbf = base_mtbf * vibration_factor
        
        mttr = 24  # Mean time to repair (hours)
        availability = (mtbf / (mtbf + mttr)) * 100
        failure_rate = 1 / mtbf if mtbf > 0 else 0.001
        
        operating_hours = operational_data.get('operating_hours', 4000)
        
        # Weibull parameters (simplified)
        beta = 2.0 + random.uniform(-0.5, 0.5)  # Shape parameter
        eta = mtbf * math.pow(math.log(2), 1/beta)  # Scale parameter
        
        # Calculate reliability at current time
        reliability_at_time = math.exp(-math.pow(operating_hours / eta, beta))
        
        # Calculate RUL (Remaining Useful Life)
        target_reliability = 0.1  # 10% reliability threshold
        rul_time = eta * math.pow(-math.log(target_reliability), 1/beta)
        rul = max(0, rul_time - operating_hours)
        
        # Generate failure modes
        failure_modes = self.generate_failure_modes(system_avg)
        
        # Maintenance optimization
        optimal_interval = mtbf * 0.7  # 70% of MTBF
        cost_savings = self.calculate_cost_savings(mtbf, optimal_interval)
        
        # Overall health calculation
        health_score = max(0, min(100, 100 - (system_avg - 1.0) * 15))
        
        # Determine trend direction
        if system_avg > 6.0:
            trend = "degrading"
        elif system_avg > 3.0:
            trend = "stable"
        else:
            trend = "improving"
        
        return {
            "reliability_metrics": {
                "mtbf": round(mtbf, 1),
                "mttr": mttr,
                "availability": round(availability, 2),
                "reliability_at_time": round(reliability_at_time, 4),
                "failure_rate": round(failure_rate, 6)
            },
            "weibull_analysis": {
                "beta": round(beta, 2),
                "eta": round(eta, 1),
                "gamma": 0.0,
                "r_squared": 0.92
            },
            "rul_prediction": {
                "remaining_useful_life": round(rul, 0),
                "confidence_interval": {
                    "lower": round(rul * 0.8, 0),
                    "upper": round(rul * 1.2, 0)
                },
                "prediction_accuracy": 85.0
            },
            "failure_modes": failure_modes,
            "maintenance_optimization": {
                "optimal_interval": round(optimal_interval, 0),
                "cost_savings": round(cost_savings, 0),
                "recommended_actions": [
                    "Schedule preventive maintenance",
                    "Monitor vibration trends closely",
                    "Check bearing lubrication",
                    "Inspect coupling alignment",
                    "Verify operating parameters"
                ]
            },
            "condition_indicators": {
                "overall_health": round(health_score, 1),
                "degradation_rate": round(system_avg / 100, 4),
                "anomaly_score": round(min(100, system_avg * 20), 1),
                "trend_direction": trend
            }
        }

    def calculate_avg_vibration(self, equipment_data):
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
        
        # Leg measurements removed - using NDE/DE data for FailureAnalysisEngine
        
        # Filter non-zero values and calculate average
        non_zero_vibrations = [v for v in vibrations if v > 0]
        return sum(non_zero_vibrations) / len(non_zero_vibrations) if non_zero_vibrations else 0

    def generate_failure_modes(self, avg_vibration):
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
            vib_factor = min(3.0, avg_vibration / 2.0)
            probability = mode["base_prob"] * vib_factor
            
            # Calculate RPN (Risk Priority Number)
            occurrence = min(10, int(probability * 10))
            rpn = mode["severity"] * occurrence * mode["detection"]
            
            failure_modes.append({
                "mode": mode["mode"],
                "probability": round(min(0.8, probability), 3),
                "severity": mode["severity"],
                "detectability": mode["detection"],
                "rpn": rpn
            })
        
        return failure_modes

    def calculate_cost_savings(self, mtbf, optimal_interval):
        """Calculate projected cost savings"""
        failure_cost = 25000  # Cost of unplanned failure
        maintenance_cost = 3000  # Cost of planned maintenance
        
        # Current strategy (reactive)
        failures_per_year = 8760 / mtbf if mtbf > 0 else 1
        reactive_cost = failures_per_year * failure_cost
        
        # Optimized strategy (preventive)
        maintenances_per_year = 8760 / optimal_interval if optimal_interval > 0 else 4
        preventive_cost = maintenances_per_year * maintenance_cost
        
        return max(0, reactive_cost - preventive_cost)

def start_server():
    """Start the HTTP server"""
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, ReliabilityAPIHandler)
    
    print("🚀 Starting Simple Reliability Engine Test Server...")
    print("📡 API available at: http://localhost:8000")
    print("🔗 Test endpoint: http://localhost:8000/api/reliability/analyze")
    print("💡 Health check: http://localhost:8000/api/health")
    print("🌐 Opening Enhanced Vibration Form in browser...")
    
    # Open the Enhanced Vibration Form in browser after a short delay
    def open_browser():
        time.sleep(2)
        webbrowser.open('http://localhost:8080/condition-monitoring')
        print("✅ Browser opened! Navigate to the Enhanced Vibration Form")
        print("🧪 Click 'Show Testing Panel' to start testing")
    
    # Start browser opening in a separate thread
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        httpd.shutdown()

if __name__ == '__main__':
    start_server()
