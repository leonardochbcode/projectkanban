import { NextRequest, NextResponse } from 'next/server';
import { getMyPendingTasks } from '@/lib/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId') || undefined;
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;

    const filters = { projectId, status, priority };

    const tasks = await getMyPendingTasks(session.user.id, filters);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to fetch user tasks:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}