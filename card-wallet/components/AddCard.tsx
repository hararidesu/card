'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/types/card'
import { FiCamera, FiX, FiCheck, FiRotateCcw, FiImage, FiLoader } from 'react-icons/fi'
import { v4 as uuidv4 } from 'uuid'
import { processCardImage } from '@/lib/ocr'

interface AddCardProps {
  onClose: () => void
  onSave: (card: Omit<Card, 'id' | 'created_at' | 'updated_at'>) => void
}

export default function AddCard({ onClose, onSave }: AddCardProps) {
  const [step, setStep] = useState<'choice' | 'camera' | 'edit'>('choice')
  const [scanSide, setScanSide] = useState<'front' | 'back'>('front')
  const [frontImage, setFrontImage] = useState<string>('')
  const [backImage, setBackImage] = useState<string>('')
  const [isCapturing, setIsCapturing] = useState(false)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    store_name: '',
    member_number: '',
    barcode: '',
    qr_code: '',
    phone_number: '',
    url: ''
  })

  useEffect(() => {
    if (step === 'camera') {
      startCamera()
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [step])

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('카메라에 접근할 수 없습니다. 브라우저 설정을 확인해주세요.')
    }
  }

  const processImageWithOCR = async (imageData: string) => {
    setIsProcessingOCR(true)
    try {
      const ocrResult = await processCardImage(imageData)
      setFormData(prevData => ({
        store_name: ocrResult.store_name || prevData.store_name,
        member_number: ocrResult.member_number || prevData.member_number,
        barcode: ocrResult.barcode || prevData.barcode,
        qr_code: ocrResult.qr_code || prevData.qr_code,
        phone_number: ocrResult.phone_number || prevData.phone_number,
        url: ocrResult.url || prevData.url
      }))
    } catch (error) {
      console.error('Enhanced OCR処理エラー:', error)
      // Show user-friendly error message
      alert('OCR処理中にエラーが発生しました。手動で情報を入力してください。')
    } finally {
      setIsProcessingOCR(false)
    }
  }

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsCapturing(true)
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (context) {
      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      
      if (scanSide === 'front') {
        setFrontImage(imageData)
        setScanSide('back')
        // Process OCR for front image
        await processImageWithOCR(imageData)
      } else {
        setBackImage(imageData)
        // Stop camera before moving to edit
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
        }
        setStep('edit')
      }
    }
    
    setTimeout(() => setIsCapturing(false), 300)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageData = e.target?.result as string
      
      if (scanSide === 'front') {
        setFrontImage(imageData)
        setScanSide('back')
        // Process OCR for front image
        await processImageWithOCR(imageData)
      } else {
        setBackImage(imageData)
        setStep('edit')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleSkipBack = () => {
    // Stop camera before moving to edit
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    setStep('edit')
    setFormData({
      store_name: 'サンプルクリニック',
      member_number: '123456789',
      barcode: '4901234567890',
      qr_code: 'https://example.com/patient/123456',
      phone_number: '03-1234-5678',
      url: 'https://example-clinic.jp'
    })
  }

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    onClose()
  }

  const handleSave = () => {
    onSave({
      ...formData,
      front_image: frontImage,
      back_image: backImage || undefined
    })
  }

  if (step === 'choice') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
        <div className="bg-white rounded-t-3xl w-full max-w-md animate-slide-up">
          <div className="flex items-center justify-between p-6 border-b">
            <button onClick={handleClose} className="text-gray-600">
              キャンセル
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {scanSide === 'front' ? '表面を追加' : '裏面を追加'}
            </h2>
            <div className="w-16" />
          </div>
          
          <div className="p-6 space-y-4">
            <button
              onClick={() => setStep('camera')}
              className="w-full flex items-center justify-center py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              <FiCamera className="mr-3" size={24} />
              カメラで撮影
            </button>
            
            <button
              onClick={handleUploadClick}
              className="w-full flex items-center justify-center py-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors"
            >
              <FiImage className="mr-3" size={24} />
              写真を選択
            </button>
            
            {scanSide === 'back' && (
              <button
                onClick={handleSkipBack}
                className="w-full py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                裏面をスキップ
              </button>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
    )
  }

  if (step === 'camera') {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="relative h-full">
          {/* Camera controls */}
          <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-center">
            <button
              onClick={handleClose}
              className="p-2 bg-black bg-opacity-50 rounded-full text-white"
            >
              <FiX size={24} />
            </button>
            <h2 className="text-white text-lg font-semibold">
              {scanSide === 'front' ? '表面を撮影' : '裏面を撮影'}
            </h2>
            <button
              onClick={() => setStep('choice')}
              className="text-white font-medium"
            >
              戻る
            </button>
          </div>
          
          {/* Video preview */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Guide overlay */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="relative w-full max-w-sm aspect-[1.6/1]">
              <div className="absolute inset-0 border-4 border-white rounded-2xl opacity-50" />
              <div className="absolute -top-4 -left-4 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-2xl" />
              <div className="absolute -top-4 -right-4 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-2xl" />
              <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-2xl" />
              <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-2xl" />
            </div>
          </div>
          
          {/* Capture button */}
          <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center">
            <button
              onClick={handleCapture}
              disabled={isCapturing}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                isCapturing 
                  ? 'bg-gray-400 scale-95' 
                  : 'bg-white hover:scale-105 active:scale-95'
              }`}
            >
              <FiCamera size={32} className="text-gray-900" />
            </button>
          </div>
          
          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-3xl w-full max-w-md h-[90vh] animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b">
          <button
            onClick={onClose}
            className="text-gray-600"
          >
            キャンセル
          </button>
          <h2 className="text-xl font-bold text-gray-900">カード情報編集</h2>
          <button
            onClick={handleSave}
            className="text-blue-600 font-semibold"
          >
            保存
          </button>
        </div>
        
        <div className="overflow-y-auto h-[calc(90vh-80px)] p-6">
          {isProcessingOCR && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <FiLoader className="animate-spin mr-2 text-blue-600" size={20} />
                <span className="text-blue-800">Enhanced OCRで文字を読み取り中...</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">画像処理と日本語認識を実行中です</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                店名
              </label>
              <input
                type="text"
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                会員番号
              </label>
              <input
                type="text"
                value={formData.member_number}
                onChange={(e) => setFormData({ ...formData, member_number: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                バーコード
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                QRコード
              </label>
              <input
                type="text"
                value={formData.qr_code}
                onChange={(e) => setFormData({ ...formData, qr_code: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}