import requests
import json

def test_backend_api():
    """Test the backend API endpoints"""
    base_url = "http://localhost:8000/api/v1"
    
    print("Testing EAMS Backend API...")
    print("=" * 50)
    
    # Test health check
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health check: PASSED")
            print(f"   Response: {response.json()}")
        else:
            print("❌ Health check: FAILED")
            print(f"   Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check: ERROR - {e}")
    
    print()
    
    # Test historical trends
    try:
        response = requests.get(f"{base_url}/trends/all/vibration?timeRange=30d")
        if response.status_code == 200:
            data = response.json()
            print("✅ Historical trends: PASSED")
            print(f"   Equipment: {data['equipmentId']}")
            print(f"   Metric: {data['metric']}")
            print(f"   Data points: {len(data['dataPoints'])}")
            print(f"   Statistics: {data['statistics']}")
        else:
            print("❌ Historical trends: FAILED")
            print(f"   Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Historical trends: ERROR - {e}")
    
    print()
    
    # Test ML models
    try:
        response = requests.get(f"{base_url}/models")
        if response.status_code == 200:
            models = response.json()
            print("✅ ML models: PASSED")
            print(f"   Models count: {len(models)}")
            for model in models:
                print(f"   - {model['name']} (v{model['version']}) - {model['status']}")
        else:
            print("❌ ML models: FAILED")
            print(f"   Status: {response.status_code}")
    except Exception as e:
        print(f"❌ ML models: ERROR - {e}")
    
    print()
    
    # Test predictive alerts
    try:
        response = requests.get(f"{base_url}/alerts")
        if response.status_code == 200:
            alerts = response.json()
            print("✅ Predictive alerts: PASSED")
            print(f"   Alerts count: {len(alerts)}")
            for alert in alerts:
                print(f"   - {alert['equipmentName']}: {alert['severity']} ({alert['confidence']}%)")
        else:
            print("❌ Predictive alerts: FAILED")
            print(f"   Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Predictive alerts: ERROR - {e}")
    
    print()
    
    # Test health scores
    try:
        response = requests.get(f"{base_url}/health-scores")
        if response.status_code == 200:
            scores = response.json()
            print("✅ Health scores: PASSED")
            print(f"   Assets count: {len(scores)}")
            for score in scores:
                print(f"   - {score['assetName']}: {score['score']}/100 ({score['trend']})")
        else:
            print("❌ Health scores: FAILED")
            print(f"   Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Health scores: ERROR - {e}")
    
    print()
    print("=" * 50)
    print("API Testing Complete!")

if __name__ == "__main__":
    test_backend_api() 