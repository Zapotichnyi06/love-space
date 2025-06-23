"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Heart, Send, Copy, Check, Settings, Palette, Users, ArrowLeft, Loader2 } from "lucide-react"
import { useParams, useSearchParams, useRouter } from "next/navigation"

interface Message {
  id: string
  text: string
  author: string
  timestamp: Date
  color: string
}

interface RoomData {
  room: {
    id: number
    code: string
    theme: string
    created_at: string
  }
  users: string[]
  messages: Message[]
}

const themes = [
  { name: "Romantic Pink", primary: "from-pink-500 to-rose-500", secondary: "bg-pink-50", accent: "text-pink-600" },
  {
    name: "Purple Dreams",
    primary: "from-purple-500 to-indigo-500",
    secondary: "bg-purple-50",
    accent: "text-purple-600",
  },
  { name: "Sunset Love", primary: "from-orange-400 to-pink-500", secondary: "bg-orange-50", accent: "text-orange-600" },
  { name: "Ocean Breeze", primary: "from-blue-400 to-cyan-500", secondary: "bg-blue-50", accent: "text-blue-600" },
]

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [userName, setUserName] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [isJoined, setIsJoined] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isCreator = searchParams.get("creator") === "true"

  const roomCode = params.code as string

  const fetchRoomData = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomCode}`)
      if (response.ok) {
        const data = await response.json()
        setRoomData(data)
        setCurrentTheme(themes.findIndex((t) => t.name === data.room.theme) || 0)
      } else if (response.status === 404 && isCreator) {
        // Create new room
        const createResponse = await fetch(`/api/rooms/${roomCode}`, {
          method: "POST",
        })
        if (createResponse.ok) {
          const data = await createResponse.json()
          setRoomData(data)
        }
      }
    } catch (error) {
      console.error("Error fetching room data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoomData()
  }, [roomCode, isCreator])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [roomData?.messages])

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!isJoined) return

    const interval = setInterval(() => {
      fetchRoomData()
    }, 3000)

    return () => clearInterval(interval)
  }, [isJoined, roomCode])

  const joinRoom = async () => {
    if (!userName.trim() || !roomData) return

    try {
      const response = await fetch(`/api/rooms/${roomCode}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: userName }),
      })

      if (response.ok) {
        setIsJoined(true)
        fetchRoomData() // Refresh data
      }
    } catch (error) {
      console.error("Error joining room:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !roomData || !userName || sending) return

    setSending(true)
    try {
      const response = await fetch(`/api/rooms/${roomCode}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newMessage,
          author: userName,
          color: themes[currentTheme].primary,
        }),
      })

      if (response.ok) {
        setNewMessage("")
        fetchRoomData() // Refresh messages
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const changeTheme = async (themeIndex: number) => {
    if (!roomData) return

    try {
      const response = await fetch(`/api/rooms/${roomCode}/theme`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme: themes[themeIndex].name }),
      })

      if (response.ok) {
        setCurrentTheme(themeIndex)
        fetchRoomData() // Refresh data
      }
    } catch (error) {
      console.error("Error updating theme:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 text-pink-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
            <p className="text-gray-600">Connecting to your love space</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Not Found</h2>
            <p className="text-gray-600 mb-6">This room doesn't exist or has expired.</p>
            <Button onClick={() => router.push("/")} className="bg-gradient-to-r from-pink-500 to-purple-500">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div
              className={`w-16 h-16 bg-gradient-to-r ${themes[currentTheme].primary} rounded-full flex items-center justify-center mx-auto mb-4`}
            >
              <Heart className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Join Love Space</CardTitle>
            <p className="text-gray-600">
              Room: <Badge variant="secondary">{roomCode}</Badge>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <Input
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && joinRoom()}
              />
            </div>
            <Button
              onClick={joinRoom}
              disabled={!userName.trim()}
              className={`w-full bg-gradient-to-r ${themes[currentTheme].primary} hover:opacity-90`}
            >
              Join Room <Heart className="w-4 h-4 ml-2" />
            </Button>

            {roomData.users.length > 0 && (
              <div className="text-center text-sm text-gray-600">
                <Users className="w-4 h-4 inline mr-1" />
                {roomData.users.length} user{roomData.users.length !== 1 ? "s" : ""} in room
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${themes[currentTheme].secondary}`}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 bg-gradient-to-r ${themes[currentTheme].primary} rounded-full flex items-center justify-center`}
                >
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">Love Space</h1>
                  <p className="text-xs text-gray-500">Room: {roomCode}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={copyRoomCode}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl min-h-[calc(100vh-80px)] flex flex-col">
        {/* Settings Panel */}
        {showSettings && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Customize Your Space
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {themes.map((theme, index) => (
                  <button
                    key={theme.name}
                    onClick={() => changeTheme(index)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      currentTheme === index ? "border-gray-400" : "border-gray-200"
                    }`}
                  >
                    <div className={`w-full h-8 bg-gradient-to-r ${theme.primary} rounded mb-2`}></div>
                    <p className="text-xs font-medium">{theme.name}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Messages */}
        <div className="space-y-4 mb-6 flex-1 overflow-y-auto">
          {roomData.messages.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Heart className={`w-16 h-16 mx-auto mb-4 ${themes[currentTheme].accent}`} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Conversation</h3>
                <p className="text-gray-600">
                  Send your first loving message to begin this beautiful journey together.
                </p>
              </CardContent>
            </Card>
          ) : (
            roomData.messages.map((message) => (
              <Card key={message.id} className={`${message.author === userName ? "ml-12" : "mr-12"}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-8 h-8 bg-gradient-to-r ${message.color} rounded-full flex items-center justify-center flex-shrink-0`}
                    >
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{message.author}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <Card className="mt-auto">
          <CardContent className="p-4 bg-white/95 backdrop-blur-sm border-t">
            <div className="flex space-x-3">
              <Textarea
                placeholder="Write a loving message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 min-h-[80px] resize-none"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                disabled={sending}
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className={`bg-gradient-to-r ${themes[currentTheme].primary} hover:opacity-90 px-6`}
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Room Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Share room code <Badge variant="secondary">{roomCode}</Badge> with your partner
          </p>
          <p className="mt-1">
            {roomData.users.length} user{roomData.users.length !== 1 ? "s" : ""} connected
          </p>
        </div>
      </div>
    </div>
  )
}
