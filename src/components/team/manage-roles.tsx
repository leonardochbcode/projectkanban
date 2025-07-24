'use client';

import { useState } from 'react';
import { useStore } from '@/hooks/use-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, Edit, Check } from 'lucide-react';

export function ManageRoles() {
  const { roles, addRole, updateRole, deleteRole } = useStore();
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingRoleName, setEditingRoleName] = useState('');

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoleName.trim()) {
      addRole({ name: newRoleName.trim() });
      setNewRoleName('');
    }
  };

  const handleEditStart = (roleId: string, currentName: string) => {
    setEditingRoleId(roleId);
    setEditingRoleName(currentName);
  };

  const handleEditCancel = () => {
    setEditingRoleId(null);
    setEditingRoleName('');
  };
  
  const handleUpdateRole = () => {
    if (editingRoleId && editingRoleName.trim()) {
      updateRole({ id: editingRoleId, name: editingRoleName.trim() });
      handleEditCancel();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Funções</CardTitle>
        <CardDescription>Adicione, edite ou remova funções para sua equipe.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddRole} className="flex gap-2 mb-4">
          <Input
            placeholder="Nome da nova função"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
          <Button type="submit">Adicionar</Button>
        </form>
        <div className="space-y-2">
          {roles.map((role) => (
            <div key={role.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
              {editingRoleId === role.id ? (
                <Input
                  value={editingRoleName}
                  onChange={(e) => setEditingRoleName(e.target.value)}
                  className="h-8"
                  autoFocus
                  onBlur={handleUpdateRole}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateRole()}
                />
              ) : (
                <span className="text-sm font-medium">{role.name}</span>
              )}

              <div className="flex items-center gap-1">
                {editingRoleId === role.id ? (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleUpdateRole}>
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditStart(role.id, role.name)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteRole(role.id)}>
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
