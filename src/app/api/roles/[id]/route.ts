import { NextResponse } from 'next/server';
import { getRoleById, updateRole, deleteRole } from '@/lib/queries';
import { partialRoleSchema } from '@/lib/schemas';

type RouteParams = {
  params: {
    id: string;
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const role = await getRoleById(id);

    if (!role) {
      return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error(`Failed to fetch role ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const json = await request.json();
    const parsed = partialRoleSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: parsed.error.errors }, { status: 400 });
    }

    const updatedRole = await updateRole(id, parsed.data);

    if (!updatedRole) {
      return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error(`Failed to update role ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    await deleteRole(id);
    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`Failed to delete role ${params.id}:`, error);
    if (error instanceof Error && error.message.includes('currently in use')) {
        return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
