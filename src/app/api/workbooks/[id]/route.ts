import { NextResponse } from 'next/server';
import { updateWorkbook, deleteWorkbook, getWorkbookById } from '@/lib/queries';
import { partialWorkbookSchema } from '@/lib/schemas';

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const workbook = await getWorkbookById(id);

    if (!workbook) {
      return NextResponse.json({ message: 'Workbook not found' }, { status: 404 });
    }

    return NextResponse.json(workbook);
  } catch (error) {
    console.error(`Failed to fetch workbook ${(await params).id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const json = await request.json();
    const parsed = partialWorkbookSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: parsed.error.errors }, { status: 400 });
    }

    const updatedWorkbook = await updateWorkbook(id, parsed.data);

    if (!updatedWorkbook) {
      return NextResponse.json({ message: 'Workbook not found' }, { status: 404 });
    }

    return NextResponse.json(updatedWorkbook);
  } catch (error) {
    console.error(`Failed to update workbook ${(await params).id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await deleteWorkbook(id);

    if (!result.success) {
      return NextResponse.json({ message: 'Workbook not found or could not be deleted' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`Failed to delete workbook ${(await params).id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
