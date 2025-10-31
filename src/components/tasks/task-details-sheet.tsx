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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Task, Comment } from '@/lib/types';
import { useStore } from '@/hooks/use-store';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, User, Flag, ChevronsUpDown, Paperclip, X, Edit, Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { TaskCommentForm } from './task-comment-form';
import { TaskAttachmentForm } from './task-attachment-form';
import { Button } from '../ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  const [title, setTitle] = useState(initialTask.title);
  const [description, setDescription] = useState(initialTask.description);
  const [startDate, setStartDate] = useState(initialTask.startDate);
  const [dueDate, setDueDate] = useState(initialTask.dueDate);
  const [conclusionDate, setConclusionDate] = useState(initialTask.conclusionDate);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingStartDate, setIsEditingStartDate] = useState(false);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [isEditingConclusionDate, setIsEditingConclusionDate] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

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
      setTitle(freshTask.title);
      setDescription(freshTask.description);
      setStartDate(freshTask.startDate);
      setDueDate(freshTask.dueDate);
      setConclusionDate(freshTask.conclusionDate);
    } catch (error) {
      console.error("Error fetching task details:", error);
      // Optionally, show a toast to the user
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setTask(initialTask);
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      fetchTask();
    }
  }, [open, initialTask]);

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

  const handleUpdateComment = async () => {
    if (!editingComment || !editingCommentText.trim()) return;

    // Optimistic UI update
    const originalComments = task.comments || [];
    const updatedComments = originalComments.map(c =>
      c.id === editingComment.id ? { ...c, content: editingCommentText.trim() } : c
    );
    setTask(prevTask => ({ ...prevTask, comments: updatedComments }));
    setEditingComment(null);

    try {
      const response = await fetch(`/api/tasks/${task.id}/comments/${editingComment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingCommentText.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      toast({
        title: 'Comentário atualizado',
        description: 'O comentário foi atualizado com sucesso.',
      });

      await fetchTask(); // Refresh data

    } catch (error) {
      console.error("Error updating comment:", error);
      // Revert on failure
      setTask(prevTask => ({ ...prevTask, comments: originalComments }));
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o comentário. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    // Optimistic UI update
    const originalComments = task.comments || [];
    const updatedComments = originalComments.filter(c => c.id !== commentToDelete.id);
    setTask(prevTask => ({ ...prevTask, comments: updatedComments }));
    setCommentToDelete(null);

    try {
      const response = await fetch(`/api/tasks/${task.id}/comments/${commentToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      toast({
        title: 'Comentário removido',
        description: 'O comentário foi removido com sucesso.',
      });

      await fetchTask(); // Refresh data

    } catch (error) {
      console.error("Error removing comment:", error);
      // Revert on failure
      setTask(prevTask => ({ ...prevTask, comments: originalComments }));
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o comentário. Tente novamente.',
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
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <Input
                id="task-title"
                className="font-headline text-2xl h-auto p-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  if (title !== task.title) {
                    updateTask({ title });
                  }
                  setIsEditingTitle(false);
                }}
                autoFocus
              />
            ) : (
              <SheetTitle
                className="font-headline text-2xl"
                onClick={() => setIsEditingTitle(true)}
              >
                {task.title}
              </SheetTitle>
            )}
            {!isEditingTitle && (
              <Button variant="ghost" size="icon" onClick={() => setIsEditingTitle(true)} className="h-7 w-7">
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditingDescription ? (
              <Textarea
                id="task-description"
                className="h-auto p-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm text-muted-foreground flex-1"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => {
                  if (description !== task.description) {
                    updateTask({ description });
                  }
                  setIsEditingDescription(false);
                }}
                placeholder="Adicione uma descrição para a tarefa..."
                autoFocus
              />
            ) : (
              <>
                <SheetDescription
                  onClick={() => setIsEditingDescription(true)}
                  className="cursor-pointer"
                >
                  {task.description || 'Adicione uma descrição...'}
                </SheetDescription>
                <Button variant="ghost" size="icon" onClick={() => setIsEditingDescription(true)} className="h-7 w-7 flex-shrink-0">
                  <Edit className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
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
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground w-32">
                <CalendarIcon className="h-4 w-4" />
                <span>Data de Início</span>
              </div>
              {isEditingStartDate ? (
                <Input
                  type="date"
                  value={startDate ? new Date(startDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setStartDate(e.target.value)}
                  onBlur={() => {
                    if (startDate !== task.startDate) {
                      updateTask({ startDate });
                    }
                    setIsEditingStartDate(false);
                  }}
                  autoFocus
                  className="w-48"
                />
              ) : (
                <div onClick={() => setIsEditingStartDate(true)} className="w-48 cursor-pointer">
                  <p>{task.startDate ? new Date(task.startDate).toLocaleDateString() : 'Não definida'}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground w-32">
                <CalendarIcon className="h-4 w-4" />
                <span>Data de Prazo</span>
              </div>
              {isEditingDueDate ? (
                <Input
                  type="date"
                  value={dueDate ? new Date(dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setDueDate(e.target.value)}
                  onBlur={() => {
                    if (dueDate !== task.dueDate) {
                      updateTask({ dueDate });
                    }
                    setIsEditingDueDate(false);
                  }}
                  autoFocus
                  className="w-48"
                />
              ) : (
                <div onClick={() => setIsEditingDueDate(true)} className="w-48 cursor-pointer">
                  <p>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Não definida'}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground w-32">
                <CalendarIcon className="h-4 w-4" />
                <span>Data da Criação</span>
              </div>
              <p>{new Date(task.creationDate).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground w-32">
                <CalendarIcon className="h-4 w-4" />
                <span>Data de Conclusão</span>
              </div>
              {isEditingConclusionDate ? (
                <Input
                  type="date"
                  value={conclusionDate ? new Date(conclusionDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setConclusionDate(e.target.value)}
                  onBlur={async () => {
                    if (conclusionDate !== task.conclusionDate) {
                      const originalTask = task;
                      setTask(prev => ({ ...prev!, conclusionDate: conclusionDate }));

                      try {
                        const response = await fetch(`/api/tasks/${task.id}/conclusion-date`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ conclusionDate }),
                        });

                        if (!response.ok) {
                          throw new Error('Failed to update conclusion date');
                        }

                        const updatedTaskFromServer = await response.json();

                        updateTaskInStore(updatedTaskFromServer);
                        setTask(updatedTaskFromServer);

                        toast({
                          title: 'Data de conclusão atualizada',
                        });

                      } catch (error) {
                        setTask(originalTask);
                        toast({
                          title: 'Erro',
                          description: 'Não foi possível atualizar a data de conclusão.',
                          variant: 'destructive',
                        });
                      }
                    }
                    setIsEditingConclusionDate(false);
                  }}
                  autoFocus
                  className="w-48"
                />
              ) : (
                <div onClick={() => setIsEditingConclusionDate(true)} className="w-48 cursor-pointer">
                  <p>{task.conclusionDate ? new Date(task.conclusionDate).toLocaleDateString() : 'Não definida'}</p>
                </div>
              )}
            </div>
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-2 text-muted-foreground w-32 pt-2">
                <User className="h-4 w-4" />
                <span>Criador</span>
              </div>
              <div className="flex flex-col gap-2 w-48">
                <p>{participants.find((p) => p.id === task.creatorId)?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground w-32">
                <CalendarIcon className="h-4 w-4" />
                <span>Dias de Atraso</span>
              </div>
              <p>
                {Math.max(0, Math.floor((new Date().getTime() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24)))}
              </p>
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
                  <div key={comment.id} className="flex items-start gap-3 group">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={author?.avatar} />
                      <AvatarFallback>{author?.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{author?.name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                            setEditingComment(comment);
                            setEditingCommentText(comment.content);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCommentToDelete(comment)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      {editingComment?.id === comment.id ? (
                        <div className="mt-2">
                          <Textarea
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            className="text-sm"
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditingComment(null)}>Cancelar</Button>
                            <Button size="sm" onClick={handleUpdateComment}>Salvar</Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm bg-muted/50 p-2 rounded-md mt-1">{comment.content}</p>
                      )}
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
      <AlertDialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o comentário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
