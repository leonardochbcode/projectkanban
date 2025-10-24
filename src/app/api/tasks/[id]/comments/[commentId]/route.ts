import { NextResponse } from 'next/server';
import { updateTaskComment, deleteTaskComment } from '@/lib/queries';

type RouteParams = {
  params: {
    id: string;
    commentId: string;
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { commentId } = await params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ message: 'Content is required' }, { status: 400 });
    }

    const updatedComment = await updateTaskComment(commentId, content);

    if (!updatedComment) {
      return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error(`Failed to update comment ${params.commentId}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { commentId } = await params;
    const result = await deleteTaskComment(commentId);

    if (!result.success) {
      return NextResponse.json({ message: 'Comment not found or could not be deleted' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`Failed to delete comment ${params.commentId}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
