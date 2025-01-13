'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ParticleBackground from './ParticleBackground'

type Player = 'X' | 'O'
type Cell = { player: Player; order: number } | null
type Board = Cell[]

interface GameState {
  board: Board
  currentPlayer: Player
  winner: Player | null
  placedPieces: { [key in Player]: number }
  currentMoveIndex: { [key in Player]: number }
}

const INITIAL_STATE: GameState = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  winner: null,
  placedPieces: { X: 0, O: 0 },
  currentMoveIndex: { X: 0, O: 0 }
}

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

const COLORS = {
  X: '#ff00ff', // Magenta neón
  O: '#00ffff', // Cyan neón
}

export default function TicTacToe() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [xSound, setXSound] = useState<HTMLAudioElement | null>(null)
  const [oSound, setOSound] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    setAudio(new Audio('/tateti-ngc/public/background-music.mp3'))
    setXSound(new Audio('/x-sound.mp3'))
    setOSound(new Audio('/o-sound.mp3'))
  }, [])

  useEffect(() => {
    if (audio) {
      audio.loop = true
      audio.play()
    }
    return () => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [audio])

  const playSound = useCallback((player: Player) => {
    if (player === 'X' && xSound) {
      xSound.currentTime = 0
      xSound.play()
    } else if (player === 'O' && oSound) {
      oSound.currentTime = 0
      oSound.play()
    }
  }, [xSound, oSound])

  const checkWinner = (board: Board): Player | null => {
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo
      if (board[a] && board[b] && board[c] &&
          board[a].player === board[b].player && 
          board[a].player === board[c].player) {
        return board[a].player
      }
    }
    return null
  }

  const handleCellClick = useCallback((index: number) => {
    setGameState((prevState) => {
      if (prevState.winner) return prevState

      const newBoard = [...prevState.board]
      const currentPlayer = prevState.currentPlayer
      const placedPieces = { ...prevState.placedPieces }
      const currentMoveIndex = { ...prevState.currentMoveIndex }

      if (placedPieces[currentPlayer] < 3) {
        // Placing new piece
        if (newBoard[index] === null) {
          newBoard[index] = { player: currentPlayer, order: placedPieces[currentPlayer] }
          placedPieces[currentPlayer]++
          playSound(currentPlayer)
        } else {
          return prevState
        }
      } else {
        // Moving existing piece
        const pieceToMove = newBoard.findIndex(
          (cell) => cell?.player === currentPlayer && cell.order === currentMoveIndex[currentPlayer]
        )
        if (pieceToMove === -1 || newBoard[index] === null) {
          newBoard[index] = newBoard[pieceToMove]
          newBoard[pieceToMove] = null
          currentMoveIndex[currentPlayer] = (currentMoveIndex[currentPlayer] + 1) % 3
          playSound(currentPlayer)
        } else {
          return prevState
        }
      }

      const winner = checkWinner(newBoard)
      const nextPlayer = currentPlayer === 'X' ? 'O' : 'X'

      return {
        board: newBoard,
        currentPlayer: nextPlayer,
        winner,
        placedPieces,
        currentMoveIndex,
      }
    })
  }, [playSound])

  const resetGame = () => {
    setGameState(INITIAL_STATE)
  }

  const isMovingPhase = gameState.placedPieces.X === 3 && gameState.placedPieces.O === 3
  const blinkingIndex = isMovingPhase
    ? gameState.board.findIndex(
        (cell) => cell?.player === gameState.currentPlayer && cell.order === gameState.currentMoveIndex[gameState.currentPlayer]
      )
    : -1

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gray-900">
      <ParticleBackground />
      <div className="z-10 bg-gray-800 bg-opacity-60 p-8 rounded-xl shadow-2xl backdrop-blur-sm">
        <h1 className="text-5xl font-bold mb-8 text-white text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-cyan-500">
          Tateti Infinito
        </h1>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {gameState.board.map((cell, index) => (
            <motion.button
              key={index}
              className={`w-24 h-24 text-6xl font-bold rounded-lg shadow-lg transition-all duration-300 transform ${
                index === blinkingIndex ? 'animate-pulse' : ''
              }`}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                boxShadow: cell ? `0 0 20px ${COLORS[cell.player]}` : 'none',
              }}
              onClick={() => handleCellClick(index)}
              disabled={gameState.winner !== null}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence>
                {cell && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{ color: COLORS[cell.player] }}
                  >
                    {cell.player}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
        {gameState.winner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-4 text-white bg-gradient-to-r from-green-400 to-blue-500 p-4 rounded-lg text-center"
          >
            ¡Jugador {gameState.winner} ha ganado!
          </motion.div>
        )}
        <motion.button
          className="mt-4 px-6 py-3 text-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 w-full"
          onClick={resetGame}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Reiniciar Juego
        </motion.button>
      </div>
    </div>
  )
}

