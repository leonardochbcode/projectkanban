'use client';
import { useState, useMemo } from 'react';
import type { Task, ChecklistItem } from '@/lib/types';
import { useStore } from '@/hooks/use-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2 } from 'lucide-react';

export function TaskChecklist({ task }: { task: Task }) {
  const { updateTask } = useStore();
  const [newItemText, setNewItemText] = useState('');

  const checklist = useMemo(() => task.checklist || [], [task.checklist]);

  const handleToggleItem = (itemId: string) => {
    const newChecklist = checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    updateTask({ ...task, checklist: newChecklist });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: `checklist-item-${Date.now()}`,
      text: newItemText.trim(),
      completed: false,
    };
    const newChecklist = [...checklist, newItem];
    updateTask({ ...task, checklist: newChecklist });
    setNewItemText('');
  };

  const handleRemoveItem = (itemId: string) => {
    const newChecklist = checklist.filter((item) => item.id !== itemId);
    updateTask({ ...task, checklist: newChecklist });
  };
  
  const completedCount = useMemo(() => checklist.filter(item => item.completed).length, [checklist]);
  const progress = useMemo(() => checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0, [completedCount, checklist.length]);

  return (
    <div className="space-y-4">
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
        </div>

      <div className="space-y-2">
        {checklist.map((item) => (
          <div key={item.id} className="flex items-center gap-2 group">
            <Checkbox
              id={item.id}
              checked={item.completed}
              onCheckedChange={() => handleToggleItem(item.id)}
            />
            <label
              htmlFor={item.id}
              className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}
            >
              {item.text}
            </label>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100"
              onClick={() => handleRemoveItem(item.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddItem} className="flex gap-2">
        <Input
          placeholder="Adicionar novo item..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
        />
        <Button type="submit" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
