'use client';

import { useState } from 'react';
import { useStore } from '@/hooks/use-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, Edit, Check } from 'lucide-react';
import { availablePermissions, type Permission } from '@/lib/types';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

export function ManageRoles() {
  const { roles, addRole, updateRole, deleteRole } = useStore();
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingRoleName, setEditingRoleName] = useState('');
  const [editingPermissions, setEditingPermissions] = useState<Permission[]>([]);

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoleName.trim()) {
      addRole({ name: newRoleName.trim(), permissions: [] });
      setNewRoleName('');
    }
  };

  const handleEditStart = (roleId: string, currentName: string, currentPermissions: Permission[]) => {
    setEditingRoleId(roleId);
    setEditingRoleName(currentName);
    setEditingPermissions(currentPermissions);
  };

  const handleEditCancel = () => {
    setEditingRoleId(null);
    setEditingRoleName('');
    setEditingPermissions([]);
  };

  const handleUpdateRole = () => {
    if (editingRoleId && editingRoleName.trim()) {
      updateRole({ id: editingRoleId, name: editingRoleName.trim(), permissions: editingPermissions });
      handleEditCancel();
    }
  };
  
  const onPermissionChange = (permission: Permission, checked: boolean) => {
    setEditingPermissions(prev =>
      checked ? [...prev, permission] : prev.filter(p => p !== permission)
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Funções</CardTitle>
        <CardDescription>Adicione, edite ou remova funções e suas permissões.</CardDescription>
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
            <div key={role.id} className="p-2 rounded-md bg-muted/50">
              <div className="flex items-center justify-between">
                {editingRoleId === role.id ? (
                  <Input
                    value={editingRoleName}
                    onChange={(e) => setEditingRoleName(e.target.value)}
                    className="h-8"
                  />
                ) : (
                  <span className="text-sm font-medium">{role.name}</span>
                )}

                <div className="flex items-center gap-1">
                  {editingRoleId === role.id ? (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleUpdateRole}>
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEditCancel}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditStart(role.id, role.name, role.permissions)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteRole(role.id)}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {editingRoleId === role.id && (
                <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-sm">Permissões</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(availablePermissions).map(([key, label]) => (
                            <div key={key} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`${role.id}-${key}`}
                                    checked={editingPermissions.includes(key as Permission)}
                                    onCheckedChange={(checked) => onPermissionChange(key as Permission, !!checked)}
                                />
                                <Label htmlFor={`${role.id}-${key}`} className="text-sm font-normal">
                                    {label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
