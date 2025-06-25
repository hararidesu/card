import { createWorker } from 'tesseract.js'
import { preprocessImage, sharpenImage, adjustBrightness, removeNoise } from './imageProcessor'

export interface OCRResult {
  store_name: string
  member_number: string
  phone_number: string
  url: string
  barcode: string
  qr_code: string
}

export async function extractTextFromImage(imageData: string): Promise<string> {
  // Apply image preprocessing for better OCR accuracy
  const processedImage = await enhanceImageForOCR(imageData)
  
  const worker = await createWorker('jpn+eng')
  
  try {
    // Configure Tesseract for better Japanese text recognition
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzあいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンー々〒（）()[]【】{}／・-−ー：:：.,、。',
      tessedit_pageseg_mode: '6', // Uniform block of text
      preserve_interword_spaces: '1'
    })
    
    const { data: { text } } = await worker.recognize(processedImage)
    return text
  } finally {
    await worker.terminate()
  }
}

async function enhanceImageForOCR(imageData: string): Promise<string> {
  try {
    // Step 1: Preprocess (grayscale + contrast)
    let enhanced = await preprocessImage(imageData)
    
    // Step 2: Remove noise
    enhanced = await removeNoise(enhanced)
    
    // Step 3: Adjust brightness if needed
    enhanced = await adjustBrightness(enhanced, 1.1)
    
    // Step 4: Sharpen text
    enhanced = await sharpenImage(enhanced)
    
    return enhanced
  } catch (error) {
    console.warn('Image enhancement failed, using original:', error)
    return imageData
  }
}

export function parseCardInfo(text: string): Partial<OCRResult> {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  const allText = text.replace(/\n/g, ' ')
  
  const result: Partial<OCRResult> = {}
  
  // 店名を検索 (より詳細なキーワードと優先順位)
  const clinicKeywords = [
    'クリニック', '病院', '医院', '歯科', 'ホスピタル', 'メディカル', 
    '内科', '外科', '小児科', '皮膚科', '耳鼻咽喉科', '眼科', 
    '整形外科', '精神科', '産婦人科', '泌尿器科', '心療内科',
    'センター', '診療所', '薬局', 'ファーマシー'
  ]
  
  // 最も長い病院名を見つける
  let bestClinicMatch = ''
  let bestScore = 0
  
  for (const line of lines) {
    const keywordCount = clinicKeywords.filter(keyword => line.includes(keyword)).length
    const score = keywordCount * 10 + line.length
    
    if (score > bestScore && line.length > 2) {
      bestScore = score
      bestClinicMatch = line
    }
  }
  
  if (bestClinicMatch) {
    result.store_name = bestClinicMatch.replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]/g, '').trim()
  } else if (lines.length > 0) {
    result.store_name = lines[0].replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]/g, '').trim()
  }
  
  // 会員番号検索 (より包括的なパターン)
  const memberNumberPatterns = [
    /(?:会員番号|患者番号|診察券番号|登録番号|ID|No\.?|NO\.?)\s*[:：]?\s*([0-9A-Z\-]{4,})/gi,
    /^([0-9]{6,}|\d{3}[-\s]?\d{3}[-\s]?\d{3,4}|\d{4}[-\s]?\d{4}|\d{2}[-\s]?\d{4}[-\s]?\d{4})$/gm,
    /No\.?\s*([0-9A-Z\-]{4,})/gi,
    /ID\s*[:：]?\s*([0-9A-Z\-]{4,})/gi
  ]
  
  for (const pattern of memberNumberPatterns) {
    const matches = allText.matchAll(pattern)
    for (const match of matches) {
      const candidate = (match[1] || match[0]).replace(/\s+/g, '')
      // 電話番号形式でないことを確認
      if (candidate && !candidate.match(/^\d{2,4}[-]?\d{2,4}[-]?\d{4}$/)) {
        result.member_number = candidate
        break
      }
    }
    if (result.member_number) break
  }
  
  // 電話番号検索 (より正確なパターン)
  const phonePatterns = [
    /(?:電話|TEL|Tel|tel|☎)\s*[:：]?\s*(\d{2,4}[-\s]?\d{2,4}[-\s]?\d{4})/gi,
    /(\d{2,4}[-\s]?\d{2,4}[-\s]?\d{4})/g,
    /(\d{3}[-\s]?\d{4}[-\s]?\d{4})/g  // 携帯電話
  ]
  
  for (const pattern of phonePatterns) {
    const matches = allText.matchAll(pattern)
    for (const match of matches) {
      const phone = match[1].replace(/\s+/g, '-')
      // 会員番号と異なることを確認
      if (phone && phone !== result.member_number) {
        result.phone_number = phone
        break
      }
    }
    if (result.phone_number) break
  }
  
  // URL検索 (より包括的)
  const urlPatterns = [
    /(https?:\/\/[^\s]+)/gi,
    /(www\.[^\s]+)/gi,
    /([a-zA-Z0-9.-]+\.(com|jp|net|org|co\.jp|ne\.jp))/gi
  ]
  
  for (const pattern of urlPatterns) {
    const matches = allText.matchAll(pattern)
    for (const match of matches) {
      let url = match[1] || match[0]
      if (!url.startsWith('http')) {
        url = 'https://' + url
      }
      result.url = url.toLowerCase()
      break
    }
    if (result.url) break
  }
  
  // QRコード/バーコード検索 (より精密)
  const codePatterns = [
    /^[0-9]{8,}$/,
    /^[A-Z0-9]{8,}$/i,
    /(https?:\/\/[^\s]+)/gi
  ]
  
  for (const line of lines) {
    const cleanLine = line.replace(/\s+/g, '')
    for (const pattern of codePatterns) {
      if (pattern.test(cleanLine) && 
          cleanLine !== result.member_number && 
          cleanLine !== result.phone_number?.replace(/-/g, '')) {
        
        if (cleanLine.startsWith('http')) {
          if (!result.url) result.qr_code = cleanLine
        } else if (cleanLine.length >= 8) {
          result.barcode = cleanLine
        }
        break
      }
    }
  }
  
  // 郵便番号検索
  const postalPattern = /〒?\s*(\d{3}[-\s]?\d{4})/g
  const postalMatches = allText.matchAll(postalPattern)
  for (const match of postalMatches) {
    // 郵便番号は通常 電話番号より短いので区別可能
    const postal = match[1]
    if (postal.match(/^\d{3}[-]?\d{4}$/)) {
      // 郵便番号を特別な用途に使用할 수도 있음
      break
    }
  }
  
  return result
}

export async function processCardImage(imageData: string): Promise<Partial<OCRResult>> {
  try {
    const text = await extractTextFromImage(imageData)
    console.log('OCR結果:', text) // デバッグ用
    return parseCardInfo(text)
  } catch (error) {
    console.error('OCR処理エラー:', error)
    return {}
  }
}