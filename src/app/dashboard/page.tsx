'use client'

import { useState } from 'react'
import { Upload, Image, Settings, Sparkles, Key, Loader } from 'lucide-react'
import { GeminiService } from '@/lib/gemini'

export default function Dashboard() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [prompt, setPrompt] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const geminiService = new GeminiService()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0])
    }
  }

  const handleGenerate = async () => {
    if (!selectedImage || !prompt.trim() || !apiKey.trim()) return
    
    setIsGenerating(true)
    setError(null)
    
    try {
      const result = await geminiService.generateImage({
        image: selectedImage,
        prompt: prompt,
        apiKey: apiKey
      })
      
      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl)
      } else {
        setError(result.error || 'Failed to generate image')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">VeilVision Dashboard</h1>
        
        {/* API Key Input */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Key className="mr-2 h-5 w-5" />
            Google API Key
          </h2>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Google Gemini API key"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-2">
            Get your API key from{' '}
            <a 
              href="https://aistudio.google.com/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>

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
                <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" alt="" />
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
              disabled={!selectedImage || !prompt.trim() || !apiKey.trim() || isGenerating}
              className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <Loader className="animate-spin mr-2 h-5 w-5" />
                  Generating...
                </>
              ) : (
                'Generate Vision'
              )}
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Generated Result */}
        {(generatedImage || selectedImage) && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Image */}
              {selectedImage && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Original</h3>
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Original"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                </div>
              )}
              
              {/* Generated Image */}
              {generatedImage && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Generated</h3>
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
            
            {prompt && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Prompt:</strong> {prompt}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}