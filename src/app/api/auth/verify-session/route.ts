import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { userId, sessionToken } = await req.json();

    if (!userId || !sessionToken) {
      return NextResponse.json({ error: 'User ID and session token are required' }, { status: 400 });
    }

    const result = await pool.query(
      'SELECT active_session_token FROM participants WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    const isValid = user.active_session_token === sessionToken;
    return NextResponse.json({ valid: isValid });

  } catch (error) {
    console.error('Session verification API error:', error);
    // In case of any error, treat the session as invalid for security.
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}