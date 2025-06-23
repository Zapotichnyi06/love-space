import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params
    const { theme } = await request.json()

    if (!theme) {
      return NextResponse.json({ error: "Theme is required" }, { status: 400 })
    }

    // Update room theme
    const result = await sql`
      UPDATE rooms 
      SET theme = ${theme} 
      WHERE code = ${code}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, theme })
  } catch (error) {
    console.error("Error updating theme:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
