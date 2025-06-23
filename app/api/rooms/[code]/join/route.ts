import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Get room
    const rooms = await sql`
      SELECT id FROM rooms WHERE code = ${code}
    `

    if (rooms.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const roomId = rooms[0].id

    // Add user to room (or update if already exists)
    await sql`
      INSERT INTO room_users (room_id, username) 
      VALUES (${roomId}, ${username})
      ON CONFLICT (room_id, username) 
      DO UPDATE SET joined_at = CURRENT_TIMESTAMP
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error joining room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
