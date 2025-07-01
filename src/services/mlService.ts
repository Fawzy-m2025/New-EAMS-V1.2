import type {
    MLModel,
    PredictiveAlert,
    AnomalyDetection,
    HistoricalTrend,
    PrescriptiveRecommendation,
    ScenarioSimulation,
    AssetDrilldown,
    Notification,
    EscalationWorkflow,
    RealTimeStream,
    MLPipeline,
    DataQuality,
    SensorData,
    IoTDevice,
    UserFeedback,
    PredictionExplanation,
    WeibullAnalysis,
    HealthScore,
    RCFAAnalysis,
    PFMEAAnalysis,
    RealTimeData,
    PrescriptiveAction,
    MaintenanceOptimization,
    ModelExplainability,
    SHAPAnalysis,
    LIMEExplanation,
    AdvancedPrescriptiveAnalytics,
    EnhancedNotificationWorkflow,
    MLPipelineManagement
} from '@/types/ml';
import { enhancedAssetData } from '@/data/enhancedAssetData';

// Equipment-specific monitoring configurations
const equipmentMonitoringConfig = {
    // Pump Equipment
    'Main Water Pump': {
        sensors: ['vibration', 'temperature', 'pressure', 'flow_rate', 'power'],
        criticalThresholds: {
            vibration: 8.0,
            temperature: 85,
            pressure: 120,
            flow_rate: 0.8,
            power: 110
        },
        weibullParams: { shape: 3.2, scale: 8000 },
        maintenanceStrategy: 'predictive',
        priority: 'high'
    },
    'Secondary Water Pump': {
        sensors: ['vibration', 'temperature', 'oil_quality', 'flow_rate'],
        criticalThresholds: {
            vibration: 7.5,
            temperature: 80,
            oil_quality: 0.15,
            flow_rate: 0.85
        },
        weibullParams: { shape: 2.8, scale: 10000 },
        maintenanceStrategy: 'preventive',
        priority: 'medium'
    },
    'Backup Water Pump': {
        sensors: ['vibration', 'temperature', 'pressure'],
        criticalThresholds: {
            vibration: 7.0,
            temperature: 75,
            pressure: 115
        },
        weibullParams: { shape: 3.0, scale: 12000 },
        maintenanceStrategy: 'predictive',
        priority: 'medium'
    },
    'Main Centrifugal Pump P-001': {
        sensors: ['vibration', 'temperature', 'pressure', 'efficiency'],
        criticalThresholds: {
            vibration: 8.5,
            temperature: 90,
            pressure: 125,
            efficiency: 0.75
        },
        weibullParams: { shape: 3.5, scale: 7500 },
        maintenanceStrategy: 'predictive',
        priority: 'high'
    },

    // Motor Equipment
    'Drive Motor Unit': {
        sensors: ['temperature', 'current', 'voltage', 'power_factor', 'vibration'],
        criticalThresholds: {
            temperature: 85,
            current: 110,
            voltage: 0.9,
            power_factor: 0.8,
            vibration: 6.0
        },
        weibullParams: { shape: 2.8, scale: 12000 },
        maintenanceStrategy: 'predictive',
        priority: 'critical'
    },
    'Auxiliary Motor Unit': {
        sensors: ['temperature', 'current', 'vibration'],
        criticalThresholds: {
            temperature: 80,
            current: 105,
            vibration: 5.5
        },
        weibullParams: { shape: 2.5, scale: 15000 },
        maintenanceStrategy: 'preventive',
        priority: 'medium'
    },
    'Reserve Motor Unit': {
        sensors: ['temperature', 'current', 'insulation'],
        criticalThresholds: {
            temperature: 75,
            current: 100,
            insulation: 0.5
        },
        weibullParams: { shape: 2.2, scale: 18000 },
        maintenanceStrategy: 'preventive',
        priority: 'low'
    },

    // Electrical Equipment
    'Emergency Generator G-001': {
        sensors: ['temperature', 'fuel_level', 'oil_pressure', 'rpm'],
        criticalThresholds: {
            temperature: 95,
            fuel_level: 0.2,
            oil_pressure: 0.8,
            rpm: 0.95
        },
        weibullParams: { shape: 2.0, scale: 20000 },
        maintenanceStrategy: 'predictive',
        priority: 'critical'
    },
    'Distribution Panel DP-101': {
        sensors: ['temperature', 'current', 'voltage', 'power_factor'],
        criticalThresholds: {
            temperature: 70,
            current: 95,
            voltage: 0.85,
            power_factor: 0.75
        },
        weibullParams: { shape: 1.8, scale: 25000 },
        maintenanceStrategy: 'preventive',
        priority: 'high'
    },
    'Transformer T-001': {
        sensors: ['temperature', 'oil_level', 'load_current', 'efficiency'],
        criticalThresholds: {
            temperature: 85,
            oil_level: 0.9,
            load_current: 0.95,
            efficiency: 0.92
        },
        weibullParams: { shape: 1.5, scale: 30000 },
        maintenanceStrategy: 'preventive',
        priority: 'high'
    },

    // Mechanical Equipment
    'Butterfly Valve BV-101': {
        sensors: ['position', 'torque', 'leakage', 'vibration'],
        criticalThresholds: {
            position: 0.95,
            torque: 120,
            leakage: 0.1,
            vibration: 4.0
        },
        weibullParams: { shape: 2.2, scale: 15000 },
        maintenanceStrategy: 'predictive',
        priority: 'medium'
    },
    'HVAC Unit 12': {
        sensors: ['temperature', 'humidity', 'airflow', 'efficiency'],
        criticalThresholds: {
            temperature: 25,
            humidity: 0.7,
            airflow: 0.8,
            efficiency: 0.75
        },
        weibullParams: { shape: 2.5, scale: 12000 },
        maintenanceStrategy: 'preventive',
        priority: 'medium'
    }
};

// WebSocket connection for real-time data
class RealTimeConnection {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private subscribers: Map<string, (data: any) => void> = new Map();

    constructor(private url: string) { }

    connect() {
        try {
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.handleReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
        }
    }

    private handleMessage(data: any) {
        const { type, payload } = data;

        switch (type) {
            case 'sensor_data':
                this.notifySubscribers('sensor', payload);
                break;
            case 'prediction_update':
                this.notifySubscribers('prediction', payload);
                break;
            case 'alert_new':
                this.notifySubscribers('alert', payload);
                break;
            case 'anomaly_detected':
                this.notifySubscribers('anomaly', payload);
                break;
            case 'model_status':
                this.notifySubscribers('model', payload);
                break;
        }
    }

