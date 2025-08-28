'use client'

import { useState, useEffect } from 'react'
import { Upload, Image, Settings, Sparkles, Loader, RotateCcw, Move, X } from 'lucide-react'
import { GeminiService } from '@/lib/gemini'

export default function Dashboard() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [workingImage, setWorkingImage] = useState<File | null>(null)
  const [originalImage, setOriginalImage] = useState<File | null>(null)
  const [prompt, setPrompt] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generationHistory, setGenerationHistory] = useState<string[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  const [fullscreenImageType, setFullscreenImageType] = useState<'working' | 'generated' | null>(null)
  const [workingImageUrl, setWorkingImageUrl] = useState<string | null>(null)

  const geminiService = new GeminiService()
  
  // Load API key from localStorage
  useEffect(() => {
    console.log('🔑 Loading API key from localStorage')
    if (typeof window !== 'undefined') {
      const savedApiKey = localStorage.getItem('gemini-api-key') || ''
      console.log('API key loaded:', savedApiKey ? 'present (' + savedApiKey.length + ' chars)' : 'missing')
      setApiKey(savedApiKey)
    } else {
      console.log('Window not available, skipping API key load')
    }
  }, [])

  // Helper function to convert base64 data URL to File object
  const convertBase64ToFile = (dataUrl: string, filename: string = 'generated-image.png'): File => {
    try {
      console.log('Converting base64 to File. DataURL length:', dataUrl.length)
      const arr = dataUrl.split(',')
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
      console.log('Detected MIME type:', mime)
      
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      
      const file = new File([u8arr], filename, { type: mime })
      console.log('Created File object:', file.name, 'type:', file.type, 'size:', file.size)
      return file
    } catch (error) {
      console.error('Error converting base64 to File:', error)
      throw error
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (generatedImage) {
      e.dataTransfer.setData('text/plain', generatedImage)
      e.dataTransfer.effectAllowed = 'copy'
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const imageData = e.dataTransfer.getData('text/plain')
    if (imageData && generatedImage) {
      // Convert generated image to File and replace working image
      const newWorkingImage = convertBase64ToFile(generatedImage, 'edited-image.png')
      setWorkingImage(newWorkingImage)
      
      // Add current generated image to history
      setGenerationHistory(prev => [...prev, generatedImage])
      
      // Clear generated image to show we're ready for next edit
      setGeneratedImage(null)
      setError(null)
    }
  }

  // Reset to original image
  const resetToOriginal = () => {
    if (originalImage) {
      setWorkingImage(originalImage)
      setSelectedImage(originalImage)
      setGeneratedImage(null)
      setGenerationHistory([])
      setError(null)
    }
  }

  // Fullscreen image handlers
  const openFullscreen = (imageSrc: string, imageType: 'working' | 'generated') => {
    setFullscreenImage(imageSrc)
    setFullscreenImageType(imageType)
  }

  const closeFullscreen = () => {
    setFullscreenImage(null)
    setFullscreenImageType(null)
  }

  // Keyboard handler for ESC key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && fullscreenImage) {
        closeFullscreen()
      }
    }

    if (fullscreenImage) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden' // Prevent background scrolling
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [fullscreenImage])

  // Manage working image URL
  useEffect(() => {
    if (workingImage) {
      // Create new URL for the working image
      const newUrl = URL.createObjectURL(workingImage)
      setWorkingImageUrl(newUrl)
      console.log('Created working image URL:', newUrl)
      console.log('File details:', {
        name: workingImage.name,
        type: workingImage.type,
        size: workingImage.size,
        lastModified: workingImage.lastModified
      })
      
      // Test if the blob URL is valid
      const testImg = new window.Image()
      testImg.onload = () => {
        console.log('✅ Blob URL is valid and image can be loaded')
      }
      testImg.onerror = (e) => {
        console.error('❌ Blob URL is invalid:', e)
      }
      testImg.src = newUrl
      
      // Cleanup function
      return () => {
        URL.revokeObjectURL(newUrl)
        setWorkingImageUrl(null)
      }
    } else {
      setWorkingImageUrl(null)
    }
  }, [workingImage])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      console.log('File uploaded:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      })
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      
      console.log('Setting working image to uploaded file')
      setSelectedImage(file)
      setWorkingImage(file)
      setOriginalImage(file)
      setGeneratedImage(null)
      setGenerationHistory([])
      setError(null)
    }
  }

  const handleGenerate = async () => {
    console.log('🚀 handleGenerate function called')
    console.log('Current state:', {
      workingImage: workingImage ? workingImage.name : 'null',
      prompt: prompt,
      apiKey: apiKey ? 'present' : 'missing',
      isGenerating
    })
    
    if (!workingImage || !prompt.trim()) {
      console.log('❌ Early return: missing workingImage or prompt')
      return
    }
    
    // Check if API key is available
    if (!apiKey.trim()) {
      console.log('❌ Early return: missing API key')
      setError('Please configure your API key in Settings first.')
      return
    }
    
    console.log('✅ All validation passed, starting generation')
    console.log('🔄 Setting isGenerating to true')
    setIsGenerating(true)
    setError(null)
    
    try {
      console.log('📞 Making API call to Gemini service')
      const result = await geminiService.generateImage({
        image: workingImage,
        prompt: prompt,
        apiKey: apiKey
      })
      
      console.log('📨 Gemini API response:', result)
      
      if (result.success && result.imageUrl) {
        console.log('✅ Generation successful, setting generated image')
        setGeneratedImage(result.imageUrl)
      } else {
        console.log('❌ Generation failed:', result.error)
        setError(result.error || 'Failed to generate image')
      }
    } catch (err) {
      console.error('🔥 Exception in handleGenerate:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      console.log('🏁 Generation process completed, setting isGenerating to false')
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">VeilVision Dashboard</h1>
        
        {/* API Key Status */}
        {!apiKey && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <Settings className="mr-2 h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800">
                Please configure your API key in{' '}
                <a href="/settings" className="text-yellow-900 underline hover:no-underline">
                  Settings
                </a>{' '}
                to start generating images.
              </p>
            </div>
          </div>
        )}

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
            
            {workingImage && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  Working with: {workingImage.name}
                  {generationHistory.length > 0 && (
                    <span className="ml-2 text-xs text-blue-600">
                      (Edit #{generationHistory.length + 1})
                    </span>
                  )}
                </p>
                {originalImage && workingImage !== originalImage && (
                  <button
                    onClick={resetToOriginal}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Reset to original
                  </button>
                )}
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
              onClick={() => {
                console.log('🔵 Generate Vision button clicked!')
                console.log('Button state check:', {
                  workingImage: !!workingImage,
                  prompt: prompt.trim(),
                  apiKey: !!apiKey.trim(),
                  isGenerating
                })
                handleGenerate()
              }}
              disabled={!workingImage || !prompt.trim() || !apiKey.trim() || isGenerating}
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
        {(generatedImage || workingImage) && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            
            {/* User guidance */}
            {generatedImage && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-blue-800 text-sm">
                  <Move className="mr-2 h-4 w-4" />
                  <p>
                    <strong>Tip:</strong> Drag the generated image to the working image area to use it for your next edit!
                  </p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Working Image (Drop Target) */}
              {workingImage && (
                <div className="relative">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Current Working Image
                    {generationHistory.length > 0 && (
                      <span className="ml-2 text-xs text-blue-600">
                        (Generation {generationHistory.length})
                      </span>
                    )}
                  </h3>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative w-full h-64 rounded-lg cursor-pointer group transition-all duration-200 overflow-hidden flex items-center justify-center ${
                      isDragOver 
                        ? 'border-2 border-dashed border-blue-500 bg-blue-50' 
                        : 'border border-gray-300 bg-gray-50'
                    }`}
                  >
                    {workingImage ? (
                      <img
                        src={workingImageUrl || URL.createObjectURL(workingImage)}
                        alt="Working"
                        loading="eager"
                        onLoad={(e) => {
                          console.log('✅ Working image loaded successfully')
                          console.log('Image dimensions:', e.currentTarget.naturalWidth, 'x', e.currentTarget.naturalHeight)
                          console.log('Image src:', e.currentTarget.src.substring(0, 50) + '...')
                        }}
                        onError={(e) => {
                          console.error('❌ Working image failed to load')
                          console.error('Image src:', e.currentTarget.src)
                          console.error('Working image file:', workingImage?.name, workingImage?.type, workingImage?.size)
                          console.error('Working image URL state:', workingImageUrl)
                          
                          // Try creating a fresh URL as fallback
                          if (workingImage && !e.currentTarget.dataset.retried) {
                            console.log('Attempting fallback URL...')
                            e.currentTarget.dataset.retried = 'true'
                            const fallbackUrl = URL.createObjectURL(workingImage)
                            console.log('Trying fallback URL:', fallbackUrl.substring(0, 50) + '...')
                            e.currentTarget.src = fallbackUrl
                          } else {
                            console.error('Fallback also failed, showing error state')
                            e.currentTarget.style.display = 'none'
                            const errorDiv = document.createElement('div')
                            errorDiv.innerHTML = '<div class="w-full h-full flex items-center justify-center text-red-500"><div class="text-center"><p class="text-sm">Failed to load image</p><p class="text-xs mt-1">' + workingImage?.name + '</p></div></div>'
                            e.currentTarget.parentNode?.appendChild(errorDiv)
                          }
                        }}
                        onClick={() => {
                          const urlToOpen = workingImageUrl || URL.createObjectURL(workingImage)
                          openFullscreen(urlToOpen, 'working')
                        }}
                        className="max-w-full max-h-full hover:scale-105 transition-transform duration-200"
                        style={{ 
                          backgroundColor: 'white', 
                          display: 'block', 
                          opacity: 1, 
                          visibility: 'visible', 
                          zIndex: 1
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <Image className="mx-auto h-12 w-12 mb-2" />
                          <p className="text-sm">No image selected</p>
                        </div>
                      </div>
                    )}
                    {workingImage && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center pointer-events-none">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm text-gray-800">
                          Click to enlarge
                        </div>
                      </div>
                    )}
                    {isDragOver && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                        <div className="bg-white p-3 rounded-lg shadow-lg">
                          <p className="text-blue-800 font-medium">Drop to replace working image</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Generated Image (Draggable) */}
              {generatedImage && (
                <div className="relative">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Generated Result</h3>
                  <div className="relative w-full h-64 rounded-lg cursor-move group transition-all duration-200 overflow-hidden flex items-center justify-center border border-gray-300 bg-gray-50">
                    <img
                      src={generatedImage}
                      alt="Generated"
                      loading="eager"
                      draggable="true"
                      onLoad={(e) => {
                        console.log('✅ Generated image loaded successfully')
                        console.log('Generated image dimensions:', e.currentTarget.naturalWidth, 'x', e.currentTarget.naturalHeight)
                        console.log('Generated image src length:', e.currentTarget.src.length)
                      }}
                      onError={(e) => {
                        console.error('❌ Generated image failed to load:', e)
                        console.error('Generated image src:', e.currentTarget.src.substring(0, 100) + '...')
                        e.currentTarget.style.display = 'none'
                      }}
                      style={{ 
                        backgroundColor: 'white', 
                        display: 'block', 
                        opacity: 1, 
                        visibility: 'visible', 
                        zIndex: 1
                      }}
                      onDragStart={handleDragStart}
                      onClick={() => openFullscreen(generatedImage, 'generated')}
                      className="max-w-full max-h-full hover:scale-105 transition-transform duration-200"
                      title="Drag this image to replace the working image, or click to enlarge"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                      Draggable
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm text-gray-800">
                        Click to enlarge • Drag to use
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {prompt && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Last Prompt:</strong> {prompt}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Fullscreen Modal */}
        {fullscreenImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={closeFullscreen}
          >
            <div className="relative max-w-full max-h-full">
              {/* Close button */}
              <button
                onClick={closeFullscreen}
                className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                title="Close (ESC)"
              >
                <X className="h-6 w-6" />
              </button>
              
              {/* Image type indicator */}
              <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {fullscreenImageType === 'working' ? 'Current Working Image' : 'Generated Result'}
                {fullscreenImageType === 'working' && generationHistory.length > 0 && (
                  <span className="ml-2 text-blue-300">
                    (Generation {generationHistory.length})
                  </span>
                )}
              </div>

              {/* Fullscreen image */}
              <img
                src={fullscreenImage}
                alt={fullscreenImageType === 'working' ? 'Working Image' : 'Generated Image'}
                className="max-w-full max-h-full object-contain cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  closeFullscreen()
                }}
                style={{ maxWidth: '95vw', maxHeight: '95vh' }}
              />

              {/* Instructions */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                Click anywhere to close • ESC key • Tap image
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}