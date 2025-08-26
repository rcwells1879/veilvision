'use client'

import { History, Clock, Image, RotateCcw } from 'lucide-react'

export default function HistoryPage() {
  const mockHistory = [
    {
      id: 1,
      originalImage: 'selfie.jpg',
      prompt: 'Make me a professional headshot in an office setting',
      status: 'completed',
      timestamp: '2024-01-15 14:30',
      processingTime: '2.3s'
    },
    {
      id: 2,
      originalImage: 'vacation.jpg',
      prompt: 'Convert to vintage film photography style with warm tones',
      status: 'completed',
      timestamp: '2024-01-15 13:45',
      processingTime: '3.1s'
    },
    {
      id: 3,
      originalImage: 'portrait.jpg',
      prompt: 'Create an artistic black and white portrait',
      status: 'failed',
      timestamp: '2024-01-15 12:20',
      processingTime: '1.8s',
      error: 'Image resolution too low'
    },
    {
      id: 4,
      originalImage: 'group_photo.jpg',
      prompt: 'Enhance lighting and make everyone look professional',
      status: 'processing',
      timestamp: '2024-01-15 11:15',
      processingTime: 'Processing...'
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'failed': return 'text-red-600 bg-red-50'
      case 'processing': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓'
      case 'failed': return '✗'
      case 'processing': return '⟳'
      default: return '•'
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <History className="mr-3 h-8 w-8" />
          Generation History
        </h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {mockHistory.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                      <Image className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.originalImage}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        <span className="mr-1">{getStatusIcon(item.status)}</span>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      "{item.prompt}"
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.timestamp}
                      </div>
                      <div>
                        Processing time: {item.processingTime}
                      </div>
                    </div>
                    
                    {item.error && (
                      <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                        Error: {item.error}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    {item.status === 'completed' && (
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <RotateCcw className="h-5 w-5" />
                      </button>
                    )}
                    {item.status === 'failed' && (
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {mockHistory.length === 0 && (
            <div className="text-center py-12">
              <History className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No history yet</h3>
              <p className="text-gray-500">Your generation history will appear here once you start creating images.</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-2xl font-bold text-gray-900">12</div>
            <div className="text-sm text-gray-600">Total Generations</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-2xl font-bold text-green-600">10</div>
            <div className="text-sm text-gray-600">Successful</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-2xl font-bold text-red-600">1</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-2xl font-bold text-blue-600">1</div>
            <div className="text-sm text-gray-600">Processing</div>
          </div>
        </div>
      </div>
    </div>
  )
}