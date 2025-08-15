'use client';
import { type ReactNode, useState } from 'react';
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
import type { Lead } from '@/lib/types';
import { useStore } from '@/hooks/use-store';
import { CalendarIcon, ChevronsUpDown, Mail, Phone, Building, DollarSign, Briefcase, Paperclip, X, Edit, Folder } from 'lucide-react';
import { Separator } from '../ui/separator';
import { LeadCommentForm } from './lead-comment-form';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { LeadAttachmentForm } from './lead-attachment-form';
import { formatBytes } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';

function ConvertToProjectDialog({ 
    open, 
    onOpenChange, 
    lead 
}: { 
    open: boolean, 
    onOpenChange: (open: boolean) => void, 
    lead: Lead 
}) {
    const { addClient, addProject, getClient, workspaces } = useStore();
    const router = useRouter();
    const { toast } = useToast();
    const [workspaceId, setWorkspaceId] = useState<string | undefined>(workspaces[0]?.id);
    const existingClient = lead.clientId ? getClient(lead.clientId) : null;

    const handleConvert = () => {
        if (!workspaceId) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Por favor, selecione um espaço de trabalho.',
            });
            return;
        }

        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + 30);

        let finalClientId = lead.clientId;
        if (!finalClientId) {
            const newClient = addClient({
                name: lead.company || lead.name,
                email: lead.email,
                company: lead.company,
                phone: lead.phone,
            });
            finalClientId = newClient.id;
        }
        
        const newProject = addProject({
            name: `Projeto: ${lead.name}`,
            description: lead.description,
            clientId: finalClientId,
            startDate: format(today, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
            status: 'Planejamento',
            leadId: lead.id,
            workspaceId: workspaceId,
        });

        toast({
            title: 'Proposta Convertida!',
            description: `O projeto "${newProject.name}" foi criado com sucesso.`,
        });

        onOpenChange(false);
        router.push(`/projects/${newProject.id}`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Converter Proposta em Projeto</DialogTitle>
                    <DialogDescription>
                        Selecione o espaço de trabalho para o novo projeto.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="workspace">Espaço de Trabalho</Label>
                    <Select value={workspaceId} onValueChange={setWorkspaceId}>
                        <SelectTrigger id="workspace">
                            <SelectValue placeholder="Selecione um espaço..." />
                        </SelectTrigger>
                        <SelectContent>
                            {workspaces.map(ws => (
                                <SelectItem key={ws.id} value={ws.id}>{ws.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleConvert}>Confirmar Conversão</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function LeadDetailsSheet({ 
    lead, 
    children, 
    onEdit,
    open,
    onOpenChange,
}: { 
    lead: Lead; 
    children?: ReactNode, 
    onEdit: (lead: Lead) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
  const { participants, updateLead, getClient } = useStore();
  const existingClient = lead.clientId ? getClient(lead.clientId) : null;
  const [isSheetOpen, setIsSheetOpen] = useState(open ?? false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setIsSheetOpen(isOpen);
    onOpenChange?.(isOpen);
  };

  const handleStatusChange = (status: Lead['status']) => {
    updateLead({ ...lead, status });
  };
  
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(lead.value);
  
  const handleRemoveAttachment = (attachmentId: string) => {
    const updatedAttachments = lead.attachments.filter(att => att.id !== attachmentId);
    updateLead({ ...lead, attachments: updatedAttachments });
  };
  
  const Trigger = children ? <SheetTrigger asChild onClick={() => handleOpenChange(true)}>{children}</SheetTrigger> : null;

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={handleOpenChange}>
        {Trigger}
        <SheetContent className="sm:max-w-xl w-full overflow-y-auto">
          <SheetHeader className="mb-4 pr-12">
              <div className="flex justify-between items-start">
                  <div>
                      <SheetTitle className="font-headline text-2xl">{lead.name}</SheetTitle>
                      <SheetDescription>{lead.description}</SheetDescription>
                  </div>
                   <Button variant="outline" onClick={() => { handleOpenChange(false); onEdit(lead); }}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                  </Button>
              </div>
          </SheetHeader>
          <div className="space-y-6">
            <div className="grid gap-3 text-sm">
               <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground w-32">
                  <ChevronsUpDown className="h-4 w-4" />
                  <span>Status</span>
                </div>
                <Select value={lead.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Novo">Novo</SelectItem>
                    <SelectItem value="Em Contato">Em Contato</SelectItem>
                    <SelectItem value="Proposta Enviada">Proposta Enviada</SelectItem>
                    <SelectItem value="Convertido">Convertido</SelectItem>
                    <SelectItem value="Perdido">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground w-32">
                      <DollarSign className="h-4 w-4" />
                      <span>Valor</span>
                  </div>
                  <p className="font-semibold">{formattedValue}</p>
              </div>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground w-32">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                  </div>
                  <p>{lead.email}</p>
              </div>
               {lead.phone && (
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground w-32">
                          <Phone className="h-4 w-4" />
                          <span>Telefone</span>
                      </div>
                      <p>{lead.phone}</p>
                  </div>
              )}
              {lead.company && (
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground w-32">
                          <Building className="h-4 w-4" />
                          <span>Empresa</span>
                      </div>
                      <p>{lead.company}</p>
                  </div>
              )}
              {existingClient && (
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground w-32">
                          <Briefcase className="h-4 w-4" />
                          <span>Cliente Vinculado</span>
                      </div>
                      <p className="font-medium">{existingClient.name}</p>
                  </div>
              )}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground w-32">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Data de Criação</span>
                </div>
                <p>{new Date(lead.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {lead.status !== 'Convertido' && (
               <Button onClick={() => setIsConvertDialogOpen(true)} className="w-full">
                  Converter em Projeto
              </Button>
            )}
                      
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2 font-headline">Anexos</h3>
               <div className="space-y-2">
                  {lead.attachments.map((attachment) => (
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
                  {lead.attachments.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhum anexo ainda.</p>
                  )}
               </div>
               <LeadAttachmentForm lead={lead} />
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-4 font-headline">Comentários e Apontamentos</h3>
              <div className="space-y-4">
                {lead.comments.map((comment) => {
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
                 {lead.comments.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum comentário ainda.</p>
                )}
              </div>
              <Separator className="my-4" />
              <LeadCommentForm lead={lead} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <ConvertToProjectDialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen} lead={lead} />
    </>
  );
}
