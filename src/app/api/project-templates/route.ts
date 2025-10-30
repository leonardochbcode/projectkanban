import { NextResponse } from 'next/server';
import { getProjectTemplates, createProjectTemplate } from '@/lib/queries';
import { z } from 'zod';

const templateTaskSchema = z.object({
  title: z.string().min(1, 'O título da tarefa é obrigatório.'),
  description: z.string().optional(),
  priority: z.enum(['Baixa', 'Média', 'Alta']),
  dueDayOffset: z.number().int('O prazo deve ser um número inteiro.'),
});

const projectTemplateSchema = z.object({
  name: z.string().min(1, 'O nome do template é obrigatório.'),
  description: z.string().optional(),
  tasks: z.array(templateTaskSchema),
});

export async function GET() {
  try {
    const templates = await getProjectTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Failed to fetch project templates:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = await projectTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Dados inválidos', errors: validation.error.format() }, { status: 400 });
    }

    const newTemplate = await createProjectTemplate(validation.data);
    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error('Failed to create project template:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
