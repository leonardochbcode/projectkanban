'use client';
import { type ReactNode } from 'react';
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
import { CalendarIcon, User, Flag, ChevronsUpDown, Paperclip, X } from 'lucide-react';
import { Separator } from '../ui/separator';
import { TaskCommentForm } from './task-comment-form';
import { TaskAttachmentForm } from './task-attachment-form';
import { Button } from '../ui/button';
import { formatBytes } from '@/lib/utils';


export function TaskDetailsSheet({ task, children }: { task: Task; children: ReactNode }) {
  const { participants, updateTask } = useStore();
  const assignee = participants.find((p) => p.id === task.assigneeId);

  const handleStatusChange = (status: Task['status']) => {
    updateTask({ ...task, status });
  };
  const handlePriorityChange = (priority: Task['priority']) => {
    updateTask({ ...task, priority });
  };
  const handleAssigneeChange = (assigneeId: string) => {
    updateTask({ ...task, assigneeId });
  };
  
  const handleRemoveAttachment = (attachmentId: string) => {
    const updatedAttachments = (task.attachments || []).filter(att => att.id !== attachmentId);
    updateTask({ ...task, attachments: updatedAttachments });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
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
                    <Select value={assignee?.id} onValueChange={handleAssigneeChange}>
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
            <h3 className="font-semibold mb-2 font-headline">Anexos</h3>
             <div className="space-y-2">
                {(task.attachments || []).map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                        <div className="flex items-center gap-2 overflow-hidden">
                           <Paperclip className="h-4 w-4 flex-shrink-0" />
                           <div className="truncate">
                            <p className="font-medium truncate">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">{formatBytes(attachment.size)}</p>
                           </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => handleRemoveAttachment(attachment.id)}>
                            <X className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                {(!task.attachments || task.attachments.length === 0) && (
                    <p className="text-sm text-muted-foreground">Nenhum anexo ainda.</p>
                )}
             </div>
             <TaskAttachmentForm task={task} />
          </div>

          <Separator />
          
          <div>
            <h3 className="font-semibold mb-4 font-headline">Comentários</h3>
            <div className="space-y-4">
              {task.comments.map((comment) => {
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
               {task.comments.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum comentário ainda.</p>
              )}
            </div>
            <Separator className="my-4" />
            <TaskCommentForm task={task} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
