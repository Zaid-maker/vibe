'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import {
  RefreshCw,
  Home,
  Zap,
  Database,
  Clock,
  CheckCircle,
  TrendingUp,
  Activity,
  Settings,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  Download,
  Copy,
  BarChart3,
  AlertTriangle,
  Info,
  Pause,
  Play
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

interface RequestMetrics {
  timestamp: number;
  responseTime: number;
  success: boolean;
}

interface PerformanceData {
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestHistory: RequestMetrics[];
}

const Page = () => {
  const trpc = useTRPC();
  const { theme, setTheme } = useTheme();
  const [queryText, setQueryText] = useState<string>('world');

  const { data, isLoading, error, refetch, dataUpdatedAt } = useQuery(
    trpc.hello.queryOptions({ text: queryText })
  );

  // Enhanced state management
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [requestCount, setRequestCount] = useState<number>(0);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [responseTime, setResponseTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [customInterval, setCustomInterval] = useState<number>(10);
  const [requestHistory, setRequestHistory] = useState<RequestMetrics[]>([]);

  const RATE_LIMIT_MS = 5000;
  const AUTO_REFRESH_INTERVAL = customInterval * 1000;
  const MAX_HISTORY_LENGTH = 50;

  // Memoized calculations for performance
  const performanceData = useMemo<PerformanceData>(() => {
    if (requestHistory.length === 0) {
      return {
        avgResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        requestHistory: []
      };
    }

    const responseTimes = requestHistory.map(r => r.responseTime);
    return {
      avgResponseTime: Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length),
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      requestHistory
    };
  }, [requestHistory]);

  const isRateLimited = timeLeft > 0;
  const progressValue = ((RATE_LIMIT_MS - timeLeft) / RATE_LIMIT_MS) * 100;
  const successRate = requestCount > 0 ? ((successCount / requestCount) * 100).toFixed(1) : '0.0';

  // Enhanced network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connection restored");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Connection lost");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Rate limiting timer with better precision
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => Math.max(0, prev - 100)), 100);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Enhanced auto refresh with pause functionality
  useEffect(() => {
    if (autoRefresh && !isRateLimited && isOnline && !isPaused) {
      const interval = setInterval(() => {
        handleRefresh();
      }, AUTO_REFRESH_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, timeLeft, isOnline, isPaused, AUTO_REFRESH_INTERVAL]);

  // Enhanced refresh handler with metrics tracking
  const handleRefresh = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefresh;

    if (timeSinceLastRefresh < RATE_LIMIT_MS) {
      const remaining = RATE_LIMIT_MS - timeSinceLastRefresh;
      setTimeLeft(remaining);
      toast.warning(`Rate limited. Wait ${Math.ceil(remaining / 1000)}s`);
      return;
    }

    setLastRefresh(now);
    setTimeLeft(0);
    setRequestCount(prev => prev + 1);

    const startTime = Date.now();
    try {
      await refetch();
      const currentResponseTime = Date.now() - startTime;
      setResponseTime(currentResponseTime);
      setSuccessCount(prev => prev + 1);

      // Update request history
      setRequestHistory(prev => {
        const newHistory = [...prev, {
          timestamp: now,
          responseTime: currentResponseTime,
          success: true
        }];
        return newHistory.slice(-MAX_HISTORY_LENGTH);
      });

      toast.success(`Request successful (${currentResponseTime}ms)`);
    } catch (err) {
      setErrorCount(prev => prev + 1);
      setRequestHistory(prev => {
        const newHistory = [...prev, {
          timestamp: now,
          responseTime: Date.now() - startTime,
          success: false
        }];
        return newHistory.slice(-MAX_HISTORY_LENGTH);
      });
      toast.error("Request failed");
    }
  }, [lastRefresh, refetch]);

  // Utility functions
  const formatTime = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  }, []);

  const getStatusColor = useCallback(() => {
    if (!isOnline) return 'text-red-500';
    if (error) return 'text-red-500';
    if (data) return 'text-green-500';
    return 'text-yellow-500';
  }, [isOnline, error, data]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy");
    }
  }, []);

  const exportData = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      data,
      metrics: {
        requestCount,
        successCount,
        errorCount,
        successRate,
        ...performanceData
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibe-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data exported");
  }, [data, requestCount, successCount, errorCount, successRate, performanceData]);

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900">
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Enhanced Header Section */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg animate-pulse">
                <Home className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Welcome to Vibe
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-lg">
              Experience the power of modern web development with enhanced monitoring, analytics, and real-time insights
            </p>

            {/* Enhanced Theme Toggle */}
            <div className="flex items-center justify-center space-x-2 pt-2">
              <Sun className="h-4 w-4" />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                aria-label="Toggle theme"
              />
              <Moon className="h-4 w-4" />
            </div>
          </div>

          {/* Network Status Alert */}
          {!isOnline && (
            <Alert variant="destructive" className="max-w-4xl">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                You're currently offline. Some features may not work properly.
              </AlertDescription>
            </Alert>
          )}

          {/* Enhanced Stats Cards with Tooltips */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl">
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="text-center transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center space-x-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <span className="text-2xl font-bold">{requestCount}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total API requests made since session started</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="text-center transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center space-x-2">
                      {isOnline ? (
                        <Wifi className={`h-5 w-5 ${getStatusColor()}`} />
                      ) : (
                        <WifiOff className="h-5 w-5 text-red-500" />
                      )}
                      <Badge variant={data && isOnline ? "default" : "destructive"}>
                        {data && isOnline ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Network Status</p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Current network connectivity status</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="text-center transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <span className="text-xl font-bold">{successRate}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Percentage of successful API requests</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="text-center transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center space-x-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <span className="text-xl font-bold">{performanceData.avgResponseTime}ms</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Average response time across all requests</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Enhanced Control Panel with Tabs */}
          <Card className="w-full max-w-4xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Control Panel</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="controls" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="controls">Controls</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="controls" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="query-text">Query Text</Label>
                      <Input
                        id="query-text"
                        value={queryText}
                        onChange={(e) => setQueryText(e.target.value)}
                        placeholder="Enter query text"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="refresh-interval">Auto Refresh Interval (seconds)</Label>
                      <Input
                        id="refresh-interval"
                        type="number"
                        min="5"
                        max="300"
                        value={customInterval}
                        onChange={(e) => setCustomInterval(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Auto Refresh</p>
                      <p className="text-xs text-muted-foreground">
                        Automatically refresh data every {customInterval} seconds
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPaused(!isPaused)}
                        disabled={!autoRefresh}
                      >
                        {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                      </Button>
                      <Switch
                        checked={autoRefresh}
                        onCheckedChange={setAutoRefresh}
                        disabled={!isOnline}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-green-600">{successCount}</p>
                      <p className="text-xs text-muted-foreground">Successful</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-red-600">{errorCount}</p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-600">
                        {dataUpdatedAt ? formatTime(dataUpdatedAt) : "Never"}
                      </p>
                      <p className="text-xs text-muted-foreground">Last Updated</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-600">
                        {autoRefresh && !isPaused ? 'ACTIVE' : autoRefresh ? 'PAUSED' : 'OFF'}
                      </p>
                      <p className="text-xs text-muted-foreground">Auto Mode</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{performanceData.minResponseTime}ms</p>
                        <p className="text-xs text-muted-foreground">Fastest Response</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{performanceData.avgResponseTime}ms</p>
                        <p className="text-xs text-muted-foreground">Average Response</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold text-orange-600">{performanceData.maxResponseTime}ms</p>
                        <p className="text-xs text-muted-foreground">Slowest Response</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Get Started
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={exportData}
              disabled={!data}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          {/* Enhanced TRPC Data Card */}
          <Card className="w-full max-w-4xl shadow-2xl border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>API Response</span>
                    {data && <Badge variant="secondary" className="animate-pulse">Live</Badge>}
                    {autoRefresh && !isPaused && <Badge variant="outline">Auto</Badge>}
                    {isPaused && <Badge variant="destructive">Paused</Badge>}
                  </CardTitle>
                  <CardDescription>
                    Real-time data from your tRPC endpoint with enhanced monitoring
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(data, null, 2))}
                      disabled={!data}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isLoading || isRateLimited || !isOnline}
                      className="transition-all hover:scale-105"
                    >
                      <RefreshCw
                        className={`h-4 w-4 transition-transform ${isLoading ? 'animate-spin' : ''}`}
                      />
                      <span className="ml-2 text-xs">
                        {isLoading
                          ? 'Loading...'
                          : isRateLimited
                            ? `Wait ${Math.ceil(timeLeft / 1000)}s`
                            : !isOnline
                              ? 'Offline'
                              : 'Refresh'
                        }
                      </span>
                    </Button>
                  </div>
                  {isRateLimited && (
                    <div className="w-24">
                      <Progress value={progressValue} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load data: {error.message}
                  </AlertDescription>
                </Alert>
              )}

              {data && !isLoading && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Response received successfully</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {responseTime}ms
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Query: "{queryText}"
                      </Badge>
                    </div>
                  </div>
                  <pre className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 p-4 rounded-lg text-sm overflow-auto border shadow-inner max-h-96">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div >
    </TooltipProvider >
  );
};

export default Page;
