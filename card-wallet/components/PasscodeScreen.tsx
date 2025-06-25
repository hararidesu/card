'use client'

import { useState } from 'react'

interface PasscodeScreenProps {
  onSuccess: () => void
}

export default function PasscodeScreen({ onSuccess }: PasscodeScreenProps) {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState(false)

  const handleNumberClick = (num: string) => {
    if (passcode.length < 4) {
      const newPasscode = passcode + num
      setPasscode(newPasscode)
      
      if (newPasscode.length === 4) {
        if (newPasscode === '0314') {
          setTimeout(() => onSuccess(), 300)
        } else {
          setError(true)
          setTimeout(() => {
            setPasscode('')
            setError(false)
          }, 1000)
        }
      }
    }
  }

  const handleDelete = () => {
    setPasscode(passcode.slice(0, -1))
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white text-center mb-8">
          パスコードを入力
        </h1>
        
        <div className="flex justify-center space-x-4 mb-8">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index < passcode.length
                  ? error
                    ? 'bg-red-500'
                    : 'bg-white'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="h-20 bg-gray-800 hover:bg-gray-700 text-white text-2xl font-medium rounded-xl transition-all duration-200 active:scale-95"
            >
              {num}
            </button>
          ))}
          
          <div />
          
          <button
            onClick={() => handleNumberClick('0')}
            className="h-20 bg-gray-800 hover:bg-gray-700 text-white text-2xl font-medium rounded-xl transition-all duration-200 active:scale-95"
          >
            0
          </button>
          
          <button
            onClick={handleDelete}
            className="h-20 bg-gray-800 hover:bg-gray-700 text-white text-xl font-medium rounded-xl transition-all duration-200 active:scale-95"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  )
}