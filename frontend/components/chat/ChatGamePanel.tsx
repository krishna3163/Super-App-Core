'use client'

import { useState } from 'react'
import { Play, RotateCw, PenTool, Ghost, Film, MessageCircleQuestion } from 'lucide-react'
import { startGame as startGameApi } from '@/services/apiServices'

export default function ChatGamePanel({ chatId }: { chatId: string }) {
  const [activeGame, setActiveGame] = useState<string | null>(null)

  const games = [
    { id: 'truth_or_dare', name: 'Truth or Dare', icon: MessageCircleQuestion, color: 'bg-pink-500' },
    { id: 'spin_the_wheel', name: 'Spin the Wheel', icon: RotateCw, color: 'bg-purple-500' },
    { id: 'draw_and_guess', name: 'Draw & Guess', icon: PenTool, color: 'bg-blue-500' },
    { id: 'werewolf', name: 'Werewolf', icon: Ghost, color: 'bg-gray-800' },
    { id: 'movie_guess', name: 'Movie Guess', icon: Film, color: 'bg-red-500' },
  ]

  const startGame = async (gameId: string) => {
    try { await startGameApi(gameId, chatId) } catch { /* fallback if service is not running */ }
    setActiveGame(gameId)
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-l dark:border-gray-700 w-80 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <h2 className="font-bold dark:text-white flex items-center gap-2">
          <Play size={18} className="text-blue-500 fill-blue-500" /> Play Games
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!activeGame ? (
          <div className="grid grid-cols-2 gap-3">
            {games.map(game => (
              <button
                key={game.id}
                onClick={() => startGame(game.id)}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border dark:border-gray-700 text-center"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${game.color}`}>
                  <game.icon size={20} />
                </div>
                <span className="text-xs font-bold dark:text-gray-300">{game.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col h-full relative">
            <button 
              onClick={() => setActiveGame(null)}
              className="text-xs text-blue-500 hover:underline mb-4"
            >
              ← Back to Games
            </button>
            
            <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-700 flex flex-col items-center justify-center p-4 text-center">
              {activeGame === 'draw_and_guess' && (
                <div className="w-full space-y-4">
                  <h3 className="font-bold text-lg dark:text-white">Draw & Guess</h3>
                  <div className="aspect-square w-full bg-white dark:bg-gray-800 border-2 border-dashed dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-400">
                    Canvas Area
                  </div>
                  <p className="text-sm dark:text-gray-300">It's your turn to draw!</p>
                  <p className="font-bold text-blue-500 text-xl tracking-widest">A P P L E</p>
                </div>
              )}

              {activeGame === 'truth_or_dare' && (
                <div className="w-full space-y-6">
                  <h3 className="font-bold text-lg dark:text-white">Truth or Dare</h3>
                  <div className="p-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl text-white shadow-lg">
                    <p className="font-medium text-sm opacity-80">It's John's turn!</p>
                    <p className="text-xl font-bold mt-2">Waiting for John to choose...</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-white text-pink-600 py-3 rounded-lg font-bold shadow-sm">Truth</button>
                    <button className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-bold shadow-sm">Dare</button>
                  </div>
                </div>
              )}

              {/* Render other games dynamically here */}
              {!['draw_and_guess', 'truth_or_dare'].includes(activeGame) && (
                <div className="text-gray-500">
                  <Play size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Game UI for {activeGame.replace(/_/g, ' ')}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
