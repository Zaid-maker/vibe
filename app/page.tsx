'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
  WifiOff
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const Page = () => {
  const trpc = useTRPC();
  const { theme, setTheme } = useTheme();
  const { data, isLoading, error, refetch, dataUpdatedAt } = useQuery(
    trpc.hello.queryOptions({ text: 'world' })
  );

  const [lastRefresh, setLastRefresh] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [requestCount, setRequestCount] = useState<number>(0);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [responseTime, setResponseTime] = useState<number>(0);
  
  const RATE_LIMIT_MS = 5000; // 5 seconds
  const AUTO_REFRESH_INTERVAL = 10000; // 10 seconds

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Rate limiting timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 100), 100);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Auto refresh functionality
  useEffect(() => {
    if (autoRefresh && !isRateLimited && isOnline) {
      const interval = setInterval(() => {
        handleRefresh();
      }, AUTO_REFRESH_INTERVAL);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, timeLeft, isOnline]);

  const handleRefresh = async () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefresh;

    if (timeSinceLastRefresh < RATE_LIMIT_MS) {
      setTimeLeft(RATE_LIMIT_MS - timeSinceLastRefresh);
      return;
    }

    setLastRefresh(now);
    setTimeLeft(0);
    setRequestCount(prev => prev + 1);
    
    const startTime = Date.now();
    try {
      await refetch();
      setResponseTime(Date.now() - startTime);
      setSuccessCount(prev => prev + 1);
    } catch (err) {
      setErrorCount(prev => prev + 1);
    }
  };

  const isRateLimited = timeLeft > 0;
  const progressValue = ((RATE_LIMIT_MS - timeLeft) / RATE_LIMIT_MS) * 100;
  const successRate = requestCount > 0 ? ((successCount / requestCount) * 100).toFixed(1) : '0.0';

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-500';
    if (error) return 'text-red-500';
    if (data) return 'text-green-500';
    return 'text-yellow-500';
  };

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900">
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Home className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to Vibe
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-lg">
            Experience the power of modern web development with tRPC, React Query, and real-time monitoring
          </p>
          
          {/* Theme Toggle */}
          <div className="flex items-center justify-center space-x-2 pt-2">
            <Sun className="h-4 w-4" />
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
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

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl">
          <Card className="text-center transition-all hover:shadow-lg hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">{requestCount}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
            </CardContent>
          </Card>
          
          <Card className="text-center transition-all hover:shadow-lg hover:scale-105">
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
          
          <Card className="text-center transition-all hover:shadow-lg hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-xl font-bold">{successRate}%</span>
              </div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </CardContent>
          </Card>
          
          <Card className="text-center transition-all hover:shadow-lg hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <span className="text-xl font-bold">{responseTime}ms</span>
              </div>
              <p className="text-sm text-muted-foreground">Response Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Control Panel</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Auto Refresh</p>
                <p className="text-xs text-muted-foreground">
                  Automatically refresh data every {AUTO_REFRESH_INTERVAL / 1000} seconds
                </p>
              </div>
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                disabled={!isOnline}
              />
            </div>
            
            <Separator />
            
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
                  {autoRefresh ? 'ON' : 'OFF'}
                </p>
                <p className="text-xs text-muted-foreground">Auto Mode</p>
              </div>
            </div>
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
            className="px-8 transition-all hover:scale-105"
          >
            <Activity className="h-4 w-4 mr-2" />
            View Analytics
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
                  {autoRefresh && <Badge variant="outline">Auto</Badge>}
                </CardTitle>
                <CardDescription>
                  Real-time data from your tRPC endpoint with enhanced monitoring
                </CardDescription>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading || isRateLimited || !isOnline}
                  className="transition-all hover:scale-105 cursor-pointer"
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
                  <Badge variant="outline" className="text-xs">
                    {responseTime}ms
                  </Badge>
                </div>
                <pre className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 p-4 rounded-lg text-sm overflow-auto border shadow-inner">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
