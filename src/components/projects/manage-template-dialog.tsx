'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useStore } from '@/hooks/use-store';
import type { ProjectTemplate, TemplateTask } from '@/lib/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ManageTemplateDialogProps {
  template?: ProjectTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageTemplateDialog({ template, open, onOpenChange }: ManageTemplateDialogProps) {
  const { addProjectTemplate, updateProjectTemplate } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState<TemplateTask[]>([]);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setTasks(template.tasks || []);
    } else {
      setName('');
      setDescription('');
      setTasks([]);
    }
  }, [template, open]);

  const handleTaskChange = (index: number, field: keyof TemplateTask, value: string | number) => {
    const newTasks = [...tasks];
    (newTasks[index] as any)[field] = value;
    setTasks(newTasks);
  };

  const addTask = () => {
    setTasks([
      ...tasks,
      { title: '', description: '', priority: 'Média', dueDayOffset: 0 },
    ]);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const templateData = { name, description, tasks };

    if (template) {
      updateProjectTemplate({ ...template, ...templateData });
    } else {
      addProjectTemplate(templateData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-headline">
              {template ? 'Editar Template' : 'Criar Novo Template'}
            </DialogTitle>
            <DialogDescription>
              {template
                ? 'Atualize os detalhes do template e suas tarefas.'
                : 'Crie um novo template com tarefas pré-definidas.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Template</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <h4 className="font-medium mb-2">Tarefas do Template</h4>
              <div className="space-y-4 max-h-64 overflow-y-auto p-1">
                {tasks.map((task, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 p-2 border rounded-md relative">
                    <div className="col-span-12">
                        <Label>Título</Label>
                        <Input
                            value={task.title}
                            onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                            placeholder="Título da tarefa"
                        />
                    </div>
                     <div className="col-span-12">
                        <Label>Descrição</Label>
                        <Textarea
                            value={task.description}
                            onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                            placeholder="Descrição da tarefa"
                            rows={2}
                        />
                    </div>
                    <div className="col-span-5">
                         <Label>Prioridade</Label>
                         <Select
                            value={task.priority}
                            onValueChange={(v: TemplateTask['priority']) => handleTaskChange(index, 'priority', v)}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Baixa">Baixa</SelectItem>
                                <SelectItem value="Média">Média</SelectItem>
                                <SelectItem value="Alta">Alta</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-5">
                        <Label>Prazo (dias após início)</Label>
                        <Input
                            type="number"
                            value={task.dueDayOffset}
                            onChange={(e) => handleTaskChange(index, 'dueDayOffset', Number(e.target.value))}
                        />
                    </div>
                     <div className="col-span-2 flex items-end">
                        <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeTask(index)}
                        className="w-full"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={addTask} className="mt-2">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Tarefa
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{template ? 'Salvar Alterações' : 'Criar Template'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
