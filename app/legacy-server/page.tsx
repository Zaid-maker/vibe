import { caller } from '@/trpc/server'
import React from 'react'

interface ServerData {
    greeting?: string
    timestamp?: string
    text?: string
    serverInfo?: {
        uptime?: string
        version?: string
        environment?: string
    }
}

interface ErrorDetails {
    message: string
    status?: number
    timestamp: string
    code?: string
}

interface MetricCardProps {
    title: string
    value: string
    icon: string
    color: 'green' | 'blue' | 'purple' | 'orange'
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => {
    const colorClasses = {
        green: 'from-green-50 to-emerald-50 border-green-200 text-green-800',
        blue: 'from-blue-50 to-cyan-50 border-blue-200 text-blue-800',
        purple: 'from-purple-50 to-violet-50 border-purple-200 text-purple-800',
        orange: 'from-orange-50 to-amber-50 border-orange-200 text-orange-800'
    }

    return (
        <div className={`bg-gradient-to-r ${colorClasses[color]} p-4 rounded-lg border`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm opacity-75">{title}</p>
                    <p className="text-lg font-semibold">{value}</p>
                </div>
                <span className="text-2xl">{icon}</span>
            </div>
        </div>
    )
}

const Page = async () => {
    try {
        const data: ServerData = await caller.hello({ text: "Zaid Server" })
        const loadTime = Date.now()

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="bg-white shadow-lg rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                                <h1 className="text-3xl font-bold text-gray-800">Legacy Server Dashboard</h1>
                            </div>
                            <div className="text-sm text-gray-500">
                                Last updated: {new Date().toLocaleTimeString()}
                            </div>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <MetricCard
                            title="Status"
                            value="Online"
                            icon="🟢"
                            color="green"
                        />
                        <MetricCard
                            title="Response Time"
                            value={`${Date.now() - loadTime}ms`}
                            icon="⚡"
                            color="blue"
                        />
                        <MetricCard
                            title="Environment"
                            value={data.serverInfo?.environment || "Production"}
                            icon="🌐"
                            color="purple"
                        />
                        <MetricCard
                            title="Version"
                            value={data.serverInfo?.version || "1.0.0"}
                            icon="📦"
                            color="orange"
                        />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Server Response */}
                        <div className="lg:col-span-2 bg-white shadow-lg rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="text-green-500 mr-2">✅</span>
                                Server Response
                            </h2>
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <pre className="text-sm text-gray-700 overflow-auto whitespace-pre-wrap max-h-64">
                                    {JSON.stringify(data, null, 2)}
                                </pre>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-gray-600">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                Data received successfully
                            </div>
                        </div>

                        {/* Server Details */}
                        <div className="bg-white shadow-lg rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="mr-2">🔧</span>
                                Server Details
                            </h3>
                            <div className="space-y-4">
                                <div className="border-b pb-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-gray-600 text-sm">Connection</span>
                                        <span className="text-green-600 font-medium text-sm">Stable</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full w-full"></div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 text-sm">Timestamp:</span>
                                        <span className="text-gray-800 font-mono text-sm">
                                            {data.timestamp || new Date().toISOString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 text-sm">Message:</span>
                                        <span className="text-gray-800 text-sm">{data.greeting || 'None'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 text-sm">Uptime:</span>
                                        <span className="text-gray-800 text-sm">
                                            {data.serverInfo?.uptime || '99.9%'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-start">
                            <span className="text-blue-500 text-xl mr-3">💡</span>
                            <div>
                                <h4 className="text-blue-800 font-semibold mb-2">About This Dashboard</h4>
                                <p className="text-blue-700 text-sm">
                                    This enhanced legacy server dashboard demonstrates advanced server-side data fetching
                                    using tRPC with real-time metrics, improved error handling, and responsive design.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    } catch (error) {
        const errorDetails: ErrorDetails = {
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            status: (error as any)?.status || 500,
            timestamp: new Date().toISOString(),
            code: (error as any)?.code || 'INTERNAL_ERROR'
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white shadow-xl rounded-xl p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-red-500 text-2xl">⚠️</span>
                            </div>
                            <h1 className="text-3xl font-bold text-red-600 mb-2">Server Connection Error</h1>
                            <p className="text-gray-600">Unable to establish connection with the server</p>
                        </div>

                        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6 mb-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-red-600 font-medium text-sm">Error Message</span>
                                    <p className="text-red-800 mt-1">{errorDetails.message}</p>
                                </div>
                                <div>
                                    <span className="text-red-600 font-medium text-sm">Error Code</span>
                                    <p className="text-red-800 mt-1 font-mono">{errorDetails.code}</p>
                                </div>
                                <div>
                                    <span className="text-red-600 font-medium text-sm">Status Code</span>
                                    <p className="text-red-800 mt-1 font-mono">{errorDetails.status}</p>
                                </div>
                                <div>
                                    <span className="text-red-600 font-medium text-sm">Timestamp</span>
                                    <p className="text-red-800 mt-1 font-mono text-xs">{errorDetails.timestamp}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <h3 className="text-yellow-800 font-semibold mb-3 flex items-center">
                                <span className="mr-2">🔧</span>
                                Troubleshooting Steps
                            </h3>
                            <ul className="text-yellow-700 text-sm space-y-2">
                                <li>• Verify server is running and accessible</li>
                                <li>• Check tRPC configuration and endpoints</li>
                                <li>• Ensure network connectivity</li>
                                <li>• Review server logs for additional details</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Page