import { NextResponse } from 'next/server';
import { updateChecklistItem, deleteChecklistItem } from '@/lib/queries';

type RouteParams = {
  params: {
    id: string;
    itemId: string;
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { itemId } = params;
    const { completed } = await request.json();

    if (typeof completed !== 'boolean') {
      return NextResponse.json({ message: 'Completed status is required' }, { status: 400 });
    }

    const updatedItem = await updateChecklistItem(itemId, completed);

    if (!updatedItem) {
      return NextResponse.json({ message: 'Checklist item not found' }, { status: 404 });
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error(`Failed to update checklist item ${params.itemId}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { itemId } = params;
    const result = await deleteChecklistItem(itemId);

    if (!result.success) {
      return NextResponse.json({ message: 'Checklist item not found or could not be deleted' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`Failed to delete checklist item ${params.itemId}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
