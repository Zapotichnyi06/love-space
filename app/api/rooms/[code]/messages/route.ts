import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params
    const { text, author, color } = await request.json()

    if (!text || !author) {
      return NextResponse.json({ error: "Text and author are required" }, { status: 400 })
    }

    // Get room
    const rooms = await sql`
      SELECT id FROM rooms WHERE code = ${code}
    `

    if (rooms.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const roomId = rooms[0].id

    // Insert message
    const result = await sql`
      INSERT INTO messages (room_id, text, author, color) 
      VALUES (${roomId}, ${text}, ${author}, ${color || "from-pink-500 to-rose-500"})
      RETURNING *
    `

    const message = result[0]

    return NextResponse.json({
      id: message.id.toString(),
      text: message.text,
      author: message.author,
      timestamp: message.created_at,
      color: message.color,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
