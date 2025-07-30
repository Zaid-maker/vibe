'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Home } from "lucide-react";

const Page = () => {
  const trpc = useTRPC();
  const { data, isLoading, error, refetch } = useQuery(
    trpc.hello.queryOptions({ text: 'world' })
  );

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Home className="h-8 w-8" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to Vibe
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-md">
            Experience the power of modern web development with tRPC and React Query
          </p>
        </div>

        {/* Action Button */}
        <Button size="lg" className="px-8">
          Get Started
        </Button>

        {/* TRPC Data Card */}
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>API Response</span>
                </CardTitle>
                <CardDescription>
                  Real-time data from your tRPC endpoint
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
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
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
