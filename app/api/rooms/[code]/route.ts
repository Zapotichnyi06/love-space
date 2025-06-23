import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params

    // Get room data
    const rooms = await sql`
      SELECT * FROM rooms WHERE code = ${code}
    `

    if (rooms.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const room = rooms[0]

    // Get room users
    const users = await sql`
      SELECT username FROM room_users WHERE room_id = ${room.id}
    `

    // Get messages
    const messages = await sql`
      SELECT * FROM messages 
      WHERE room_id = ${room.id} 
      ORDER BY created_at ASC
    `

    return NextResponse.json({
      room: {
        id: room.id,
        code: room.code,
        theme: room.theme,
        created_at: room.created_at,
      },
      users: users.map((u) => u.username),
      messages: messages.map((m) => ({
        id: m.id.toString(),
        text: m.text,
        author: m.author,
        timestamp: m.created_at,
        color: m.color,
      })),
    })
  } catch (error) {
    console.error("Error fetching room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params

    // Create new room
    const result = await sql`
      INSERT INTO rooms (code, theme) 
      VALUES (${code}, 'Romantic Pink')
      RETURNING *
    `

    const room = result[0]

    return NextResponse.json({
      room: {
        id: room.id,
        code: room.code,
        theme: room.theme,
        created_at: room.created_at,
      },
      users: [],
      messages: [],
    })
  } catch (error) {
    console.error("Error creating room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
