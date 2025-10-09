import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getArchivedWorkspaces } from '@/lib/queries';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = await parseInt(searchParams.get('page') || '1', 10);
    const limit = await parseInt(searchParams.get('limit') || '10', 10);

    const { workspaces, total } = await getArchivedWorkspaces(session.user.id, page, limit);
    return NextResponse.json({ workspaces, total });
  } catch (error) {
    console.error('Failed to fetch archived workspaces:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}