import { NextResponse } from 'next/server';
import {
  getProjectTemplateById,
  updateProjectTemplate,
  deleteProjectTemplate,
} from '@/lib/queries';
import { z } from 'zod';

const templateTaskSchema = z.object({
  title: z.string().min(1, 'O título da tarefa é obrigatório.'),
  description: z.string().optional(),
  priority: z.enum(['Baixa', 'Média', 'Alta']),
  dueDayOffset: z.number().int('O prazo deve ser um número inteiro.'),
});

const projectTemplateUpdateSchema = z.object({
  name: z.string().min(1, 'O nome do template é obrigatório.').optional(),
  description: z.string().optional(),
  tasks: z.array(templateTaskSchema).optional(),
});

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(req: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    const template = await getProjectTemplateById(id);
    if (!template) {
      return NextResponse.json({ message: 'Template não encontrado' }, { status: 404 });
    }
    return NextResponse.json(template);
  } catch (error) {
    console.error(`Failed to fetch project template ${id}:`, error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    const body = await req.json();
    const validation = projectTemplateUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Dados inválidos', errors: validation.error.format() }, { status: 400 });
    }

    const updatedTemplate = await updateProjectTemplate(id, validation.data);
    if (!updatedTemplate) {
      return NextResponse.json({ message: 'Template não encontrado' }, { status: 404 });
    }
    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error(`Failed to update project template ${id}:`, error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    const result = await deleteProjectTemplate(id);
    if (!result.success) {
      return NextResponse.json({ message: 'Template não encontrado' }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete project template ${id}:`, error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
