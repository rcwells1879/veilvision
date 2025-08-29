'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, CameraOff, X, RefreshCw } from 'lucide-react'

interface WebcamCaptureProps {
  onCapture: (imageFile: File) => void
  onClose: () => void
}

export default function WebcamCapture({ onCapture, onClose }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const [isInitializing, setIsInitializing] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(true)

  // Debug logging
  console.log('WebcamCapture render - showPermissionModal:', showPermissionModal, 'isStreaming:', isStreaming, 'error:', error)

  // Get available camera devices (only after permission granted)
  const getDevices = useCallback(async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = deviceList.filter(device => device.kind === 'videoinput')
      setDevices(videoDevices)
      
      // Set default device (prefer rear camera on mobile) - only if we don't have one
      if (videoDevices.length > 0 && !selectedDeviceId) {
        const rearCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        )
        setSelectedDeviceId(rearCamera?.deviceId || videoDevices[0].deviceId)
      }
    } catch (err) {
      console.error('Error getting devices:', err)
      // Don't set error here - just log it
    }
  }, [selectedDeviceId])

  // Start webcam stream
  const startCamera = async (deviceId?: string) => {
    try {
      setIsInitializing(true)
      setError(null)

      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: deviceId ? undefined : { ideal: 'environment' }
        },
        audio: false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsStreaming(true)
      }
    } catch (err) {
      console.error('Error starting camera:', err)
      let errorMessage = 'Could not access camera'
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera permissions and try again.'
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.'
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is being used by another application.'
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = 'Camera does not support the requested settings.'
        }
      }
      
      setError(errorMessage)
      setIsStreaming(false)
    } finally {
      setIsInitializing(false)
    }
  }

  // Stop webcam stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsStreaming(false)
  }

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0)

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const fileName = `webcam-capture-${timestamp}.png`
        const file = new File([blob], fileName, { type: 'image/png' })
        onCapture(file)
        stopCamera()
        onClose()
      }
    }, 'image/png', 0.9)
  }

  // Switch camera device
  const switchCamera = (deviceId: string) => {
    setSelectedDeviceId(deviceId)
    if (isStreaming) {
      startCamera(deviceId)
    }
  }

  // Handle permission modal responses
  const handleAllowCamera = async () => {
    setShowPermissionModal(false)
    // Start camera first (this will trigger permission request)
    await startCamera() // Try without specific device first
    // After successful camera start, get available devices
    await getDevices()
  }

  const handleDenyCamera = () => {
    setShowPermissionModal(false)
    onClose()
  }

  // Don't get devices on mount - only after permission granted

  // Only get devices initially, don't auto-start camera

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center">
            <Camera className="mr-2 h-5 w-5" />
            Camera Capture
          </h3>
          <button
            onClick={() => {
              stopCamera()
              onClose()
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Permission Modal */}
        {showPermissionModal ? (
          <div className="p-8 text-center">
            <Camera className="mx-auto h-16 w-16 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
            <p className="text-gray-600 mb-6">
              This app needs access to your camera to take photos. Your browser will ask for permission.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleAllowCamera}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Yes, Allow Camera
              </button>
              <button
                onClick={handleDenyCamera}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                No, Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Camera Selection */}
            {devices.length > 1 && !showPermissionModal && (
              <div className="p-4 border-b bg-gray-50">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Camera:
                </label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => switchCamera(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${devices.indexOf(device) + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Camera View */}
            <div className="relative bg-black">
              {error ? (
                <div className="flex items-center justify-center h-64 text-red-600 bg-gray-50">
                  <div className="text-center">
                    <CameraOff className="mx-auto h-12 w-12 mb-4" />
                    <p className="font-medium mb-2">Camera Error</p>
                    <p className="text-sm">{error}</p>
                    <button
                      onClick={() => {
                        setError(null)
                        if (selectedDeviceId) {
                          startCamera(selectedDeviceId)
                        }
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 sm:h-80 md:h-96 object-cover"
                    style={{ transform: 'scaleX(-1)' }} // Mirror effect for front camera
                  />
                  
                  {isInitializing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="bg-white p-4 rounded-lg">
                        <div className="flex items-center">
                          <RefreshCw className="animate-spin mr-2 h-5 w-5" />
                          <span>Starting camera...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Camera controls overlay */}
                  {isStreaming && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={capturePhoto}
                          className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                          title="Capture Photo"
                        >
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                            <div className="w-6 h-6 bg-white rounded-full"></div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Instructions */}
        {!showPermissionModal && (
          <div className="p-4 bg-gray-50 text-sm text-gray-600">
            <p className="flex items-center">
              <Camera className="mr-2 h-4 w-4" />
              {isStreaming 
                ? "Position yourself in the frame and click the red button to capture"
                : "Allow camera access to begin capturing photos"
              }
            </p>
          </div>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}