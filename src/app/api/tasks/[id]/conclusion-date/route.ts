import { NextResponse } from 'next/server';
import { updateTaskConclusionDate } from '@/lib/queries';
import { z } from 'zod';

const routeContextSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const bodySchema = z.object({
  conclusionDate: z.string().nullable(),
});

export async function PUT(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    const { params } = routeContextSchema.parse(context);
    const { id } = params;
    const body = await req.json();
    const { conclusionDate } = bodySchema.parse(body);

    const updatedTask = await updateTaskConclusionDate(id, conclusionDate);

    return NextResponse.json(updatedTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }
    console.error("Error updating task conclusion date:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
