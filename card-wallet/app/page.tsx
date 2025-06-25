'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/types/card'
import { cardService } from '@/lib/supabase'
import PasscodeScreen from '@/components/PasscodeScreen'
import CardList from '@/components/CardList'
import CardDetail from '@/components/CardDetail'
import AddCard from '@/components/AddCard'
import EditCard from '@/components/EditCard'
import { FiPlus } from 'react-icons/fi'
import { v4 as uuidv4 } from 'uuid'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [cards, setCards] = useState<Card[]>([])
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [isEditingCard, setIsEditingCard] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCards()
  }, [])

  const loadCards = async () => {
    try {
      const cardsFromDb = await cardService.getAll()
      if (cardsFromDb.length > 0) {
        setCards(cardsFromDb)
      } else {
        // Create sample data if no cards exist
      const sampleCards: Card[] = [
        {
          id: uuidv4(),
          store_name: '東京メディカルクリニック',
          member_number: '1234567890',
          barcode: '4901234567890',
          qr_code: 'https://tokyo-medical.jp/patient/1234567890',
          phone_number: '03-1234-5678',
          url: 'https://tokyo-medical.jp',
          front_image: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
            <svg width="400" height="250" xmlns="http://www.w3.org/2000/svg">
              <rect width="400" height="250" fill="#e3f2fd" rx="15"/>
              <text x="200" y="50" text-anchor="middle" font-size="24" font-weight="bold" fill="#1976d2">東京メディカルクリニック</text>
              <text x="200" y="125" text-anchor="middle" font-size="16" fill="#424242">診察券</text>
              <text x="200" y="200" text-anchor="middle" font-size="20" fill="#424242">No. 1234567890</text>
            </svg>
          `)}`,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          store_name: 'さくら歯科医院',
          member_number: '9876543210',
          qr_code: 'https://sakura-dental.com/p/9876543210',
          phone_number: '045-987-6543',
          url: 'https://sakura-dental.com',
          front_image: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
            <svg width="400" height="250" xmlns="http://www.w3.org/2000/svg">
              <rect width="400" height="250" fill="#fce4ec" rx="15"/>
              <text x="200" y="50" text-anchor="middle" font-size="24" font-weight="bold" fill="#c2185b">さくら歯科医院</text>
              <text x="200" y="125" text-anchor="middle" font-size="16" fill="#424242">診察券</text>
              <text x="200" y="200" text-anchor="middle" font-size="20" fill="#424242">No. 9876543210</text>
            </svg>
          `)}`,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          store_name: 'みどり内科',
          member_number: '5555555555',
          phone_number: '06-5555-5555',
          front_image: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
            <svg width="400" height="250" xmlns="http://www.w3.org/2000/svg">
              <rect width="400" height="250" fill="#e8f5e9" rx="15"/>
              <text x="200" y="50" text-anchor="middle" font-size="24" font-weight="bold" fill="#388e3c">みどり内科</text>
              <text x="200" y="125" text-anchor="middle" font-size="16" fill="#424242">診察券</text>
              <text x="200" y="200" text-anchor="middle" font-size="20" fill="#424242">No. 5555555555</text>
            </svg>
          `)}`,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]
      // Save sample cards to Supabase
      for (const card of sampleCards) {
        await cardService.create(card)
      }
      setCards(sampleCards)
      }
    } catch (error) {
      console.error('Error loading cards:', error)
      // Fallback to localStorage
      const savedCards = localStorage.getItem('medical-cards')
      if (savedCards) {
        setCards(JSON.parse(savedCards))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddCard = async (newCard: Omit<Card, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const createdCard = await cardService.create(newCard)
      setCards([createdCard, ...cards])
      setIsAddingCard(false)
    } catch (error) {
      console.error('Error adding card:', error)
      // Fallback to local storage
      const card: Card = {
        ...newCard,
        id: uuidv4(),
        created_at: new Date(),
        updated_at: new Date()
      }
      const updatedCards = [card, ...cards]
      setCards(updatedCards)
      localStorage.setItem('medical-cards', JSON.stringify(updatedCards))
      setIsAddingCard(false)
    }
  }

  const handleUpdateCard = async (updatedData: Partial<Card>) => {
    if (!selectedCard) return
    
    try {
      const updatedCard = await cardService.update(selectedCard.id, updatedData)
      const updatedCards = cards.map(card => 
        card.id === selectedCard.id ? updatedCard : card
      )
      setCards(updatedCards)
      setSelectedCard(null)
      setIsEditingCard(false)
    } catch (error) {
      console.error('Error updating card:', error)
      // Fallback to local storage
      const updatedCards = cards.map(card => 
        card.id === selectedCard.id 
          ? { ...card, ...updatedData, updated_at: new Date() }
          : card
      )
      setCards(updatedCards)
      localStorage.setItem('medical-cards', JSON.stringify(updatedCards))
      setSelectedCard(null)
      setIsEditingCard(false)
    }
  }

  const handleDeleteCard = async () => {
    if (!selectedCard) return
    
    try {
      await cardService.delete(selectedCard.id)
      const updatedCards = cards.filter(card => card.id !== selectedCard.id)
      setCards(updatedCards)
      setSelectedCard(null)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Error deleting card:', error)
      // Fallback to local storage
      const updatedCards = cards.filter(card => card.id !== selectedCard.id)
      setCards(updatedCards)
      localStorage.setItem('medical-cards', JSON.stringify(updatedCards))
      setSelectedCard(null)
      setShowDeleteConfirm(false)
    }
  }

  if (!isAuthenticated) {
    return <PasscodeScreen onSuccess={() => setIsAuthenticated(true)} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto">
        <header className="bg-white shadow-sm px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">診察券</h1>
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 active:scale-95"
          >
            <FiPlus size={20} />
          </button>
        </header>
        
        <main className="py-6">
          <CardList cards={cards} onCardClick={setSelectedCard} />
        </main>
        
        {selectedCard && !isEditingCard && (
          <CardDetail
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
            onEdit={() => setIsEditingCard(true)}
            onDelete={() => setShowDeleteConfirm(true)}
          />
        )}
        
        {isAddingCard && (
          <AddCard
            onClose={() => setIsAddingCard(false)}
            onSave={handleAddCard}
          />
        )}
        
        {isEditingCard && selectedCard && (
          <EditCard
            card={selectedCard}
            onClose={() => setIsEditingCard(false)}
            onSave={handleUpdateCard}
          />
        )}
        
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fade-in">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                カードを削除
              </h3>
              <p className="text-gray-600 mb-6">
                このカードを削除してもよろしいですか？この操作は取り消せません。
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDeleteCard}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}