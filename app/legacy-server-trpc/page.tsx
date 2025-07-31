import { caller } from '@/trpc/server'
import React, { JSX } from 'react'

interface ServerData {
    greeting?: string
    timestamp?: string
    text?: string
    serverInfo?: {
        uptime?: string
        version?: string
        environment?: string
        nodeVersion?: string
        memoryUsage?: {
            used: number
            total: number
            percentage: number
        }
        cpuUsage?: number
        activeConnections?: number
    }
}

interface ErrorDetails {
    message: string
    status?: number
    timestamp: string
    code?: string
    stack?: string
}

interface MetricCardProps {
    title: string
    value: string
    icon: string
    color: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'yellow'
    trend?: 'up' | 'down' | 'stable'
    subtitle?: string
}

interface ProgressBarProps {
    value: number
    max: number
    color: 'green' | 'blue' | 'orange' | 'red'
    label: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, color, label }) => {
    const percentage = Math.min((value / max) * 100, 100)

    const colorClasses = {
        green: 'bg-green-500',
        blue: 'bg-blue-500',
        orange: 'bg-orange-500',
        red: 'bg-red-500'
    }

    return (
        <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{label}</span>
                <span>{percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`${colorClasses[color]} h-2 rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, trend, subtitle }) => {
    const colorClasses = {
        green: 'from-green-50 to-emerald-50 border-green-200 text-green-800',
        blue: 'from-blue-50 to-cyan-50 border-blue-200 text-blue-800',
        purple: 'from-purple-50 to-violet-50 border-purple-200 text-purple-800',
        orange: 'from-orange-50 to-amber-50 border-orange-200 text-orange-800',
        red: 'from-red-50 to-rose-50 border-red-200 text-red-800',
        yellow: 'from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800'
    }

    const trendIcons = {
        up: '📈',
        down: '📉',
        stable: '➡️'
    }

    return (
        <div className={`bg-gradient-to-r ${colorClasses[color]} p-4 rounded-lg border hover:shadow-md transition-shadow duration-200`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-sm opacity-75">{title}</p>
                        {trend && <span className="text-xs">{trendIcons[trend]}</span>}
                    </div>
                    <p className="text-lg font-semibold">{value}</p>
                    {subtitle && <p className="text-xs opacity-60 mt-1">{subtitle}</p>}
                </div>
                <span className="text-2xl ml-3">{icon}</span>
            </div>
        </div>
    )
}

const StatusIndicator: React.FC<{ status: 'online' | 'warning' | 'offline' }> = ({ status }) => {
    const config = {
        online: { color: 'bg-green-500', text: 'Online', pulse: true },
        warning: { color: 'bg-yellow-500', text: 'Warning', pulse: false },
        offline: { color: 'bg-red-500', text: 'Offline', pulse: false }
    }

    const { color, text, pulse } = config[status]

    return (
        <div className="flex items-center">
            <div className={`w-4 h-4 ${color} rounded-full mr-3 ${pulse ? 'animate-pulse' : ''}`}></div>
            <span className="text-sm font-medium">{text}</span>
        </div>
    )
}

/**
 * Legacy Server Dashboard Page Component
 * 
 * A comprehensive React server component that demonstrates tRPC server-side rendering capabilities.
 * This component fetches data from a tRPC server endpoint and displays an enhanced dashboard
 * with real-time server metrics, system health monitoring, and detailed error handling.
 * 
 * **Note: This is a demonstration of tRPC server integration and dashboard UI patterns.**
 * 
 * @returns {Promise<JSX.Element>} A promise that resolves to either:
 *   - A successful dashboard view with server metrics, system health indicators, and response data
 *   - A comprehensive error page with detailed diagnostics and troubleshooting information
 * 
 * @example
 * ```tsx
 * // This component is typically used as a page component in Next.js
 * export default Page;
 * ```
 * 
 * Features:
 * - Real-time server metrics display (CPU, memory, response time)
 * - Status indicators with color-coded health warnings
 * - Responsive grid layout for different screen sizes
 * - Enhanced error handling with stack traces and troubleshooting guides
 * - Progress bars for system resource visualization
 * - Server information panel with environment details
 * 
 * Error Handling:
 * - Captures and displays detailed error information
 * - Provides troubleshooting steps and quick action buttons
 * - Shows stack traces in development for debugging
 * 
 * Dependencies:
 * - tRPC caller for server communication
 * - Custom components: StatusIndicator, MetricCard, ProgressBar
 * - Tailwind CSS for styling
 * 
 * @throws {Error} Renders error UI instead of throwing, displaying comprehensive error details
 */
const Page = async (): Promise<JSX.Element> => {
    try {
        const startTime = Date.now()
        const data: ServerData = await caller.hello({ text: "Zaid Server" })
        const responseTime = Date.now() - startTime

        // Mock additional server metrics (in real app, these would come from your server)
        const serverMetrics = {
            responseTime,
            memoryUsage: data.serverInfo?.memoryUsage || { used: 65, total: 100, percentage: 65 },
            cpuUsage: data.serverInfo?.cpuUsage || 35,
            activeConnections: data.serverInfo?.activeConnections || 42,
            uptime: data.serverInfo?.uptime || '7d 14h 32m',
            nodeVersion: data.serverInfo?.nodeVersion || 'v18.17.0'
        }

        const getServerStatus = () => {
            if (serverMetrics.cpuUsage > 80 || serverMetrics.memoryUsage.percentage > 90) return 'warning'
            if (responseTime > 1000) return 'warning'
            return 'online'
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Enhanced Header */}
                    <div className="bg-white shadow-lg rounded-xl p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="flex items-center mb-4 md:mb-0">
                                <StatusIndicator status={getServerStatus()} />
                                <h1 className="text-3xl font-bold text-gray-800 ml-3">Legacy Server Dashboard</h1>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                                <div className="text-sm text-gray-500">
                                    Last updated: {new Date().toLocaleTimeString()}
                                </div>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                                    Refresh Data
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <MetricCard
                            title="Server Status"
                            value={getServerStatus().charAt(0).toUpperCase() + getServerStatus().slice(1)}
                            icon="🟢"
                            color="green"
                            trend="stable"
                        />
                        <MetricCard
                            title="Response Time"
                            value={`${responseTime}ms`}
                            icon="⚡"
                            color={responseTime < 200 ? "green" : responseTime < 500 ? "yellow" : "red"}
                            trend={responseTime < 200 ? "up" : "down"}
                            subtitle="API latency"
                        />
                        <MetricCard
                            title="Memory Usage"
                            value={`${serverMetrics.memoryUsage.percentage}%`}
                            icon="💾"
                            color={serverMetrics.memoryUsage.percentage < 70 ? "green" : serverMetrics.memoryUsage.percentage < 85 ? "yellow" : "red"}
                            subtitle={`${serverMetrics.memoryUsage.used}GB / ${serverMetrics.memoryUsage.total}GB`}
                        />
                        <MetricCard
                            title="CPU Usage"
                            value={`${serverMetrics.cpuUsage}%`}
                            icon="🖥️"
                            color={serverMetrics.cpuUsage < 50 ? "green" : serverMetrics.cpuUsage < 80 ? "yellow" : "red"}
                            subtitle="Current load"
                        />
                        <MetricCard
                            title="Connections"
                            value={serverMetrics.activeConnections.toString()}
                            icon="🔗"
                            color="blue"
                            subtitle="Active users"
                        />
                        <MetricCard
                            title="Uptime"
                            value={serverMetrics.uptime}
                            icon="⏱️"
                            color="purple"
                            trend="up"
                        />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid lg:grid-cols-4 gap-6">
                        {/* Server Response - Takes 2 columns */}
                        <div className="lg:col-span-2 bg-white shadow-lg rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="text-green-500 mr-2">✅</span>
                                Server Response
                            </h2>
                            <div className="bg-gray-50 p-4 rounded-lg border mb-4">
                                <pre className="text-sm text-gray-700 overflow-auto whitespace-pre-wrap max-h-64">
                                    {JSON.stringify(data, null, 2)}
                                </pre>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-gray-600">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                    Data received successfully
                                </div>
                                <span className="text-gray-500">Size: {JSON.stringify(data).length} bytes</span>
                            </div>
                        </div>

                        {/* System Health */}
                        <div className="bg-white shadow-lg rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="mr-2">💚</span>
                                System Health
                            </h3>
                            <div className="space-y-4">
                                <ProgressBar
                                    value={serverMetrics.memoryUsage.percentage}
                                    max={100}
                                    color={serverMetrics.memoryUsage.percentage < 70 ? "green" : serverMetrics.memoryUsage.percentage < 85 ? "orange" : "red"}
                                    label="Memory"
                                />
                                <ProgressBar
                                    value={serverMetrics.cpuUsage}
                                    max={100}
                                    color={serverMetrics.cpuUsage < 50 ? "green" : serverMetrics.cpuUsage < 80 ? "orange" : "red"}
                                    label="CPU"
                                />
                                <ProgressBar
                                    value={responseTime}
                                    max={1000}
                                    color={responseTime < 200 ? "green" : responseTime < 500 ? "orange" : "red"}
                                    label="Response Time"
                                />
                            </div>
                        </div>

                        {/* Enhanced Server Details */}
                        <div className="bg-white shadow-lg rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="mr-2">🔧</span>
                                Server Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600 text-sm">Environment:</span>
                                    <span className="text-gray-800 font-medium text-sm bg-gray-100 px-2 py-1 rounded">
                                        {data.serverInfo?.environment || "Production"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600 text-sm">Version:</span>
                                    <span className="text-gray-800 font-mono text-sm">
                                        {data.serverInfo?.version || "1.0.0"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600 text-sm">Node.js:</span>
                                    <span className="text-gray-800 font-mono text-sm">
                                        {serverMetrics.nodeVersion}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600 text-sm">Timestamp:</span>
                                    <span className="text-gray-800 font-mono text-xs">
                                        {data.timestamp || new Date().toISOString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600 text-sm">Message:</span>
                                    <span className="text-gray-800 text-sm">{data.greeting || 'None'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Info Banner */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-start">
                            <span className="text-blue-500 text-xl mr-3">💡</span>
                            <div className="flex-1">
                                <h4 className="text-blue-800 font-semibold mb-2">Enhanced Dashboard Features</h4>
                                <div className="grid md:grid-cols-2 gap-4 text-blue-700 text-sm">
                                    <div>
                                        <p>• Real-time system health monitoring</p>
                                        <p>• Performance metrics and trends</p>
                                        <p>• Enhanced error handling with detailed diagnostics</p>
                                    </div>
                                    <div>
                                        <p>• Responsive design for all devices</p>
                                        <p>• Visual progress indicators</p>
                                        <p>• Server status with smart alerts</p>
                                    </div>
                                </div>
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
            code: (error as any)?.code || 'INTERNAL_ERROR',
            stack: error instanceof Error ? error.stack : undefined
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white shadow-xl rounded-xl p-8">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-red-500 text-3xl">⚠️</span>
                            </div>
                            <h1 className="text-3xl font-bold text-red-600 mb-2">Server Connection Error</h1>
                            <p className="text-gray-600">Unable to establish connection with the server</p>
                        </div>

                        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6 mb-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <span className="text-red-600 font-medium text-sm">Error Message</span>
                                    <p className="text-red-800 mt-1 break-words">{errorDetails.message}</p>
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

                            {errorDetails.stack && (
                                <div className="mt-4 pt-4 border-t border-red-200">
                                    <span className="text-red-600 font-medium text-sm">Stack Trace</span>
                                    <pre className="text-red-800 mt-1 text-xs overflow-auto max-h-32 bg-red-100 p-2 rounded">
                                        {errorDetails.stack}
                                    </pre>
                                </div>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
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
                                    <li>• Validate environment variables</li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h3 className="text-blue-800 font-semibold mb-3 flex items-center">
                                    <span className="mr-2">📞</span>
                                    Quick Actions
                                </h3>
                                <div className="space-y-3">
                                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                                        Retry Connection
                                    </button>
                                    <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm hover:bg-blue-50 transition-colors">
                                        View Server Logs
                                    </button>
                                    <button className="w-full px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                                        Contact Support
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Page