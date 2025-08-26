'use client'

import { Image, Download, Trash2, Eye } from 'lucide-react'

export default function Gallery() {
  const mockGenerations = [
    { id: 1, originalName: 'selfie.jpg', prompt: 'Professional headshot in office setting', createdAt: '2024-01-15' },
    { id: 2, originalName: 'vacation.jpg', prompt: 'Vintage film photography style', createdAt: '2024-01-14' },
    { id: 3, originalName: 'portrait.jpg', prompt: 'Artistic black and white portrait', createdAt: '2024-01-13' },
  ]

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <Image className="mr-3 h-8 w-8" />
          Gallery
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockGenerations.map((generation) => (
            <div key={generation.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <Image className="h-16 w-16 text-gray-400" />
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {generation.originalName}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {generation.prompt}
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Generated on {generation.createdAt}
                </p>
                
                <div className="flex space-x-2">
                  <button className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <button className="flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {mockGenerations.length === 0 && (
          <div className="text-center py-12">
            <Image className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
            <p className="text-gray-500">Start generating images from the dashboard to see them here.</p>
          </div>
        )}
      </div>
    </div>
  )
}