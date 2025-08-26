'use client'

import { useState } from 'react'
import { Upload, Image, Settings, Sparkles } from 'lucide-react'

export default function Dashboard() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [prompt, setPrompt] = useState('')

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0])
    }
  }

  const handleGenerate = () => {
    // TODO: Implement Gemini 2.5 Flash Vision API integration
    console.log('Generating with:', { image: selectedImage, prompt })
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">VeilVision Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Upload Image
            </h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">Click to upload an image</p>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB</p>
              </label>
            </div>
            
            {selectedImage && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">Selected: {selectedImage.name}</p>
              </div>
            )}
          </div>

          {/* Prompt Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Sparkles className="mr-2 h-5 w-5" />
              Vision Prompt
            </h2>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe how you want your image transformed... (e.g., 'Make me a professional headshot in an office setting')"
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <button
              onClick={handleGenerate}
              disabled={!selectedImage || !prompt.trim()}
              className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Generate Vision
            </button>
          </div>
        </div>

        {/* Recent Generations */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Generations</h2>
          <div className="text-gray-500 text-center py-8">
            <p>No generations yet. Upload an image and add a prompt to get started!</p>
          </div>
        </div>
      </div>
    </div>
  )
}