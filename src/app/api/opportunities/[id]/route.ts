import { NextResponse } from 'next/server';
import { getOpportunityById, updateOpportunity, deleteOpportunity } from '@/lib/queries';
import { partialOpportunitySchema } from '@/lib/schemas';

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const opportunity = await getOpportunityById(id);

    if (!opportunity) {
      return NextResponse.json({ message: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error(`Failed to fetch opportunity ${(await params).id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const json = await request.json();
    const parsed = partialOpportunitySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: parsed.error.errors }, { status: 400 });
    }

    const updatedOpportunity = await updateOpportunity(id, parsed.data);

    if (!updatedOpportunity) {
      return NextResponse.json({ message: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json(updatedOpportunity);
  } catch (error) {
    console.error(`Failed to update opportunity ${(await params).id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await deleteOpportunity(id);

    if (!result.success) {
      return NextResponse.json({ message: 'Opportunity not found or could not be deleted' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`Failed to delete opportunity ${(await params).id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
