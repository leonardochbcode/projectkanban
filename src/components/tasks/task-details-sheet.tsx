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
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/lib/types';
import { useStore } from '@/hooks/use-store';
import { CalendarIcon, User, Tag, Flag, ChevronsUpDown } from 'lucide-react';
import { AiTaskAnalyzer } from './ai-task-analyzer';
import { Separator } from '../ui/separator';

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
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground w-32">
                <Flag className="h-4 w-4" />
                <span>Priority</span>
              </div>
              <Select value={task.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground w-32">
                    <User className="h-4 w-4" />
                    <span>Assignee</span>
                </div>
                 <Select value={assignee?.id} onValueChange={handleAssigneeChange}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                        {participants.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground w-32">
                <CalendarIcon className="h-4 w-4" />
                <span>Due Date</span>
              </div>
              <p>{new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <Separator />
          
          <AiTaskAnalyzer task={task} />
          
          <Separator />
          
          <div>
            <h3 className="font-semibold mb-2 font-headline">Comments</h3>
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
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
