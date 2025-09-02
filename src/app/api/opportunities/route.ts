import { NextResponse } from 'next/server';
import { getOpportunities, createOpportunity } from '@/lib/queries';
import { opportunitySchema } from '@/lib/schemas';

export async function GET() {
  try {
    const opportunities = await getOpportunities();
    return NextResponse.json(opportunities);
  } catch (error) {
    console.error('Failed to fetch opportunities:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = opportunitySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: parsed.error.errors }, { status: 400 });
    }

    const newOpportunity = await createOpportunity(parsed.data);

    return NextResponse.json(newOpportunity, { status: 201 });
  } catch (error) {
    console.error('Failed to create opportunity:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
