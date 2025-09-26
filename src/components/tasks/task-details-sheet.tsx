'use client';
import { type ReactNode, useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Task } from '@/lib/types';
import { useStore } from '@/hooks/use-store';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, User, Flag, ChevronsUpDown, Paperclip, X } from 'lucide-react';
import { Separator } from '../ui/separator';
import { TaskCommentForm } from './task-comment-form';
import { TaskAttachmentForm } from './task-attachment-form';
import { Button } from '../ui/button';
import { formatBytes } from '@/lib/utils';
import { TaskChecklist } from './task-checklist';

interface TaskDetailsSheetProps {
  task: Task;
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TaskDetailsSheet({ task: initialTask, children, open: openProp, onOpenChange: onOpenChangeProp }: TaskDetailsSheetProps) {
  const { participants, updateTask: updateTaskInStore } = useStore();
  const { toast } = useToast();
  const [task, setTask] = useState<Task>(initialTask);
  const [isLoading, setIsLoading] = useState(false);

  const assignee = participants.find((p) => p.id === task.assigneeId);

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined && onOpenChangeProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  
  const setOpen = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChangeProp(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const fetchTask = async () => {
    if (!task.id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`);
      if (!response.ok) throw new Error('Failed to fetch task');
      const freshTask = await response.json();
      setTask(freshTask);
    } catch (error) {
      console.error("Error fetching task details:", error);
      // Optionally, show a toast to the user
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchTask();
    }
  }, [open, initialTask.id]);

  // Sincroniza o estado interno se o componente se tornar controlado
  useEffect(() => {
    if (isControlled) {
      setInternalOpen(openProp);
    }
  }, [openProp, isControlled]);

  const updateTask = async (updatedFields: Partial<Task>) => {
    const optimisticTask = { ...task, ...updatedFields };
    setTask(optimisticTask); // Optimistic update

    try {
      await updateTaskInStore({ id: task.id, ...updatedFields });
      // No need to fetch again, as the store update will trigger a re-render if needed,
      // and for local state, we already updated it.
    } catch (error) {
      console.error("Failed to update task:", error);
      setTask(task); // Revert on failure
    }
  };

  const handleStatusChange = (status: Task['status']) => {
    updateTask({ status });
  };
  const handlePriorityChange = (priority: Task['priority']) => {
    updateTask({ priority });
  };
  const handleAssigneeChange = (assigneeId: string) => {
    updateTask({ assigneeId });
  };
  
  const handleRemoveAttachment = async (attachmentId: string) => {
    // Optimistic UI update
    const originalAttachments = task.attachments || [];
    const updatedAttachments = originalAttachments.filter(att => att.id !== attachmentId);
    setTask(prevTask => ({ ...prevTask, attachments: updatedAttachments }));

    try {
      const response = await fetch(`/api/tasks/${task.id}/attachments/${attachmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete attachment');
      }

      toast({
        title: 'Anexo removido',
        description: 'O anexo foi removido com sucesso.',
      });

      // The UI is already updated, but a full refetch ensures consistency.
      // If the optimistic update is reliable, you could skip this.
      await fetchTask();

    } catch (error) {
      console.error("Error removing attachment:", error);
      // Revert the optimistic update on failure
      setTask(prevTask => ({ ...prevTask, attachments: originalAttachments }));
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o anexo. Tente novamente.',
        variant: 'destructive',
      });
    }
  };
  
  const Trigger = children ? <SheetTrigger asChild>{children}</SheetTrigger> : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {Trigger}
      <SheetContent className="sm:max-w-xl w-full overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-headline text-2xl">{task.title}</SheetTitle>
          <SheetDescription>{task.description}</SheetDescription>
        </SheetHeader>
        <div className="space-y-6">
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground w-32">
                <ChevronsUpDown className="h-4 w-4" />
                <span>Status</span>
              </div>
              <Select value={task.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A Fazer">A Fazer</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluída">Concluída</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground w-32">
                <Flag className="h-4 w-4" />
                <span>Prioridade</span>
              </div>
              <Select value={task.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-start gap-4">
                <div className="flex items-center gap-2 text-muted-foreground w-32 pt-2">
                    <User className="h-4 w-4" />
                    <span>Responsável</span>
                </div>
                 <div className="flex flex-col gap-2 w-48">
                    <Select value={assignee?.id || 'unassigned'} onValueChange={handleAssigneeChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Não atribuído" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unassigned">Não atribuído</SelectItem>
                            {participants.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {assignee && <p className="text-sm text-muted-foreground">Analista: {assignee.name}</p>}
                 </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground w-32">
                <CalendarIcon className="h-4 w-4" />
                <span>Data de Prazo</span>
              </div>
              <p>{new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
                    
          <Separator />

          <div>
            <h3 className="font-semibold mb-4 font-headline">Checklist de Ações</h3>
            <TaskChecklist task={task} onUpdate={fetchTask} />
          </div>

          <Separator />

           <div>
            <h3 className="font-semibold mb-2 font-headline">Anexos</h3>
             <div className="space-y-2">
                {(task.attachments || []).map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 overflow-hidden flex-1 group"
                    >
                      <Paperclip className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                      <div className="truncate">
                        <p className="font-medium truncate group-hover:underline">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(attachment.size)}</p>
                      </div>
                    </a>
                    <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => handleRemoveAttachment(attachment.id)}>
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {(!task.attachments || task.attachments.length === 0) && (
                    <p className="text-sm text-muted-foreground">Nenhum anexo ainda.</p>
                )}
             </div>
             <TaskAttachmentForm task={task} onAttachmentAdded={fetchTask} />
          </div>

          <Separator />
          
          <div>
            <h3 className="font-semibold mb-4 font-headline">Comentários</h3>
            <div className="space-y-4">
              {(task.comments || []).map((comment) => {
                const author = participants.find(p => p.id === comment.authorId);
                return (
                  <div key={comment.id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={author?.avatar} />
                        <AvatarFallback>{author?.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                           <p className="font-semibold text-sm">{author?.name}</p>
                           <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</p>
                        </div>
                        <p className="text-sm bg-muted/50 p-2 rounded-md mt-1">{comment.content}</p>
                    </div>
                  </div>
                )
              })}
               {(!task.comments || task.comments.length === 0) && (
                <p className="text-sm text-muted-foreground">Nenhum comentário ainda.</p>
              )}
            </div>
            <Separator className="my-4" />
            <TaskCommentForm task={task} onCommentAdded={fetchTask} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
