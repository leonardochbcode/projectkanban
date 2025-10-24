'use client';
import { useState, useMemo } from 'react';
import type { Task, ChecklistItem } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, Edit, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaskChecklistProps {
  task: Task;
  onUpdate: () => void;
}

export function TaskChecklist({ task, onUpdate }: TaskChecklistProps) {
  const [newItemText, setNewItemText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');
  const { toast } = useToast();

  const checklist = useMemo(() => task.checklist || [], [task.checklist]);

  const handleToggleItem = async (item: ChecklistItem) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}/checklist/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !item.completed }),
      });
      if (!response.ok) throw new Error('Failed to update item');
      onUpdate();
    } catch (error) {
      console.error("Error toggling checklist item:", error);
      toast({ title: "Erro", description: "Falha ao atualizar o item.", variant: "destructive" });
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newItemText.trim() }),
      });
      if (!response.ok) throw new Error('Failed to add item');
      setNewItemText('');
      onUpdate();
    } catch (error) {
      console.error("Error adding checklist item:", error);
      toast({ title: "Erro", description: "Falha ao adicionar o item.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}/checklist/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove item');
      onUpdate();
    } catch (error) {
      console.error("Error removing checklist item:", error);
      toast({ title: "Erro", description: "Falha ao remover o item.", variant: "destructive" });
    }
  };

  const handleUpdateItem = async (itemId: string) => {
    if (!editingItemText.trim()) return;
    try {
      const response = await fetch(`/api/tasks/${task.id}/checklist/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editingItemText.trim() }),
      });
      if (!response.ok) throw new Error('Failed to update item');
      setEditingItemId(null);
      onUpdate();
    } catch (error) {
      console.error("Error updating checklist item:", error);
      toast({ title: "Erro", description: "Falha ao atualizar o item.", variant: "destructive" });
    }
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
              onCheckedChange={() => handleToggleItem(item)}
            />
            {editingItemId === item.id ? (
              <Input
                value={editingItemText}
                onChange={(e) => setEditingItemText(e.target.value)}
                onBlur={() => handleUpdateItem(item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateItem(item.id);
                  if (e.key === 'Escape') setEditingItemId(null);
                }}
                className="h-7 text-sm"
                autoFocus
              />
            ) : (
              <label
                htmlFor={item.id}
                className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}
              >
                {item.text}
              </label>
            )}
            <div className="opacity-0 group-hover:opacity-100 flex items-center">
              {editingItemId === item.id ? (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleUpdateItem(item.id)}>
                  <Save className="h-4 w-4 text-primary" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                  setEditingItemId(item.id);
                  setEditingItemText(item.text);
                }}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleRemoveItem(item.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
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
