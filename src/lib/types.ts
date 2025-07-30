export const availablePermissions = {
    view_dashboard: 'Ver Painel',
    manage_projects: 'Gerenciar Projetos',
    manage_clients: 'Gerenciar Clientes',
    manage_leads: 'Gerenciar Leads',
    manage_team: 'Gerenciar Equipe',
    view_reports: 'Ver Relatórios',
    manage_settings: 'Gerenciar Configurações'
} as const;

export type Permission = keyof typeof availablePermissions;

export interface CompanyInfo {
    name: string;
    cnpj: string;
    address: string;
    suportewebCode: string;
    logoUrl?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  avatar?: string;
  cnpj?: string;
  address?: string;
  suportewebCode?: string;
}

export interface LeadComment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface LeadAttachment {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string; // In a real app, this would be a URL to the stored file
    createdAt: string;
}

export interface Lead {
    id: string;
    name: string;
    email: string;
    company?: string;
    phone?: string;
    description: string;
    status: 'Novo' | 'Em Contato' | 'Proposta Enviada' | 'Convertido' | 'Perdido';
    createdAt: string;
    comments: LeadComment[];
    attachments: LeadAttachment[];
    value: number;
    clientId?: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  roleId: string;
  avatar: string;
  password?: string;
}

export interface TaskComment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'A Fazer' | 'Em Andamento' | 'Concluída';
  priority: 'Baixa' | 'Média' | 'Alta';
  dueDate: string;
  assigneeId?: string;
  projectId: string;
  comments: TaskComment[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'Planejamento' | 'Em Andamento' | 'Pausado' | 'Concluído';
  participantIds: string[];
  clientId?: string;
  leadId?: string;
}
