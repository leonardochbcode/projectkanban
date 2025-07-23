'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/hooks/use-store';

export function RecentActivity() {
  const { tasks, projects, participants } = useStore();
  
  // This is a simplified recent activity feed. 
  // In a real app, this would come from a dedicated activity log.
  const recentTasks = tasks.slice(-5).reverse();

  return (
    <Card className="col-span-12 lg:col-span-3">
      <CardHeader>
        <CardTitle className="font-headline">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTasks.map((task) => {
             const participant = participants.find(p => p.id === task.assigneeId);
             const project = projects.find(p => p.id === task.projectId);
             return (
                 <div key={task.id} className="flex items-start gap-4">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={participant?.avatar} alt="Avatar" />
                        <AvatarFallback>{participant?.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">
                            <span className="font-semibold">{participant?.name || 'Unassigned'}</span> updated a task
                        </p>
                        <p className="text-sm text-muted-foreground">
                            "{task.title}" in <span className="font-medium">{project?.name}</span>
                        </p>
                    </div>
                </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  );
}
