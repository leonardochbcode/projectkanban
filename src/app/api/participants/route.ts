import { NextResponse } from 'next/server';
import { getParticipants, createParticipant } from '@/lib/queries';
import { participantSchema } from '@/lib/schemas';

export async function GET() {
  try {
    const participants = await getParticipants();
    return NextResponse.json(participants);
  } catch (error) {
    console.error('Failed to fetch participants:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = participantSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: parsed.error.errors }, { status: 400 });
    }

    const newParticipant = await createParticipant(parsed.data);

    return NextResponse.json(newParticipant, { status: 201 });
  } catch (error) {
    console.error('Failed to create participant:', error);
    // Could be a unique constraint violation (e.g., email already exists)
    if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
        return NextResponse.json({ message: 'A participant with this email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
