import { NextResponse } from 'next/server';
import { createTaskComment } from '@/lib/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type RouteParams = {
  params: {
    id: string;
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: taskId } = params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ message: 'Content is required' }, { status: 400 });
    }

    const newComment = await createTaskComment(taskId, session.user.id, content);

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error(`Failed to create comment for task ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
