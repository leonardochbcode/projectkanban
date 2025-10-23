'use client';
import { useState } from 'react';
import { useStore } from '@/hooks/use-store';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { ProjectTemplate } from '@/lib/types';
import { ManageTemplateDialog } from './manage-template-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function ManageTemplates() {
  const { data: session } = useSession();
  const { projectTemplates, deleteProjectTemplate } = useStore();
  const [editingTemplate, setEditingTemplate] = useState<ProjectTemplate | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAdd = () => {
    setEditingTemplate(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (template: ProjectTemplate) => {
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingTemplate(undefined);
    }
    setIsDialogOpen(open);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Templates de Projeto</CardTitle>
          <CardDescription>Crie e gerencie templates para agilizar a criação de projetos.</CardDescription>
        </div>
        {session?.user?.userType !== 'Convidado' && (
          <Button onClick={handleAdd}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Template
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ManageTemplateDialog
          template={editingTemplate}
          open={isDialogOpen}
          onOpenChange={handleDialogClose}
        />
        <div className="space-y-2">
          {projectTemplates.map((template) => (
            <div key={template.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
              <div>
                <p className="font-semibold">{template.name}</p>
                <p className="text-xs text-muted-foreground">{template.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{template.tasks.length} tarefas pré-definidas</p>
              </div>
              {session?.user?.userType !== 'Convidado' && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente o template.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteProjectTemplate(template.id)}>
                          Continuar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
