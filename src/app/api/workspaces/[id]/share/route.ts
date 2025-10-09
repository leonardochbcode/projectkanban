import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getWorkspaceById, updateWorkspaceParticipants } from '@/lib/queries';

interface PutParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: PutParams) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const workspaceId = id;

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Optional: Check if the current user is the owner of the workspace before allowing sharing.
    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace || workspace.responsibleId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { participantIds } = await request.json();

    if (!Array.isArray(participantIds)) {
      return NextResponse.json({ message: 'Invalid request body, participantIds must be an array.' }, { status: 400 });
    }

    await updateWorkspaceParticipants(workspaceId, participantIds);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(`Failed to update participants for workspace ${workspaceId}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}