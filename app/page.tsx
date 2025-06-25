"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Lock, Sparkles, Users, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Analytics } from "@vercel/analytics/next"

export default function HomePage() {
  const [roomCode, setRoomCode] = useState("")
  const router = useRouter()

  const createRoom = () => {
    const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    router.push(`/room/${newRoomCode}?creator=true`)
  }

  const joinRoom = () => {
    if (roomCode.trim()) {
      router.push(`/room/${roomCode.toUpperCase()}`)
    }
  }

  return (
      <>
        <Analytics />

        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
          {/* Header */}
          <header className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                    className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white"/>
                </div>
                <span
                    className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              LoveSpace
            </span>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <main className="container mx-auto px-4 py-12">
            <div className="text-center mb-16">
              <div
                  className="inline-flex items-center space-x-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4"/>
                <span>Private & Secure</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Private Space for
                <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent block">
              Love & Connection
            </span>
              </h1>

              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                Create a beautiful, private space where you and your partner can share heartfelt messages, memories, and
                moments that matter most.
              </p>

              {/* Action Cards */}
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
                <Card
                    className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-pink-500 to-pink-600 text-white cursor-pointer"
                    onClick={createRoom}
                >
                  <CardContent className="p-8 text-center">
                    <div
                        className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Heart className="w-8 h-8"/>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Create Your Space</h3>
                    <p className="text-pink-100 mb-4">Start a new private room and invite your partner</p>
                    <Button variant="secondary" className="bg-white text-pink-600 hover:bg-pink-50">
                      Create Room <ArrowRight className="w-4 h-4 ml-2"/>
                    </Button>
                  </CardContent>
                </Card>

                <Card
                    className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-8 text-center">
                    <div
                        className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Users className="w-8 h-8"/>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Join Your Partner</h3>
                    <p className="text-purple-100 mb-4">Enter your room code to connect</p>
                    <div className="space-y-3">
                      <Input
                          placeholder="Enter room code"
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value)}
                          className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                          onKeyPress={(e) => e.key === "Enter" && joinRoom()}
                      />
                      <Button
                          variant="secondary"
                          className="w-full bg-white text-purple-600 hover:bg-purple-50"
                          onClick={joinRoom}
                          disabled={!roomCode.trim()}
                      >
                        Join Room <ArrowRight className="w-4 h-4 ml-2"/>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6 text-pink-600"/>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Private & Secure</h3>
                <p className="text-gray-600">
                  Your messages are completely private, shared only between you and your partner.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-purple-600"/>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Beautiful Messages</h3>
                <p className="text-gray-600">Express your feelings with beautifully designed message cards and
                  themes.</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-pink-600"/>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized</h3>
                <p className="text-gray-600">
                  Customize your space with themes and colors that reflect your unique relationship.
                </p>
              </div>
            </div>
          </main>
        </div>
      </>
  )
}
