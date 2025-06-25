'use client'

import { Card } from '@/types/card'
import QRCode from 'react-qr-code'
import { FiPhone, FiGlobe, FiX, FiEdit, FiTrash2 } from 'react-icons/fi'
import Image from 'next/image'

interface CardDetailProps {
  card: Card
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function CardDetail({ card, onClose, onEdit, onDelete }: CardDetailProps) {
  const handlePhoneClick = () => {
    if (card.phone_number) {
      window.location.href = `tel:${card.phone_number}`
    }
  }

  const handleUrlClick = () => {
    if (card.url) {
      window.open(card.url, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-3xl w-full max-w-md h-[90vh] animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">カード詳細</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="overflow-y-auto h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {card.front_image && (
              <div className="relative aspect-[1.6/1] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={card.front_image}
                  alt="診察券表面"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            {card.back_image && (
              <div className="relative aspect-[1.6/1] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={card.back_image}
                  alt="診察券裏面"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {card.store_name}
                </h3>
                <p className="text-lg text-gray-600 mt-1">
                  会員番号: {card.member_number}
                </p>
              </div>
              
              {(card.qr_code || card.barcode) && (
                <div className="flex justify-center p-6 bg-gray-50 rounded-xl">
                  <QRCode
                    value={card.qr_code || card.barcode || ''}
                    size={200}
                    level="H"
                  />
                </div>
              )}
              
              <div className="space-y-3">
                {card.phone_number && (
                  <button
                    onClick={handlePhoneClick}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <div className="flex items-center">
                      <FiPhone className="mr-3 text-blue-600" size={20} />
                      <span className="text-gray-900">{card.phone_number}</span>
                    </div>
                    <span className="text-gray-500">電話する</span>
                  </button>
                )}
                
                {card.url && (
                  <button
                    onClick={handleUrlClick}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <div className="flex items-center flex-1 mr-2">
                      <FiGlobe className="mr-3 text-blue-600 flex-shrink-0" size={20} />
                      <span className="text-gray-900 truncate">{card.url}</span>
                    </div>
                    <span className="text-gray-500 flex-shrink-0">開く</span>
                  </button>
                )}
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={onEdit}
                  className="flex-1 flex items-center justify-center py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                >
                  <FiEdit className="mr-2" size={20} />
                  編集
                </button>
                <button
                  onClick={onDelete}
                  className="flex-1 flex items-center justify-center py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
                >
                  <FiTrash2 className="mr-2" size={20} />
                  削除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}