    private handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                this.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        }
    }

    subscribe(type: string, callback: (data: any) => void) {
        this.subscribers.set(type, callback);
    }

    unsubscribe(type: string) {
        this.subscribers.delete(type);
    }

    private notifySubscribers(type: string, data: any) {
        const callback = this.subscribers.get(type);
        if (callback) {
            callback(data);
        }
    }

    send(message: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

// ML Service Class
class MLService {
    private baseUrl: string;
    private realTimeConnection: RealTimeConnection;
    private apiKey: string;

    constructor(baseUrl: string, apiKey: string) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.realTimeConnection = new RealTimeConnection(`${baseUrl.replace('http', 'ws')}/ws`);
    }

    // Initialize the service
    async initialize(): Promise<void> {
        try {
            // Connect to real-time stream
            this.realTimeConnection.connect();

            // Verify API connection
            const isHealthy = await this.healthCheck();
            if (!isHealthy) {
                console.warn('Backend not available, using mock data');
            }

            console.log('ML Service initialized successfully');
        } catch (error) {
            console.warn('Failed to initialize ML Service, using mock data:', error);
            // Don't throw error, continue with mock data
        }
    }

    // Health check
    async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.ok;
        } catch (error) {
            console.warn('Health check failed, backend not available:', error);
            return false;
        }
    }

    // ML Models Management
    async getMLModels(): Promise<MLModel[]> {
        try {
            const response = await fetch(`${this.baseUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.warn('Failed to fetch ML models, using mock data:', error);
            // Return mock data when backend is not available
            return [
                {
                    id: 'model-1',
                    name: 'Vibration Prediction Model',
                    type: 'time-series',
                    accuracy: 94.2,
                    status: 'deployed',
                    lastUpdated: new Date().toISOString(),
                    version: '2.1.0',
                    features: ['rms_velocity', 'peak_velocity', 'temperature', 'operating_hours'],
                    performance: {
                        precision: 0.92,
                        recall: 0.89,
                        f1Score: 0.90,
                        mse: 0.08,
                        mae: 0.12,
                        rmse: 0.28
                    },
                    driftMetrics: {
                        dataDrift: 0.05,
                        conceptDrift: 0.03,
                        lastDriftCheck: new Date().toISOString(),
                        driftThreshold: 0.1
                    }
                },
                {
                    id: 'model-2',
                    name: 'Temperature Anomaly Detection',
                    type: 'anomaly-detection',
                    accuracy: 91.5,
                    status: 'deployed',
                    lastUpdated: new Date().toISOString(),
                    version: '1.8.0',
                    features: ['temperature', 'ambient_temp', 'load_factor'],
                    performance: {
                        precision: 0.89,
                        recall: 0.93,
                        f1Score: 0.91,
                        mse: 0.12,
                        mae: 0.15,
                        rmse: 0.35
                    }
                }
            ];
        }
    }

    async retrainModel(modelId: string): Promise<{ status: string; estimatedCompletion: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/models/${modelId}/retrain`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to retrain model: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error retraining model:', error);
            throw error;
        }
    }

    async getModelExplainability(modelId: string): Promise<ModelExplainability> {
        try {
            const response = await fetch(`${this.baseUrl}/models/${modelId}/explainability`);
            if (!response.ok) throw new Error('Failed to fetch model explainability');
            return await response.json();
        } catch (error) {
            console.error('Error fetching model explainability:', error);
            // Return mock data
            return {
                shapValues: {
                    globalImportance: [
                        { feature: 'vibration_rms', importance: 0.35 },
                        { feature: 'temperature_avg', importance: 0.28 },
                        { feature: 'pressure_peak', importance: 0.22 },
                        { feature: 'oil_quality', importance: 0.15 }
                    ],
                    localImportance: [
                        {
                            predictionId: 'pred_001',
                            features: [
                                { feature: 'vibration_rms', shapValue: 0.15, baseValue: 0.5 },
                                { feature: 'temperature_avg', shapValue: -0.08, baseValue: 0.5 },
                                { feature: 'pressure_peak', shapValue: 0.12, baseValue: 0.5 }
                            ],
                            prediction: 0.69,
                            baseValue: 0.5
                        }
                    ],
                    interactionValues: [
                        { feature1: 'vibration_rms', feature2: 'temperature_avg', interactionStrength: 0.18 },
                        { feature1: 'pressure_peak', feature2: 'oil_quality', interactionStrength: 0.12 }
                    ],
                    summaryPlot: {
                        featureNames: ['vibration_rms', 'temperature_avg', 'pressure_peak', 'oil_quality'],
                        shapValues: [[0.15, -0.08, 0.12, 0.05], [0.12, 0.10, -0.06, 0.08]],
                        featureValues: [[45.2, 65.8, 120.5, 0.85], [48.1, 62.3, 118.2, 0.82]]
                    }
                },
                limeExplanations: [
                    {
                        predictionId: 'pred_001',
                        explanation: [
                            { feature: 'vibration_rms', weight: 0.35, description: 'High vibration levels indicate potential bearing wear' },
                            { feature: 'temperature_avg', weight: -0.28, description: 'Temperature is within normal range' },
                            { feature: 'pressure_peak', weight: 0.22, description: 'Pressure spikes suggest valve issues' }
                        ],
                        localPrediction: 0.69,
                        confidence: 0.85,
                        interpretableFeatures: ['vibration_rms', 'temperature_avg', 'pressure_peak']
                    }
                ],
                featureImportance: [
                    { feature: 'vibration_rms', importance: 0.35, type: 'global', confidence: 0.92, description: 'Most critical feature for failure prediction' },
                    { feature: 'temperature_avg', importance: 0.28, type: 'global', confidence: 0.88, description: 'Secondary indicator of equipment health' },
                    { feature: 'pressure_peak', importance: 0.22, type: 'global', confidence: 0.85, description: 'Important for valve and seal monitoring' }
                ],
                globalExplanations: {
                    modelBehavior: 'The model primarily relies on vibration patterns and temperature trends to predict equipment failures',
                    keyInsights: [
                        'Vibration RMS values above 45 units indicate increased failure risk',
                        'Temperature variations beyond ±5°C from baseline suggest thermal stress',
                        'Pressure spikes correlate strongly with valve-related failures'
                    ],
                    featureInteractions: [
                        { feature1: 'vibration_rms', feature2: 'temperature_avg', strength: 0.18 },
                        { feature1: 'pressure_peak', feature2: 'oil_quality', strength: 0.12 }
                    ],
                    decisionBoundaries: [
                        { feature: 'vibration_rms', threshold: 45.0, direction: 'above' },
                        { feature: 'temperature_avg', threshold: 70.0, direction: 'above' },
                        { feature: 'pressure_peak', threshold: 125.0, direction: 'above' }
                    ]
                },
                localExplanations: [
                    {
                        predictionId: 'pred_001',
                        explanation: 'This prediction is primarily driven by elevated vibration levels (45.2 RMS) and pressure spikes (120.5 PSI)',
                        contributingFeatures: [
                            { feature: 'vibration_rms', contribution: 0.35, direction: 'positive' },
                            { feature: 'pressure_peak', contribution: 0.22, direction: 'positive' },
                            { feature: 'temperature_avg', contribution: -0.28, direction: 'negative' }
                        ],
                        confidence: 0.85,
                        alternativeScenarios: [
                            { scenario: 'If vibration reduces to 35 RMS', predictedOutcome: 0.45 },
                            { scenario: 'If pressure normalizes to 110 PSI', predictedOutcome: 0.52 }
                        ]
                    }
                ],
                modelInterpretability: {
                    overallScore: 0.87,
                    featureClarity: 0.92,
                    decisionTransparency: 0.85,
                    biasDetection: 0.78
                }
            };
        }
    }

    async getSHAPAnalysis(modelId: string, predictionId?: string): Promise<SHAPAnalysis> {
        try {
            const url = predictionId
                ? `${this.baseUrl}/models/${modelId}/shap/${predictionId}`
                : `${this.baseUrl}/models/${modelId}/shap`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch SHAP analysis');
            return await response.json();
        } catch (error) {
            console.error('Error fetching SHAP analysis:', error);
            return {
                globalImportance: [
                    { feature: 'vibration_rms', importance: 0.35 },
                    { feature: 'temperature_avg', importance: 0.28 },
                    { feature: 'pressure_peak', importance: 0.22 },
                    { feature: 'oil_quality', importance: 0.15 }
                ],
                localImportance: [
                    {
                        predictionId: 'pred_001',
                        features: [
                            { feature: 'vibration_rms', shapValue: 0.15, baseValue: 0.5 },
                            { feature: 'temperature_avg', shapValue: -0.08, baseValue: 0.5 },
                            { feature: 'pressure_peak', shapValue: 0.12, baseValue: 0.5 }
                        ],
                        prediction: 0.69,
                        baseValue: 0.5
                    }
                ],
                interactionValues: [
                    { feature1: 'vibration_rms', feature2: 'temperature_avg', interactionStrength: 0.18 },
                    { feature1: 'pressure_peak', feature2: 'oil_quality', interactionStrength: 0.12 }
                ],
                summaryPlot: {
                    featureNames: ['vibration_rms', 'temperature_avg', 'pressure_peak', 'oil_quality'],
                    shapValues: [[0.15, -0.08, 0.12, 0.05], [0.12, 0.10, -0.06, 0.08]],
                    featureValues: [[45.2, 65.8, 120.5, 0.85], [48.1, 62.3, 118.2, 0.82]]
                }
            };
        }
    }

    async getLIMEExplanation(modelId: string, predictionId: string): Promise<LIMEExplanation> {
        try {
            const response = await fetch(`${this.baseUrl}/models/${modelId}/lime/${predictionId}`);
            if (!response.ok) throw new Error('Failed to fetch LIME explanation');
            return await response.json();
        } catch (error) {
            console.error('Error fetching LIME explanation:', error);
            return {
                predictionId: 'pred_001',
                explanation: [
                    { feature: 'vibration_rms', weight: 0.35, description: 'High vibration levels indicate potential bearing wear' },
                    { feature: 'temperature_avg', weight: -0.28, description: 'Temperature is within normal range' },
                    { feature: 'pressure_peak', weight: 0.22, description: 'Pressure spikes suggest valve issues' }
                ],
                localPrediction: 0.69,
                confidence: 0.85,
                interpretableFeatures: ['vibration_rms', 'temperature_avg', 'pressure_peak']
            };
        }
    }

    // Predictive Analytics
    async getPredictiveAlerts(filters?: {
        equipmentId?: string;
        severity?: string[];
        status?: string[];
        timeRange?: string;
    }): Promise<PredictiveAlert[]> {
        try {
            // Mock data for testing
            const mockAlerts: PredictiveAlert[] = [
                {
                    id: 'alert-1',
                    equipmentId: 'EQ-PUMP-001',
                    equipmentName: 'Main Water Pump',
                    alertType: 'vibration',
                    severity: 'high',
                    confidence: 0.89,
                    predictedFailureTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    rulHours: 168,
                    currentValue: 6.8,
                    threshold: 4.5,
                    trend: 'increasing',
                    recommendations: [
                        'Schedule bearing inspection within 48 hours',
                        'Monitor vibration levels every 4 hours',
                        'Prepare replacement bearings'
                    ],
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    escalationLevel: 2,
                    notificationSent: true
                },
                {
                    id: 'alert-2',
                    equipmentId: 'EQ-MOTOR-002',
                    equipmentName: 'Drive Motor Unit',
                    alertType: 'temperature',
                    severity: 'critical',
                    confidence: 0.95,
                    predictedFailureTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                    rulHours: 48,
                    currentValue: 85,
                    threshold: 70,
                    trend: 'increasing',
                    recommendations: [
                        'Immediate shutdown recommended',
                        'Check cooling system',
                        'Inspect motor windings'
                    ],
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    escalationLevel: 3,
                    notificationSent: true
                },
                {
                    id: 'alert-3',
                    equipmentId: 'EQ-PUMP-003',
                    equipmentName: 'Secondary Water Pump',
                    alertType: 'oil',
                    severity: 'medium',
                    confidence: 0.76,
                    predictedFailureTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    rulHours: 336,
                    currentValue: 0.15,
                    threshold: 0.10,
                    trend: 'stable',
                    recommendations: [
                        'Schedule oil change within 1 week',
                        'Monitor oil quality weekly',
                        'Check for contamination sources'
                    ],
                    status: 'acknowledged',
                    acknowledgedBy: 'tech-john',
                    acknowledgedAt: new Date().toISOString(),
                    escalationLevel: 1,
                    notificationSent: true
                }
            ];

            return mockAlerts;
        } catch (error) {
            console.error('Error fetching predictive alerts:', error);
            throw error;
        }
    }

    async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/predictions/alerts/${alertId}/acknowledge`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) {
                throw new Error(`Failed to acknowledge alert: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error acknowledging alert:', error);
            throw error;
        }
    }

    async resolveAlert(alertId: string, userId: string, resolution: string): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/predictions/alerts/${alertId}/resolve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, resolution })
            });

            if (!response.ok) {
                throw new Error(`Failed to resolve alert: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error resolving alert:', error);
            throw error;
        }
    }

    // User Feedback
    async submitFeedback(feedback: UserFeedback): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/feedback`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(feedback)
            });

            if (!response.ok) {
                throw new Error(`Failed to submit feedback: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            throw error;
        }
    }

    // Anomaly Detection
    async getAnomalies(filters?: {
        equipmentId?: string;
        severity?: string[];
        timeRange?: string;
    }): Promise<AnomalyDetection[]> {
        try {
            const queryParams = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) {
                        if (Array.isArray(value)) {
                            value.forEach(v => queryParams.append(key, v));
                        } else {
                            queryParams.append(key, value);
                        }
                    }
                });
            }

            const response = await fetch(`${this.baseUrl}/anomalies?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch anomalies: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching anomalies:', error);
            throw error;
        }
    }

    // Historical Trends
    async getHistoricalTrends(
        equipmentId: string,
        metric: string,
        timeRange: string
    ): Promise<HistoricalTrend> {
        try {
            // Handle 'all' equipment case
            const url = equipmentId === 'all'
                ? `${this.baseUrl}/trends/all/${metric}?timeRange=${timeRange}`
                : `${this.baseUrl}/trends/${equipmentId}/${metric}?timeRange=${timeRange}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch historical trends: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching historical trends:', error);

            // Return mock data when backend is not available
            const now = new Date();
            const dataPoints = [];

            // Generate mock historical data
            for (let i = 30; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const baseValue = 50 + Math.sin(i * 0.2) * 20 + Math.random() * 10;
                const isAnomaly = Math.random() < 0.05;
                const anomalyValue = baseValue + (Math.random() > 0.5 ? 30 : -30);

                dataPoints.push({
                    timestamp: date.toISOString(),
                    value: isAnomaly ? anomalyValue : baseValue,
                    predicted: i <= 7 ? baseValue + Math.random() * 5 : undefined,
                    upperBound: i <= 7 ? baseValue + 15 : undefined,
                    lowerBound: i <= 7 ? baseValue - 15 : undefined,
                    anomaly: isAnomaly
                });
            }

            return {
                equipmentId,
                metric,
                timeRange,
                dataPoints,
                statistics: {
                    mean: 50,
                    std: 15,
                    min: 20,
                    max: 80,
                    trend: 'stable' as const,
                    trendSlope: 0.02
                }
            };
        }
    }

    // Prescriptive Analytics
    async getPrescriptiveRecommendations(equipmentId?: string): Promise<PrescriptiveRecommendation[]> {
        try {
            const url = equipmentId
                ? `${this.baseUrl}/recommendations?equipmentId=${equipmentId}`
                : `${this.baseUrl}/recommendations`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            throw error;
        }
    }

    async approveRecommendation(recommendationId: string, userId: string): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/recommendations/${recommendationId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) {
                throw new Error(`Failed to approve recommendation: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error approving recommendation:', error);
            throw error;
        }
    }

    // Scenario Simulation
    async createScenarioSimulation(simulation: Omit<ScenarioSimulation, 'id' | 'createdAt' | 'status'>): Promise<ScenarioSimulation> {
        try {
            const response = await fetch(`${this.baseUrl}/scenarios`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(simulation)
            });

            if (!response.ok) {
                throw new Error(`Failed to create scenario simulation: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating scenario simulation:', error);
            throw error;
        }
    }

    async getScenarioSimulation(simulationId: string): Promise<ScenarioSimulation> {
        try {
            const response = await fetch(`${this.baseUrl}/scenarios/${simulationId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch scenario simulation: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching scenario simulation:', error);
            throw error;
        }
    }

    // Asset Drilldown
    async getAssetDrilldown(equipmentId: string): Promise<AssetDrilldown> {
        try {
            const response = await fetch(`${this.baseUrl}/assets/${equipmentId}/drilldown`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch asset drilldown: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching asset drilldown:', error);
            throw error;
        }
    }

    // IoT Devices
    async getIoTDevices(): Promise<IoTDevice[]> {
        try {
            const response = await fetch(`${this.baseUrl}/iot/devices`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch IoT devices: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching IoT devices:', error);
            throw error;
        }
    }

    // Real-time Data
    async getLatestSensorData(equipmentId: string): Promise<SensorData[]> {
        try {
            const response = await fetch(`${this.baseUrl}/sensors/${equipmentId}/latest`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch sensor data: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching sensor data:', error);
            throw error;
        }
    }

    // Notifications
    async getNotifications(filters?: {
        type?: string[];
        severity?: string[];
        status?: string[];
    }): Promise<Notification[]> {
        try {
            // Mock data for testing
            const mockNotifications: Notification[] = [
                {
                    id: 'notif-1',
                    type: 'alert',
                    severity: 'critical',
                    title: 'Critical Alert: Motor Overheating',
                    message: 'Drive Motor Unit temperature exceeds critical threshold',
                    equipmentId: 'EQ-MOTOR-002',
                    alertId: 'alert-2',
                    recipients: ['maintenance-team', 'supervisor'],
                    channels: ['email', 'push'],
                    status: 'sent',
                    createdAt: new Date().toISOString(),
                    sentAt: new Date().toISOString(),
                    escalationLevel: 3
                },
                {
                    id: 'notif-2',
                    type: 'anomaly',
                    severity: 'high',
                    title: 'Anomaly Detected: Vibration Pattern',
                    message: 'Unusual vibration pattern detected on Main Water Pump',
                    equipmentId: 'EQ-PUMP-001',
                    alertId: 'anomaly-1',
                    recipients: ['maintenance-team'],
                    channels: ['email', 'in-app'],
                    status: 'delivered',
                    createdAt: new Date().toISOString(),
                    sentAt: new Date().toISOString(),
                    readAt: new Date().toISOString(),
                    readBy: ['tech-john'],
                    escalationLevel: 2
                },
                {
                    id: 'notif-3',
                    type: 'recommendation',
                    severity: 'medium',
                    title: 'Maintenance Recommendation',
                    message: 'Schedule bearing replacement for Secondary Water Pump',
                    equipmentId: 'EQ-PUMP-003',
                    recipients: ['maintenance-team'],
                    channels: ['in-app'],
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    escalationLevel: 1
                }
            ];

            return mockNotifications;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) {
                throw new Error(`Failed to mark notification as read: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    // Escalation Workflows
    async getEscalationWorkflows(alertId?: string): Promise<EscalationWorkflow[]> {
        try {
            const url = alertId
                ? `${this.baseUrl}/escalations?alertId=${alertId}`
                : `${this.baseUrl}/escalations`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch escalation workflows: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching escalation workflows:', error);
            throw error;
        }
    }

    async escalateAlert(alertId: string, level: number, userId: string, notes?: string): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/escalations/${alertId}/escalate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ level, userId, notes })
            });

            if (!response.ok) {
                throw new Error(`Failed to escalate alert: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error escalating alert:', error);
            throw error;
        }
    }

    // ML Pipeline
    async getMLPipelines(): Promise<MLPipelineManagement[]> {
        try {
            const response = await fetch(`${this.baseUrl}/ml-pipelines`);
            if (!response.ok) throw new Error('Failed to fetch ML pipelines');
            return await response.json();
        } catch (error) {
            console.error('Error fetching ML pipelines:', error);
            return [
                {
                    id: 'pipeline_001',
                    name: 'Equipment Failure Prediction Pipeline',
                    description: 'End-to-end ML pipeline for predicting equipment failures',
                    version: '2.1.0',
                    status: 'active',
                    configuration: {
                        dataSources: [
                            {
                                id: 'source_001',
                                name: 'Equipment Sensors',
                                type: 'stream',
                                connection: { url: 'kafka://sensors.company.com', topic: 'equipment_data' },
                                schema: { vibration: 'float', temperature: 'float', pressure: 'float' }
                            }
                        ],
                        preprocessing: {
                            steps: [
                                {
                                    name: 'Data Cleaning',
                                    type: 'cleaning',
                                    config: { remove_outliers: true, fill_missing: 'interpolate' },
                                    order: 1
                                },
                                {
                                    name: 'Feature Engineering',
                                    type: 'feature_engineering',
                                    config: { window_size: 60, features: ['rms', 'peak', 'crest_factor'] },
                                    order: 2
                                }
                            ]
                        },
                        modelTraining: {
                            algorithm: 'random_forest',
                            hyperparameters: { n_estimators: 100, max_depth: 10 },
                            validationStrategy: 'time_series_split',
                            evaluationMetrics: ['accuracy', 'precision', 'recall', 'f1']
                        },
                        deployment: {
                            environment: 'production',
                            scaling: 'auto',
                            resources: { cpu: 2, memory: 4, gpu: 0 }
                        }
                    },
                    stages: [
                        {
                            id: 'stage_001',
                            name: 'Data Ingestion',
                            type: 'data_ingestion',
                            status: 'completed',
                            progress: 100,
                            startTime: '2024-01-15T09:00:00Z',
                            endTime: '2024-01-15T09:05:00Z',
                            duration: 300,
                            artifacts: [
                                {
                                    name: 'raw_data.parquet',
                                    type: 'parquet',
                                    location: 's3://data-lake/raw/2024-01-15/',
                                    size: 1024000
                                }
                            ],
                            metrics: { records_processed: 100000, data_quality: 0.95 },
                            dependencies: []
                        }
                    ],
                    monitoring: {
                        health: {
                            status: 'healthy',
                            lastCheck: '2024-01-15T10:00:00Z',
                            uptime: 0.99,
                            errorRate: 0.01
                        },
                        performance: {
                            latency: 150,
                            throughput: 1000,
                            resourceUsage: { cpu: 0.65, memory: 0.45, disk: 0.30 }
                        },
                        dataQuality: {
                            completeness: 0.98,
                            accuracy: 0.95,
                            consistency: 0.97,
                            timeliness: 0.99,
                            validity: 0.96
                        },
                        modelDrift: {
                            dataDrift: 0.05,
                            conceptDrift: 0.03,
                            performanceDrift: 0.02,
                            lastDriftCheck: '2024-01-15T09:00:00Z'
                        },
                        alerts: [
                            {
                                id: 'alert_001',
                                type: 'data_quality',
                                severity: 'medium',
                                message: 'Data completeness dropped to 95%',
                                timestamp: '2024-01-15T09:30:00Z',
                                status: 'acknowledged'
                            }
                        ]
                    },
                    performance: {
                        accuracy: 0.92,
                        precision: 0.89,
                        recall: 0.94,
                        f1Score: 0.91,
                        auc: 0.95,
                        mse: 0.08,
                        mae: 0.12,
                        rmse: 0.28,
                        trainingTime: 1800,
                        inferenceTime: 50,
                        modelSize: 25.6,
                        version: '2.1.0',
                        lastUpdated: '2024-01-15T09:00:00Z'
                    },
                    deployment: {
                        environment: 'production',
                        status: 'deployed',
                        version: '2.1.0',
                        deployedAt: '2024-01-15T08:00:00Z',
                        deployedBy: 'ml_engineer_1',
                        endpoints: [
                            {
                                name: 'prediction_api',
                                url: 'https://api.company.com/predict',
                                method: 'POST',
                                status: 'active'
                            }
                        ],
                        scaling: {
                            minInstances: 2,
                            maxInstances: 10,
                            currentInstances: 3,
                            targetInstances: 3
                        }
                    },
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-15T10:00:00Z',
                    createdBy: 'ml_engineer_1'
                }
            ];
        }
    }

    // Data Quality
    async getDataQuality(equipmentId: string): Promise<DataQuality> {
        try {
            const response = await fetch(`${this.baseUrl}/data-quality/${equipmentId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch data quality: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching data quality:', error);
            throw error;
        }
    }

    // Real-time streaming methods
    subscribeToSensorData(equipmentId: string, callback: (data: SensorData) => void): void {
        this.realTimeConnection.subscribe('sensor', (data) => {
            if (data.equipmentId === equipmentId) {
                callback(data);
            }
        });
    }

    subscribeToPredictions(equipmentId: string, callback: (data: PredictiveAlert) => void): void {
        this.realTimeConnection.subscribe('prediction', (data) => {
            if (data.equipmentId === equipmentId) {
                callback(data);
            }
        });
    }

    subscribeToAlerts(callback: (data: PredictiveAlert) => void): void {
        this.realTimeConnection.subscribe('alert', callback);
    }

    subscribeToAnomalies(callback: (data: AnomalyDetection) => void): void {
        this.realTimeConnection.subscribe('anomaly', callback);
    }

    subscribeToModelStatus(callback: (data: MLModel) => void): void {
        this.realTimeConnection.subscribe('model', callback);
    }

    // Cleanup
    disconnect(): void {
        this.realTimeConnection.disconnect();
    }

    // Additional methods for AdvancedPredictiveAnalytics
    async getWeibullAnalysis(equipmentId?: string): Promise<WeibullAnalysis[]> {
        try {
            // Mock data for testing
            const mockWeibullData: WeibullAnalysis[] = [
                {
                    id: 'weibull-1',
                    equipmentId: 'EQ-PUMP-001',
                    equipmentName: 'Main Water Pump',
                    shapeParameter: 2.5,
                    scaleParameter: 5000,
                    locationParameter: 0,
                    confidenceInterval: {
                        lower: 2.1,
                        upper: 2.9
                    },
                    goodnessOfFit: {
                        rSquared: 0.95,
                        kolmogorovSmirnov: 0.045,
                        andersonDarling: 0.32
                    },
                    failureData: [
                        { timestamp: '2024-01-15', failureType: 'Bearing Failure', operatingHours: 4800 },
                        { timestamp: '2024-06-20', failureType: 'Seal Failure', operatingHours: 5200 }
                    ],
                    predictedRUL: 168,
                    confidence: 0.89,
                    lastUpdated: new Date().toISOString()
                }
            ];

            return mockWeibullData;
        } catch (error) {
            console.error('Error fetching Weibull analysis:', error);
            throw error;
        }
    }

    async getHealthScores(equipmentId?: string): Promise<HealthScore[]> {
        try {
            // Mock data for testing
            const mockHealthScores: HealthScore[] = [
                {
                    id: 'health-1',
                    assetId: 'EQ-PUMP-001',
                    assetName: 'Main Water Pump',
                    score: 65,
                    componentScores: {
                        vibration: 45,
                        temperature: 70,
                        pressure: 85,
                        oil: 60,
                        alignment: 80
                    },
                    trend: 'declining',
                    lastUpdated: new Date().toISOString(),
                    predictedFailureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    confidence: 0.89,
                    riskLevel: 'high'
                },
                {
                    id: 'health-2',
                    assetId: 'EQ-MOTOR-002',
                    assetName: 'Drive Motor Unit',
                    score: 35,
                    componentScores: {
                        vibration: 30,
                        temperature: 25,
                        pressure: 90,
                        oil: 85,
                        alignment: 75
                    },
                    trend: 'declining',
                    lastUpdated: new Date().toISOString(),
                    predictedFailureDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                    confidence: 0.95,
                    riskLevel: 'critical'
                },
                {
                    id: 'health-3',
                    assetId: 'EQ-PUMP-003',
                    assetName: 'Secondary Water Pump',
                    score: 75,
                    componentScores: {
                        vibration: 80,
                        temperature: 85,
                        pressure: 70,
                        oil: 60,
                        alignment: 90
                    },
                    trend: 'stable',
                    lastUpdated: new Date().toISOString(),
                    predictedFailureDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    confidence: 0.76,
                    riskLevel: 'medium'
                }
            ];

            return mockHealthScores;
        } catch (error) {
            console.error('Error fetching health scores:', error);
            throw error;
        }
    }

    async getMaintenanceOptimization(equipmentId?: string): Promise<MaintenanceOptimization[]> {
        try {
            // Mock data for testing
            const mockOptimization: MaintenanceOptimization[] = [
                {
                    equipmentId: 'EQ-PUMP-001',
                    currentStrategy: 'preventive',
                    recommendedStrategy: 'predictive',
                    costSavings: 25000,
                    reliabilityImprovement: 15.5,
                    implementationTime: 30,
                    roi: 3.2,
                    riskReduction: 40,
                    lastUpdated: new Date().toISOString()
                }
            ];

            return mockOptimization;
        } catch (error) {
            console.error('Error fetching maintenance optimization:', error);
            throw error;
        }
    }

    async getRCFAAnalysis(equipmentId?: string): Promise<RCFAAnalysis[]> {
        try {
            // Mock data for testing
            const mockRCFA: RCFAAnalysis[] = [
                {
                    id: 'rcfa-1',
                    title: 'Pump Bearing Failure Analysis',
                    equipmentId: 'EQ-PUMP-001',
                    failureDate: '2024-06-15',
                    severity: 'high',
                    status: 'investigating',
                    immediateCauses: ['Elevated vibration >7.1 mm/s', 'Bearing overheating'],
                    contributingFactors: ['Insufficient lubrication', 'Misalignment'],
                    rootCauses: ['Inadequate maintenance schedule', 'Poor monitoring'],
                    fishboneAnalysis: {
                        people: ['Insufficient training'],
                        process: ['Inadequate procedures'],
                        equipment: ['Bearing wear', 'Misalignment'],
                        environment: ['High temperature'],
                        materials: ['Oil contamination'],
                        management: ['Resource constraints']
                    },
                    recommendedActions: [
                        {
                            id: 'action-1',
                            description: 'Implement predictive maintenance program',
                            priority: 'high',
                            status: 'pending',
                            assignedTo: 'Maintenance Team',
                            dueDate: '2024-07-15',
                            cost: 15000
                        }
                    ],
                    costImpact: 50000,
                    downtimeHours: 24,
                    createdAt: '2024-06-15',
                    updatedAt: '2024-06-20'
                }
            ];

            return mockRCFA;
        } catch (error) {
            console.error('Error fetching RCFA analysis:', error);
            throw error;
        }
    }

    async getPFMEAAnalysis(equipmentId?: string): Promise<PFMEAAnalysis[]> {
        try {
            // Mock data for testing
            const mockPFMEA: PFMEAAnalysis[] = [
                {
                    id: 'pfmea-1',
                    equipmentId: 'EQ-PUMP-001',
                    failureMode: 'Bearing Failure',
                    potentialEffect: 'Pump shutdown, production loss',
                    severity: 8,
                    potentialCauses: ['Insufficient lubrication', 'Misalignment', 'Overload'],
                    occurrence: 5,
                    currentControls: ['Preventive maintenance', 'Vibration monitoring'],
                    detection: 6,
                    rpn: 240,
                    recommendedActions: ['Implement predictive maintenance', 'Enhanced monitoring'],
                    responsibility: 'Maintenance Team',
                    targetDate: '2024-07-30',
                    status: 'open',
                    createdAt: '2024-06-01',
                    updatedAt: '2024-06-20'
                }
            ];

            return mockPFMEA;
        } catch (error) {
            console.error('Error fetching PFMEA analysis:', error);
            throw error;
        }
    }

    async getAnomalyDetection(equipmentId?: string): Promise<AnomalyDetection[]> {
        try {
            // Mock data for testing
            const mockAnomalies: AnomalyDetection[] = [
                {
                    id: 'anomaly-1',
                    equipmentId: 'EQ-PUMP-001',
                    timestamp: new Date().toISOString(),
                    anomalyType: 'point',
                    severity: 'high',
                    confidence: 0.92,
                    features: [
                        { name: 'vibration_rms', value: 6.8, anomalyScore: 0.95 },
                        { name: 'temperature', value: 78, anomalyScore: 0.87 },
                        { name: 'pressure', value: 16.5, anomalyScore: 0.73 }
                    ],
                    description: 'Unusual vibration pattern detected with elevated temperature',
                    recommendations: [
                        'Check bearing condition',
                        'Monitor temperature trend',
                        'Schedule maintenance inspection'
                    ],
                    status: 'detected'
                },
                {
                    id: 'anomaly-2',
                    equipmentId: 'EQ-MOTOR-002',
                    timestamp: new Date().toISOString(),
                    anomalyType: 'contextual',
                    severity: 'critical',
                    confidence: 0.98,
                    features: [
                        { name: 'temperature', value: 85, anomalyScore: 0.98 },
                        { name: 'current', value: 12.5, anomalyScore: 0.94 },
                        { name: 'vibration', value: 8.2, anomalyScore: 0.91 }
                    ],
                    description: 'Critical temperature anomaly with motor overload',
                    recommendations: [
                        'Immediate shutdown required',
                        'Check cooling system',
                        'Inspect motor windings'
                    ],
                    status: 'detected'
                }
            ];

            return mockAnomalies;
        } catch (error) {
            console.error('Error fetching anomaly detection:', error);
            throw error;
        }
    }

    async getPrescriptiveActions(equipmentId?: string): Promise<PrescriptiveAction[]> {
        try {
            // Mock data for testing
            const mockPrescriptive: PrescriptiveAction[] = [
                {
                    id: 'prescriptive-1',
                    equipmentId: 'EQ-PUMP-001',
                    type: 'maintenance',
                    priority: 'high',
                    confidence: 0.89,
                    impact: {
                        costSavings: 25000,
                        riskReduction: 40,
                        reliabilityImprovement: 15.5,
                        downtimeReduction: 60
                    },
                    recommendation: 'Schedule bearing replacement within 48 hours',
                    rationale: 'High vibration levels indicate bearing wear',
                    alternatives: [
                        {
                            action: 'Continue monitoring',
                            impact: { cost: 5000, risk: 80, reliability: 5 }
                        }
                    ],
                    optimalTiming: {
                        recommendedDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
                        urgency: 'soon',
                        constraints: ['Available parts', 'Technician availability']
                    },
                    implementation: {
                        estimatedDuration: 4,
                        requiredResources: ['Bearing replacement kit', 'Technician'],
                        prerequisites: ['Shutdown approval', 'Parts availability'],
                        estimatedCost: 5000
                    },
                    status: 'pending',
                    createdAt: new Date().toISOString()
                }
            ];

            return mockPrescriptive;
        } catch (error) {
            console.error('Error fetching prescriptive actions:', error);
            throw error;
        }
    }

    async getUserFeedback(predictionId?: string): Promise<UserFeedback[]> {
        try {
            // Mock data for testing
            const mockFeedback: UserFeedback[] = [
                {
                    predictionId: 'pred-1',
                    userId: 'tech-john',
                    feedback: 'correct',
                    actualOutcome: 'failure',
                    actualFailureTime: '2024-06-20',
                    comments: 'Prediction was accurate, bearing failed as expected',
                    timestamp: new Date().toISOString(),
                    impact: 'high'
                }
            ];

            return mockFeedback;
        } catch (error) {
            console.error('Error fetching user feedback:', error);
            throw error;
        }
    }

    async submitUserFeedback(feedback: Omit<UserFeedback, 'id' | 'timestamp'>): Promise<UserFeedback> {
        try {
            // Mock implementation - in real app, this would submit to API
            const newFeedback: UserFeedback = {
                ...feedback,
                timestamp: new Date().toISOString()
            };

            console.log('Mock: User feedback submitted:', newFeedback);
            return newFeedback;
        } catch (error) {
            console.error('Error submitting user feedback:', error);
            throw error;
        }
    }

    async acknowledgeNotification(notificationId: string): Promise<void> {
        try {
            // Mock implementation - in real app, this would update via API
            console.log('Mock: Notification acknowledged:', notificationId);
        } catch (error) {
            console.error('Error acknowledging notification:', error);
            throw error;
        }
    }

    // Real-time data subscription
    subscribeToRealTimeData(): any {
        // Create a mock event emitter for real-time data
        const eventEmitter = {
            on: (event: string, callback: (data: any) => void) => {
                // Mock implementation - in real app, this would connect to WebSocket
                if (event === 'data') {
                    // Simulate real-time data updates
                    setInterval(() => {
                        const mockData: RealTimeData = {
                            id: Math.random().toString(36).substr(2, 9),
                            assetId: 'asset-1',
                            assetName: 'Pump Station 1',
                            timestamp: new Date().toISOString(),
                            sensorType: 'vibration',
                            value: Math.random() * 100,
                            unit: 'mm/s',
                            threshold: 50,
                            status: 'normal',
                            trend: 'stable',
                            quality: 'good'
                        };
                        callback(mockData);
                    }, 5000); // Update every 5 seconds
                }
            },
            disconnect: () => {
                console.log('Real-time stream disconnected');
            }
        };

        return eventEmitter;
    }

    // Advanced Prescriptive Analytics Methods
    async getAdvancedPrescriptiveAnalytics(equipmentId: string): Promise<AdvancedPrescriptiveAnalytics[]> {
        try {
            const response = await fetch(`${this.baseUrl}/prescriptive-advanced/${equipmentId}`);
            if (!response.ok) throw new Error('Failed to fetch advanced prescriptive analytics');
            return await response.json();
        } catch (error) {
            console.error('Error fetching advanced prescriptive analytics:', error);
            return [
                {
                    id: 'presc_001',
                    equipmentId: 'EQ-PUMP-001',
                    analysisType: 'optimization',
                    priority: 'high',
                    confidence: 0.88,
                    optimization: {
                        objective: 'minimize_cost',
                        constraints: {
                            budget: 50000,
                            timeWindow: '30 days',
                            resourceAvailability: ['technician_1', 'technician_2'],
                            technicalConstraints: ['safety_requirements', 'operational_constraints']
                        },
                        variables: [
                            {
                                name: 'maintenance_frequency',
                                type: 'continuous',
                                minValue: 1,
                                maxValue: 12,
                                currentValue: 6,
                                optimalValue: 4
                            },
                            {
                                name: 'inspection_intensity',
                                type: 'discrete',
                                minValue: 1,
                                maxValue: 5,
                                currentValue: 3,
                                optimalValue: 4
                            }
                        ],
                        results: {
                            optimalSolution: { maintenance_frequency: 4, inspection_intensity: 4 },
                            objectiveValue: 35000,
                            constraintViolations: [],
                            sensitivityAnalysis: [
                                { variable: 'maintenance_frequency', sensitivity: 0.15 },
                                { variable: 'inspection_intensity', sensitivity: 0.08 }
                            ]
                        }
                    },
                    scenarios: [
                        {
                            id: 'scenario_001',
                            name: 'Aggressive Maintenance',
                            description: 'Increase maintenance frequency and inspection intensity',
                            assumptions: [
                                { parameter: 'maintenance_frequency', value: 8, unit: 'per_year' },
                                { parameter: 'inspection_intensity', value: 5, unit: 'scale_1_5' }
                            ],
                            outcomes: {
                                cost: 45000,
                                reliability: 0.95,
                                downtime: 24,
                                efficiency: 0.92,
                                risk: 0.05
                            },
                            probability: 0.3,
                            impact: 'high',
                            recommendations: ['Implement gradually', 'Monitor performance closely']
                        }
                    ],
                    whatIfAnalysis: {
                        baseScenario: {
                            cost: 40000,
                            reliability: 0.90,
                            downtime: 48
                        },
                        scenarios: [
                            {
                                name: '20% Budget Increase',
                                changes: [{ parameter: 'budget', change: 20, unit: 'percent' }],
                                outcomes: {
                                    cost: 48000,
                                    reliability: 0.93,
                                    downtime: 36,
                                    changeFromBase: { cost: 8000, reliability: 0.03, downtime: -12 }
                                }
                            }
                        ]
                    },
                    multiObjective: {
                        objectives: [
                            { name: 'cost', weight: 0.4, direction: 'minimize', currentValue: 40000, targetValue: 30000 },
                            { name: 'reliability', weight: 0.4, direction: 'maximize', currentValue: 0.90, targetValue: 0.95 },
                            { name: 'downtime', weight: 0.2, direction: 'minimize', currentValue: 48, targetValue: 24 }
                        ],
                        paretoFront: {
                            solutions: [
                                { maintenance_frequency: 4, inspection_intensity: 4 },
                                { maintenance_frequency: 5, inspection_intensity: 3 },
                                { maintenance_frequency: 3, inspection_intensity: 5 }
                            ],
                            objectiveValues: [
                                [35000, 0.92, 36],
                                [38000, 0.94, 30],
                                [32000, 0.89, 42]
                            ]
                        },
                        selectedSolution: 0,
                        tradeOffAnalysis: [
                            { objective1: 'cost', objective2: 'reliability', tradeOff: 0.15 },
                            { objective1: 'reliability', objective2: 'downtime', tradeOff: 0.08 }
                        ]
                    },
                    riskAssessment: {
                        riskFactors: [
                            {
                                factor: 'Equipment Age',
                                probability: 0.7,
                                impact: 0.8,
                                riskScore: 0.56,
                                mitigation: 'Implement condition monitoring'
                            },
                            {
                                factor: 'Operating Conditions',
                                probability: 0.5,
                                impact: 0.6,
                                riskScore: 0.30,
                                mitigation: 'Optimize operating parameters'
                            }
                        ],
                        overallRisk: 0.43,
                        riskLevel: 'medium',
                        riskTrend: 'decreasing',
                        riskMitigationPlan: [
                            {
                                action: 'Implement predictive maintenance',
                                cost: 15000,
                                effectiveness: 0.8,
                                timeline: '3 months'
                            }
                        ]
                    },
                    implementationPlan: {
                        phases: [
                            {
                                phase: 'Planning',
                                duration: 14,
                                activities: [
                                    {
                                        activity: 'Define requirements',
                                        duration: 5,
                                        dependencies: [],
                                        resources: ['project_manager'],
                                        cost: 5000
                                    }
                                ],
                                milestones: [
                                    {
                                        milestone: 'Requirements approved',
                                        date: '2024-02-15',
                                        criteria: ['stakeholder_approval', 'budget_approved']
                                    }
                                ]
                            }
                        ],
                        totalCost: 35000,
                        totalDuration: 90,
                        criticalPath: ['planning', 'implementation', 'testing'],
                        resourceRequirements: [
                            {
                                resource: 'technician',
                                quantity: 2,
                                availability: 'full_time'
                            }
                        ]
                    },
                    createdAt: '2024-01-15T10:00:00Z',
                    status: 'approved'
                }
            ];
        }
    }

    // Enhanced Notification Workflow Methods
    async getNotificationWorkflows(): Promise<EnhancedNotificationWorkflow[]> {
        try {
            const response = await fetch(`${this.baseUrl}/notification-workflows`);
            if (!response.ok) throw new Error('Failed to fetch notification workflows');
            return await response.json();
        } catch (error) {
            console.error('Error fetching notification workflows:', error);
            return [
                {
                    id: 'workflow_001',
                    name: 'Critical Equipment Alert Workflow',
                    description: 'Automated escalation for critical equipment failures',
                    triggerConditions: [
                        {
                            id: 'trigger_001',
                            type: 'threshold',
                            conditions: [
                                { metric: 'vibration_rms', operator: 'gt', value: 50, duration: 5 }
                            ],
                            logic: 'AND',
                            cooldown: 30,
                            enabled: true
                        }
                    ],
                    escalationRules: [
                        {
                            level: 1,
                            delay: 5,
                            recipients: ['operator_1', 'supervisor_1'],
                            channels: ['email', 'sms'],
                            actions: ['acknowledge_alert'],
                            conditions: [],
                            autoEscalate: true
                        },
                        {
                            level: 2,
                            delay: 15,
                            recipients: ['manager_1', 'maintenance_team'],
                            channels: ['email', 'sms', 'push'],
                            actions: ['initiate_maintenance'],
                            conditions: [],
                            autoEscalate: true
                        }
                    ],
                    notificationTemplates: [
                        {
                            id: 'template_001',
                            name: 'Critical Alert Email',
                            type: 'email',
                            subject: 'Critical Equipment Alert - {equipment_name}',
                            body: 'Critical alert detected for {equipment_name}. Vibration levels: {vibration_value}. Immediate action required.',
                            variables: ['equipment_name', 'vibration_value'],
                            priority: 'urgent'
                        }
                    ],
                    recipients: [
                        {
                            id: 'recipient_001',
                            name: 'John Operator',
                            email: 'john.operator@company.com',
                            phone: '+1234567890',
                            roles: ['operator'],
                            preferences: {
                                email: true,
                                sms: true,
                                push: false,
                                inApp: true,
                                quietHours: { start: '22:00', end: '06:00' }
                            },
                            escalationLevel: 1
                        }
                    ],
                    channels: [
                        {
                            id: 'channel_001',
                            type: 'email',
                            config: { smtp_server: 'smtp.company.com', port: 587 },
                            status: 'active',
                            lastTest: '2024-01-15T10:00:00Z',
                            deliveryRate: 0.98
                        }
                    ],
                    status: 'active',
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-15T10:00:00Z'
                }
            ];
        }
    }

    async deployPipeline(pipelineId: string, environment: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/ml-pipelines/${pipelineId}/deploy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ environment })
            });
            return response.ok;
        } catch (error) {
            console.error('Error deploying pipeline:', error);
            return false;
        }
    }

    async retrainPipeline(pipelineId: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/ml-pipelines/${pipelineId}/retrain`, {
                method: 'POST'
            });
            return response.ok;
        } catch (error) {
            console.error('Error retraining pipeline:', error);
            return false;
        }
    }

    // Equipment-specific analytics functions
    async getEquipmentHealthScores(): Promise<HealthScore[]> {
        try {
            const response = await fetch(`${this.baseUrl}/health-scores`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.warn('Failed to fetch equipment health scores, using mock data:', error);

            // Generate health scores for actual equipment from asset registry
            return enhancedAssetData.map(asset => {
                const config = equipmentMonitoringConfig[asset.name as keyof typeof equipmentMonitoringConfig];
                const baseScore = Math.random() * 30 + 70; // 70-100 range
                const trend = Math.random() > 0.5 ? 'improving' : 'declining';
                const riskLevel = baseScore > 90 ? 'low' : baseScore > 75 ? 'medium' : 'high';

                return {
                    id: `health-${asset.id}`,
                    assetId: asset.id,
                    assetName: asset.name,
                    score: Math.round(baseScore),
                    componentScores: {
                        vibration: Math.round(Math.random() * 25 + 75),
                        temperature: Math.round(Math.random() * 20 + 80),
                        pressure: Math.round(Math.random() * 15 + 85),
                        oil: Math.round(Math.random() * 30 + 70),
                        alignment: Math.round(Math.random() * 10 + 90)
                    },
                    trend,
                    lastUpdated: new Date().toISOString(),
                    predictedFailureDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
                    confidence: Math.round(Math.random() * 15 + 85),
                    riskLevel
                };
            });
        }
    }

    async getEquipmentPredictiveAlerts(): Promise<PredictiveAlert[]> {
        try {
            const response = await fetch(`${this.baseUrl}/alerts`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.warn('Failed to fetch equipment predictive alerts, using mock data:', error);

            // Generate alerts for actual equipment
            const alerts: PredictiveAlert[] = [];

            enhancedAssetData.forEach(asset => {
                const config = equipmentMonitoringConfig[asset.name as keyof typeof equipmentMonitoringConfig];
                if (!config) return;

                // Generate 1-3 alerts per equipment
                const alertCount = Math.floor(Math.random() * 3) + 1;

                for (let i = 0; i < alertCount; i++) {
                    const alertTypes = ['vibration', 'temperature', 'pressure', 'oil', 'current'];
                    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
                    const severity = Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low';

                    alerts.push({
                        id: `alert-${asset.id}-${i}`,
                        equipmentId: asset.id,
                        equipmentName: asset.name,
                        alertType: alertType as any,
                        severity: severity as any,
                        confidence: Math.round(Math.random() * 20 + 80),
                        predictedFailureTime: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                        rulHours: Math.round(Math.random() * 5000 + 100),
                        currentValue: Math.random() * 10 + 2,
                        threshold: Math.random() * 8 + 3,
                        trend: Math.random() > 0.5 ? 'increasing' : 'stable',
                        recommendations: [
                            'Schedule maintenance inspection',
                            'Monitor condition closely',
                            'Check related components'
                        ],
                        status: 'active',
                        createdAt: new Date().toISOString(),
                        escalationLevel: severity === 'high' ? 2 : 1,
                        notificationSent: true
                    });
                }
            });

            return alerts;
        }
    }

    async getEquipmentWeibullAnalysis(): Promise<WeibullAnalysis[]> {
        try {
            const response = await fetch(`${this.baseUrl}/weibull-analysis`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.warn('Failed to fetch equipment Weibull analysis, using mock data:', error);

            // Generate Weibull analysis for actual equipment
            return enhancedAssetData.map(asset => {
                const config = equipmentMonitoringConfig[asset.name as keyof typeof equipmentMonitoringConfig];
                const weibullParams = config?.weibullParams || { shape: 3.0, scale: 10000 };

                return {
                    id: `weibull-${asset.id}`,
                    equipmentId: asset.id,
                    equipmentName: asset.name,
                    shapeParameter: weibullParams.shape,
                    scaleParameter: weibullParams.scale,
                    locationParameter: 0,
                    confidenceInterval: {
                        lower: weibullParams.shape * 0.9,
                        upper: weibullParams.shape * 1.1
                    },
                    goodnessOfFit: {
                        rSquared: 0.92 + Math.random() * 0.06,
                        kolmogorovSmirnov: 0.03 + Math.random() * 0.02,
                        andersonDarling: 0.25 + Math.random() * 0.15
                    },
                    failureData: [
                        {
                            timestamp: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
                            failureType: 'bearing_failure',
                            operatingHours: Math.round(weibullParams.scale * 0.8)
                        }
                    ],
                    predictedRUL: Math.round(weibullParams.scale * (0.5 + Math.random() * 0.5)),
                    confidence: 0.85 + Math.random() * 0.1,
                    lastUpdated: new Date().toISOString()
                };
            });
        }
    }

    async getEquipmentMaintenanceOptimization(): Promise<MaintenanceOptimization[]> {
        try {
            const response = await fetch(`${this.baseUrl}/maintenance-optimization`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.warn('Failed to fetch equipment maintenance optimization, using mock data:', error);

            // Generate maintenance optimization for actual equipment
            return enhancedAssetData.map(asset => {
                const config = equipmentMonitoringConfig[asset.name as keyof typeof equipmentMonitoringConfig];
                const currentStrategy = config?.maintenanceStrategy || 'preventive';
                const recommendedStrategy = currentStrategy === 'reactive' ? 'predictive' : 'prescriptive';

                return {
                    equipmentId: asset.id,
                    currentStrategy: currentStrategy as any,
                    recommendedStrategy: recommendedStrategy as any,
                    costSavings: Math.round(Math.random() * 50000 + 10000),
                    reliabilityImprovement: Math.round(Math.random() * 30 + 20),
                    implementationTime: Math.round(Math.random() * 30 + 15),
                    roi: Math.round(Math.random() * 200 + 100),
                    riskReduction: Math.round(Math.random() * 40 + 30),
                    lastUpdated: new Date().toISOString()
                };
            });
        }
    }

    async getEquipmentPrescriptiveActions(): Promise<PrescriptiveAction[]> {
        try {
            const response = await fetch(`${this.baseUrl}/prescriptive-actions`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.warn('Failed to fetch equipment prescriptive actions, using mock data:', error);

            // Generate prescriptive actions for actual equipment
            const actions: PrescriptiveAction[] = [];

            enhancedAssetData.forEach(asset => {
                const config = equipmentMonitoringConfig[asset.name as keyof typeof equipmentMonitoringConfig];
                if (!config) return;

                const actionTypes = ['maintenance', 'inspection', 'replacement', 'monitoring', 'optimization'];
                const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
                const priority = config.priority as any;

                actions.push({
                    id: `action-${asset.id}`,
                    equipmentId: asset.id,
                    type: actionType as any,
                    priority,
                    confidence: Math.round(Math.random() * 20 + 80),
                    impact: {
                        costSavings: Math.round(Math.random() * 30000 + 5000),
                        riskReduction: Math.round(Math.random() * 40 + 30),
                        reliabilityImprovement: Math.round(Math.random() * 25 + 15),
                        downtimeReduction: Math.round(Math.random() * 50 + 20)
                    },
                    recommendation: `Optimize ${asset.name} performance through ${actionType}`,
                    rationale: `Based on current condition and historical data analysis`,
                    alternatives: [
                        {
                            action: 'Continue current maintenance schedule',
                            impact: { cost: 0, risk: 0, reliability: 0 }
                        }
                    ],
                    optimalTiming: {
                        recommendedDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                        urgency: priority === 'critical' ? 'immediate' : priority === 'high' ? 'soon' : 'planned',
                        constraints: ['Resource availability', 'Production schedule']
                    },
                    implementation: {
                        estimatedDuration: Math.round(Math.random() * 10 + 5),
                        requiredResources: ['Technician', 'Spare parts'],
                        prerequisites: ['Safety review', 'Work permit'],
                        estimatedCost: Math.round(Math.random() * 15000 + 5000)
                    },
                    status: 'pending',
                    createdAt: new Date().toISOString()
                });
            });

            return actions;
        }
    }

    // Get equipment monitoring configuration
    getEquipmentMonitoringConfig(equipmentName: string) {
        return equipmentMonitoringConfig[equipmentName as keyof typeof equipmentMonitoringConfig];
    }

    // Get all equipment with monitoring configuration
    getMonitoredEquipment() {
        return enhancedAssetData.filter(asset =>
            equipmentMonitoringConfig[asset.name as keyof typeof equipmentMonitoringConfig]
        );
    }

    // Get equipment by category
    getEquipmentByCategory(category: string) {
        return enhancedAssetData.filter(asset => asset.category === category);
    }

    // Get critical equipment (high priority)
    getCriticalEquipment() {
        return enhancedAssetData.filter(asset => {
            const config = equipmentMonitoringConfig[asset.name as keyof typeof equipmentMonitoringConfig];
            return config?.priority === 'critical' || config?.priority === 'high';
        });
    }
}

// Create and export singleton instance
const mlService = new MLService(
    import.meta.env.VITE_ML_API_URL || 'http://localhost:8000/api/v1',
    import.meta.env.VITE_ML_API_KEY || 'demo-key'
);

export default mlService; 