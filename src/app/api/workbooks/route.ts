import { NextResponse } from 'next/server';
import { createWorkbook, getWorkbooksByWorkspace } from '@/lib/queries';
import { workbookSchema } from '@/lib/schemas';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workspaceId = await searchParams.get('workspaceId');

  if (!workspaceId) {
    return NextResponse.json({ message: 'workspaceId is required' }, { status: 400 });
  }

  try {
    const workbooks = await getWorkbooksByWorkspace(workspaceId);
    return NextResponse.json(workbooks);
  } catch (error) {
    console.error('Failed to fetch workbooks:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = await workbookSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: parsed.error.errors }, { status: 400 });
    }

    const newWorkbook = await createWorkbook(parsed.data);

    return NextResponse.json(newWorkbook, { status: 201 });
  } catch (error) {
    console.error('Failed to create workbook:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
