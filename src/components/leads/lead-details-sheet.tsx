'use client';
import { type ReactNode } from 'react';
import {
  Sheet,
  SheetClose,
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
import { CalendarIcon, ChevronsUpDown, Mail, Phone, Building, DollarSign, Briefcase, Paperclip, X, Edit } from 'lucide-react';
import { Separator } from '../ui/separator';
import { LeadCommentForm } from './lead-comment-form';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { LeadAttachmentForm } from './lead-attachment-form';
import { formatBytes } from '@/lib/utils';

export function LeadDetailsSheet({ lead, children, onEdit }: { lead: Lead; children: ReactNode, onEdit: (lead: Lead) => void; }) {
  const { participants, updateLead, addClient, addProject, getClient } = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const existingClient = lead.clientId ? getClient(lead.clientId) : null;


  const handleStatusChange = (status: Lead['status']) => {
    updateLead({ ...lead, status });
  };
  
   const handleConvert = () => {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 30); // Set end date to 30 days from now

    let finalClientId: string;

    if (existingClient) {
      finalClientId = existingClient.id;
    } else {
       // 1. Create a new client from the lead if one isn't linked
      const newClient = addClient({
        name: lead.company || lead.name,
        email: lead.email,
        company: lead.company,
        phone: lead.phone,
      });
      finalClientId = newClient.id;
    }
    
    // 2. Create a new project linked to the new client
    const newProject = addProject({
      name: lead.name,
      description: lead.description,
      clientId: finalClientId,
      startDate: format(today, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      status: 'Planejamento',
    });

    // 3. Update the lead's status to 'Converted'
    updateLead({ ...lead, status: 'Convertido', clientId: finalClientId });

    toast({
      title: 'Lead Convertido!',
      description: `O projeto "${newProject.name}" foi criado com sucesso.`,
    });

    // 4. Redirect to the new project page
    router.push(`/projects/${newProject.id}`);
  };

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(lead.value);
  
  const handleRemoveAttachment = (attachmentId: string) => {
    const updatedAttachments = lead.attachments.filter(att => att.id !== attachmentId);
    updateLead({ ...lead, attachments: updatedAttachments });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-xl w-full overflow-y-auto">
        <SheetHeader className="mb-4 pr-12">
            <div className="flex justify-between items-start">
                <div>
                    <SheetTitle className="font-headline text-2xl">{lead.name}</SheetTitle>
                    <SheetDescription>{lead.description}</SheetDescription>
                </div>
                 <SheetClose asChild>
                    <Button variant="outline" onClick={() => onEdit(lead)}>
                        <Edit className="mr-2" />
                        Editar
                    </Button>
                 </SheetClose>
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
             <Button onClick={handleConvert} className="w-full">
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
  );
}
