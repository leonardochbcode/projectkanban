import { NextResponse } from 'next/server';
import { getClientById, updateClient, deleteClient } from '@/lib/queries';
import { partialClientSchema } from '@/lib/schemas';

type RouteParams = {
  params: {
    id: string;
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const client = await getClientById(id);

    if (!client) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error(`Failed to fetch client ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const json = await request.json();
    const parsed = partialClientSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: parsed.error.errors }, { status: 400 });
    }

    const updatedClient = await updateClient(id, parsed.data);

    if (!updatedClient) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error(`Failed to update client ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const result = await deleteClient(id);

    if (!result.success) {
      return NextResponse.json({ message: 'Client not found or could not be deleted' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`Failed to delete client ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
