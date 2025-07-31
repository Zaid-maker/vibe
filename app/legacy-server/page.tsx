import { caller } from '@/trpc/server'
import React from 'react'

interface ServerData {
    greeting?: string
    timestamp?: string
    text?: string
}

interface ErrorDetails {
    message: string
    status?: number
    timestamp: string
}

const Page = async () => {
    try {
        const data: ServerData = await caller.hello({ text: "Zaid Server" })

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white shadow-xl rounded-xl p-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                            Legacy Server Dashboard
                        </h1>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                                <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                                    ✅ Server Response
                                </h2>
                                <div className="bg-white p-4 rounded border">
                                    <pre className="text-sm text-gray-700 overflow-auto whitespace-pre-wrap">
                                        {JSON.stringify(data, null, 2)}
                                    </pre>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-6 rounded-lg border">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Server Info</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className="text-green-600 font-medium">Connected</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Response Time:</span>
                                        <span className="text-blue-600 font-medium">{data.timestamp || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Message:</span>
                                        <span className="text-gray-800 font-medium">{data.greeting || 'None'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-blue-700 text-sm">
                                <strong>Note:</strong> This page demonstrates server-side data fetching using tRPC.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    } catch (error) {
        const errorDetails: ErrorDetails = {
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            status: (error as any)?.status || 500,
            timestamp: new Date().toISOString()
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white shadow-xl rounded-xl p-8">
                        <h1 className="text-3xl font-bold text-red-600 mb-6 flex items-center">
                            <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
                            Server Error
                        </h1>
                        
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-red-800 mb-4">❌ Connection Failed</h2>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-red-600 font-medium">Error:</span>
                                    <p className="text-red-700 mt-1">{errorDetails.message}</p>
                                </div>
                                <div>
                                    <span className="text-red-600 font-medium">Status Code:</span>
                                    <span className="text-red-700 ml-2">{errorDetails.status}</span>
                                </div>
                                <div>
                                    <span className="text-red-600 font-medium">Timestamp:</span>
                                    <span className="text-red-700 ml-2">{errorDetails.timestamp}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-yellow-700 text-sm">
                                <strong>Troubleshooting:</strong> Check server connection and tRPC configuration.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Page