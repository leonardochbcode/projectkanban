import { NextResponse } from 'next/server';
import { deleteTaskAttachment } from '@/lib/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type RouteParams = {
  params: {
    id: string;
    attachmentId: string;
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { attachmentId } = await params;

    if (!attachmentId) {
      return NextResponse.json({ message: 'Attachment ID is required' }, { status: 400 });
    }

    const result = await deleteTaskAttachment(attachmentId);

    if (!result.success) {
        // This could be because the attachment was not found
        return NextResponse.json({ message: 'Attachment not found or could not be deleted' }, { status: 404 });
    }

    // Optionally, you might want to delete the file from the filesystem here as well.
    // For now, we'll just delete the database record.

    return new Response(null, { status: 204 }); // 204 No Content for successful deletion
  } catch (error) {
    console.error(`Failed to delete attachment ${params.attachmentId}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}