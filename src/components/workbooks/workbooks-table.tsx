'use client';
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Workbook, Project } from '@/lib/types';
import { MoreVertical, Edit, ChevronDown, ChevronRight, FolderKanban, Trash2 } from 'lucide-react';
import { Progress } from '../ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useStore } from '@/hooks/use-store';
import { ManageWorkbookProjectsDialog } from './manage-workbook-projects-dialog';
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

interface WorkbooksTableProps {
  workbooks: Workbook[];
  onEdit: (workbook: Workbook) => void;
}

function WorkbookProjectsRow({ workbook, projects, isVisible }: { workbook: Workbook, projects: Project[], isVisible: boolean }) {
  if (!isVisible) return null;

  return (
    <TableRow className="bg-muted/50 hover:bg-muted/50">
      <TableCell colSpan={4} className="p-0">
        <div className="p-4">
          <h4 className="text-sm font-semibold mb-2">Projetos na Pasta de Trabalho: {workbook.name}</h4>
          {projects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Projeto</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map(project => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Link href={`/projects/${project.id}`} className="hover:underline">
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell>{project.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground px-4 py-2">Nenhum projeto neste workbook.</p>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

export function WorkbooksTable({ workbooks, onEdit }: WorkbooksTableProps) {
  const { getProject, deleteWorkbook } = useStore();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [isProjectsDialogOpen, setIsProjectsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWorkbook, setSelectedWorkbook] = useState<Workbook | null>(null);

  const toggleRow = (workbookId: string) => {
    setExpandedRows(prev => ({ ...prev, [workbookId]: !prev[workbookId] }));
  };

  const handleManageProjects = (workbook: Workbook) => {
    setSelectedWorkbook(workbook);
    setIsProjectsDialogOpen(true);
  };

  const handleDelete = (workbook: Workbook) => {
    setSelectedWorkbook(workbook);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedWorkbook) {
      deleteWorkbook(selectedWorkbook.id);
    }
    setIsDeleteDialogOpen(false);
    setSelectedWorkbook(null);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Nº de Projetos</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workbooks.map((workbook) => {
            const projects = workbook.projectIds.map(id => getProject(id)).filter(Boolean) as Project[];
            const completedProjects = projects.filter(p => p.status === 'Concluído').length;
            const progress = projects.length > 0 ? (completedProjects / projects.length) * 100 : 0;
            const isExpanded = expandedRows[workbook.id];
            return (
              <React.Fragment key={workbook.id}>
                <TableRow>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => toggleRow(workbook.id)} className="h-8 w-8">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">
                    {workbook.name}
                  </TableCell>
                  <TableCell>
                    {projects.length}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={progress} className="w-[100px]" />
                      <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => onEdit(workbook)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleManageProjects(workbook)}>
                          <FolderKanban className="mr-2 h-4 w-4" />
                          Gerenciar Projetos
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleDelete(workbook)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                <WorkbookProjectsRow workbook={workbook} projects={projects} isVisible={isExpanded} />
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>

      {selectedWorkbook && (
        <ManageWorkbookProjectsDialog
          workbook={selectedWorkbook}
          open={isProjectsDialogOpen}
          onOpenChange={setIsProjectsDialogOpen}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o workbook
              e removerá todas as associações de projetos (os projetos não serão excluídos).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
