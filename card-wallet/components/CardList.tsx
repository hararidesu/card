'use client'

import { Card } from '@/types/card'
import QRCode from 'react-qr-code'
import { FiPhone, FiGlobe } from 'react-icons/fi'
import Image from 'next/image'

interface CardListProps {
  cards: Card[]
  onCardClick: (card: Card) => void
}

export default function CardList({ cards, onCardClick }: CardListProps) {
  return (
    <div className="space-y-4 px-4 pb-20">
      {cards.map((card, index) => (
        <div
          key={card.id}
          onClick={() => onCardClick(card)}
          className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-slide-up`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* Card Image */}
          {card.front_image && (
            <div className="relative aspect-[1.6/1] w-full">
              <Image
                src={card.front_image}
                alt={`${card.store_name} 診察券`}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          {/* Card Info */}
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {card.store_name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  会員番号: {card.member_number}
                </p>
                
                <div className="space-y-1">
                  {card.phone_number && (
                    <div className="flex items-center text-gray-600">
                      <FiPhone className="mr-1" size={14} />
                      <span className="text-xs">{card.phone_number}</span>
                    </div>
                  )}
                  {card.url && (
                    <div className="flex items-center text-gray-600">
                      <FiGlobe className="mr-1" size={14} />
                      <span className="text-xs truncate">{card.url}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {(card.qr_code || card.barcode) && (
                <div className="ml-3">
                  <QRCode
                    value={card.qr_code || card.barcode || ''}
                    size={60}
                    level="L"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}