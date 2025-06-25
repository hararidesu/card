// Image preprocessing utilities for better OCR accuracy

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

export function preprocessImage(imageData: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = createCanvas(img.width, img.height)
      const ctx = canvas.getContext('2d')!
      
      // Draw original image
      ctx.drawImage(img, 0, 0)
      
      // Get image data for processing
      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageDataObj.data
      
      // Apply image enhancements
      enhanceImage(data)
      
      // Put processed data back
      ctx.putImageData(imageDataObj, 0, 0)
      
      // Return processed image as base64
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.src = imageData
  })
}

function enhanceImage(data: Uint8ClampedArray) {
  // Convert to grayscale and enhance contrast
  for (let i = 0; i < data.length; i += 4) {
    // Calculate grayscale value using luminance formula
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
    
    // Apply contrast enhancement
    const enhanced = enhanceContrast(gray, 1.5, 128)
    
    // Apply sharpening
    const sharpened = Math.min(255, Math.max(0, enhanced))
    
    // Set RGB to enhanced grayscale value
    data[i] = sharpened     // Red
    data[i + 1] = sharpened // Green  
    data[i + 2] = sharpened // Blue
    // Alpha channel stays the same (data[i + 3])
  }
}

function enhanceContrast(value: number, factor: number, midpoint: number): number {
  return Math.round(factor * (value - midpoint) + midpoint)
}

export function sharpenImage(imageData: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = createCanvas(img.width, img.height)
      const ctx = canvas.getContext('2d')!
      
      ctx.drawImage(img, 0, 0)
      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height)
      
      // Apply sharpening kernel
      const sharpened = applySharpeningKernel(imageDataObj)
      ctx.putImageData(sharpened, 0, 0)
      
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.src = imageData
  })
}

function applySharpeningKernel(imageData: ImageData): ImageData {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  const output = new Uint8ClampedArray(data)
  
  // Sharpening kernel
  const kernel = [
    [0, -1, 0],
    [-1, 5, -1], 
    [0, -1, 0]
  ]
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) { // RGB channels only
        let sum = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIndex = ((y + ky) * width + (x + kx)) * 4 + c
            sum += data[pixelIndex] * kernel[ky + 1][kx + 1]
          }
        }
        const outputIndex = (y * width + x) * 4 + c
        output[outputIndex] = Math.min(255, Math.max(0, sum))
      }
    }
  }
  
  return new ImageData(output, width, height)
}

export function adjustBrightness(imageData: string, factor: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = createCanvas(img.width, img.height)
      const ctx = canvas.getContext('2d')!
      
      ctx.drawImage(img, 0, 0)
      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageDataObj.data
      
      // Adjust brightness
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, data[i] * factor))     // Red
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor)) // Green
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor)) // Blue
      }
      
      ctx.putImageData(imageDataObj, 0, 0)
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.src = imageData
  })
}

export function removeNoise(imageData: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = createCanvas(img.width, img.height)
      const ctx = canvas.getContext('2d')!
      
      ctx.drawImage(img, 0, 0)
      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height)
      
      // Apply median filter for noise reduction
      const filtered = applyMedianFilter(imageDataObj)
      ctx.putImageData(filtered, 0, 0)
      
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.src = imageData
  })
}

function applyMedianFilter(imageData: ImageData): ImageData {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  const output = new Uint8ClampedArray(data)
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) { // RGB channels only
        const neighbors: number[] = []
        
        // Collect 3x3 neighborhood
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const index = ((y + dy) * width + (x + dx)) * 4 + c
            neighbors.push(data[index])
          }
        }
        
        // Sort and take median
        neighbors.sort((a, b) => a - b)
        const median = neighbors[Math.floor(neighbors.length / 2)]
        
        const outputIndex = (y * width + x) * 4 + c
        output[outputIndex] = median
      }
    }
  }
  
  return new ImageData(output, width, height)
}