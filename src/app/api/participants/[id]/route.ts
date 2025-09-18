import { NextResponse } from 'next/server';
import { getParticipantById, updateParticipant, deleteParticipant } from '@/lib/queries';
import { partialParticipantSchema } from '@/lib/schemas';

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const participant = await getParticipantById(id);

    if (!participant) {
      return NextResponse.json({ message: 'Participant not found' }, { status: 404 });
    }

    return NextResponse.json(participant);
  } catch (error) {
    console.error(`Failed to fetch participant ${(await params).id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const json = await request.json();

    // Do not allow password to be an empty string
    if (json.password === '') {
      delete json.password;
    }

    const parsed = partialParticipantSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: parsed.error.errors }, { status: 400 });
    }

    const updatedParticipant = await updateParticipant(id, parsed.data);

    if (!updatedParticipant) {
      return NextResponse.json({ message: 'Participant not found' }, { status: 404 });
    }

    return NextResponse.json(updatedParticipant);
  } catch (error) {
    console.error(`Failed to update participant ${(await params).id}:`, error);
    if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
      return NextResponse.json({ message: 'A participant with this email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await deleteParticipant(id);

    if (!result.success) {
      return NextResponse.json({ message: 'Participant not found or could not be deleted' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`Failed to delete participant ${(await params).id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
