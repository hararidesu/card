'use client'

import { useState } from 'react'
import { Card } from '@/types/card'

interface EditCardProps {
  card: Card
  onClose: () => void
  onSave: (updatedCard: Partial<Card>) => void
}

export default function EditCard({ card, onClose, onSave }: EditCardProps) {
  const [formData, setFormData] = useState({
    store_name: card.store_name,
    member_number: card.member_number,
    barcode: card.barcode || '',
    qr_code: card.qr_code || '',
    phone_number: card.phone_number || '',
    url: card.url || ''
  })

  const handleSave = () => {
    onSave(formData)
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
          <h2 className="text-xl font-bold text-gray-900">カード編集</h2>
          <button
            onClick={handleSave}
            className="text-blue-600 font-semibold"
          >
            保存
          </button>
        </div>
        
        <div className="overflow-y-auto h-[calc(90vh-80px)] p-6">
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