import React from 'react';
import EnhancedMLPipelines from '@/components/maintenance/EnhancedMLPipelines';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RefreshCw, Settings, Info } from 'lucide-react';

const TestPage: React.FC = () => {
    const [isRunning, setIsRunning] = React.useState(false);
    const [testMode, setTestMode] = React.useState<'demo' | 'interactive'>('demo');

    const startTest = () => {
        setIsRunning(true);
        // Simulate test running
        setTimeout(() => setIsRunning(false), 3000);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Test Header */}
            <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Play className="h-5 w-5 text-blue-600" />
                        Enhanced ML Pipeline - Testing Environment
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                                Test Environment
                            </Badge>
                            <Badge variant="outline">
                                Simulated Data
                            </Badge>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={startTest}
                                disabled={isRunning}
                                className="flex items-center gap-2"
                            >
                                {isRunning ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Testing...
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-4 w-4" />
                                        Start Test
                                    </>
                                )}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setTestMode(testMode === 'demo' ? 'interactive' : 'demo')}
                                className="flex items-center gap-2"
                            >
                                <Settings className="h-4 w-4" />
                                {testMode === 'demo' ? 'Interactive Mode' : 'Demo Mode'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Test Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        How to Test the Enhanced Features
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">1. Risk Assessment Testing</h4>
                            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                <li>• Look for the "Interactive Testing Panel"</li>
                                <li>• Adjust the risk threshold slider</li>
                                <li>• Check risk score progress bars</li>
                                <li>• Review risk factors breakdown</li>
                            </ul>
                        </div>
                        <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">2. Maintenance Scheduling</h4>
                            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                                <li>• Test equipment filters</li>
                                <li>• Test maintenance type filters</li>
                                <li>• Check priority levels</li>
                                <li>• Click action buttons</li>
                            </ul>
                        </div>
                        <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                            <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">3. Data Visualization</h4>
                            <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                                <li>• Hover over charts</li>
                                <li>• Check risk distribution</li>
                                <li>• View cost-risk correlation</li>
                                <li>• Test chart interactions</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Enhanced ML Pipeline Component */}
            <EnhancedMLPipelines />
        </div>
    );
};

export default TestPage; 