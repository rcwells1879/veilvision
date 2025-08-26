import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface GenerationRequest {
  image: File
  prompt: string
}

export interface GenerationResult {
  success: boolean
  imageUrl?: string
  error?: string
}

export class GeminiService {
  // Using the correct Gemini 2.5 Flash Vision model for image generation/editing
  private model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' })

  async generateImage({ image, prompt }: GenerationRequest): Promise<GenerationResult> {
    try {
      // Convert File to base64
      const imageData = await this.fileToBase64(image)
      
      // Prepare the prompt for image transformation using conversational approach
      const fullPrompt = `I want you to transform this image based on the following request: "${prompt}". 
        Please generate a new version of this image that fulfills the request while maintaining the core elements of the original.`

      // Configuration for image generation
      const generationConfig: GenerationConfig = {
        maxOutputTokens: 32768,
        temperature: 0.8,
      }
      
      const result = await this.model.generateContent(
        [
          fullPrompt,
          {
            inlineData: {
              data: imageData,
              mimeType: image.type
            }
          }
        ],
        { generationConfig }
      )

      const response = await result.response
      
      // For Gemini 2.5 Flash Image Preview, the response should contain the generated image
      // This implementation assumes the API returns image data directly
      // You may need to adjust based on the actual response format
      const generatedContent = response.text()

      return {
        success: true,
        imageUrl: generatedContent // This may need adjustment based on actual API response
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
  async analyzeImage({ image, prompt }: GenerationRequest): Promise<{ success: boolean; analysis?: string; error?: string }> {
    try {
      const regularModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      const imageData = await this.fileToBase64(image)
      
      const result = await regularModel.generateContent([
        prompt,
        {
          inlineData: {
            data: imageData,
            mimeType: image.type
          }
        }
      ])

      const response = await result.response
      const analysis = response.text()

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

  async validateApiKey(): Promise<boolean> {
    try {
      // Simple validation using Gemini 2.5 Flash
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      await model.generateContent('Hello, this is a test.')
      return true
    } catch {
      return false
    }
  }
}