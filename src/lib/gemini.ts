import { GoogleGenAI, Modality } from '@google/genai'

export interface GenerationRequest {
  image: File
  prompt: string
  apiKey: string
}

export interface GenerationResult {
  success: boolean
  imageUrl?: string
  error?: string
}

export class GeminiService {
  async generateImage({ image, prompt, apiKey }: GenerationRequest): Promise<GenerationResult> {
    try {
      // Initialize the SDK with the provided API key
      const ai = new GoogleGenAI({ apiKey })
      const model = 'gemini-2.5-flash-image-preview'
      
      // Convert File to base64
      const base64Data = await this.fileToBase64(image)
      
      // Prepare image part for API
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: image.type,
        },
      }

      // Prepare text part
      const textPart = {
        text: `Transform this image: ${prompt}`,
      }

      // Make the API call
      const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [imagePart, textPart] },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      })

      // Extract the generated image data from the response
      const imageEditPart = response.candidates?.[0]?.content?.parts?.find(
        (p: { inlineData?: { data: string } }) => p.inlineData
      )

      if (imageEditPart) {
        const base64ImageData = imageEditPart.inlineData.data
        const imageUrl = `data:image/png;base64,${base64ImageData}`
        return {
          success: true,
          imageUrl
        }
      } else {
        throw new Error('No image was generated in the response.')
      }
    } catch (error) {
      console.error('Gemini generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // For analyzing images without transformation (using regular Gemini 2.5 Flash)
  async analyzeImage({ image, prompt, apiKey }: GenerationRequest): Promise<{ success: boolean; analysis?: string; error?: string }> {
    try {
      const ai = new GoogleGenAI({ apiKey })
      const imageData = await this.fileToBase64(image)
      
      const imagePart = {
        inlineData: {
          data: imageData,
          mimeType: image.type,
        },
      }

      const textPart = {
        text: prompt,
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
      })

      const analysis = response.text
      return {
        success: true,
        analysis
      }
    } catch (error) {
      console.error('Gemini analysis error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64 = reader.result as string
        // Remove the data:image/jpeg;base64, prefix
        resolve(base64.split(',')[1])
      }
      reader.onerror = error => reject(error)
    })
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const ai = new GoogleGenAI({ apiKey })
      await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Hello, this is a test.',
      })
      return true
    } catch {
      return false
    }
  }
}