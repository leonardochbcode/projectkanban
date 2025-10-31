export const availablePermissions = {
  view_dashboard: 'Ver Painel',
  manage_workspaces: 'Gerenciar Espaços de Trabalho',
  manage_projects: 'Gerenciar Projetos',
  view_all_projects: 'Ver Todos os Projetos',
  manage_clients: 'Gerenciar Clientes',
  manage_opportunities: 'Gerenciar Oportunidades',
  view_opportunity_values: 'Ver Valores das Oportunidades',
  manage_team: 'Gerenciar Equipe',
  view_reports: 'Ver Relatórios',
  manage_settings: 'Gerenciar Configurações'
} as const;

export type Permission = keyof typeof availablePermissions;

export interface EmailSettings {
  id: number;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password?: string;
}

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

export interface OpportunityComment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface OpportunityAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string; // In a real app, this would be a URL to the stored file
  createdAt: string;
}

export interface Opportunity {
  id: string;
  name: string;
  contactName: string;
  email: string;
  company?: string;
  phone?: string;
  description: string;
  status: 'A Analisar' | 'Contato Realizado' | 'Proposta Enviada' | 'Ganha' | 'Perdida';
  createdAt: string;
  comments: OpportunityComment[];
  attachments: OpportunityAttachment[];
  value: number;
  clientId?: string;
  ownerId: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  roleId: string | null;
  avatar: string;
  password?: string;
  userType: 'Colaborador' | 'Convidado';
}

export interface TaskComment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'A Fazer' | 'Em Andamento' | 'Concluída' | 'Cancelado';
  priority: 'Baixa' | 'Média' | 'Alta';
  startDate?: string;
  dueDate: string;
  assigneeId?: string;
  projectId: string;
  comments: TaskComment[];
  attachments: TaskAttachment[];
  checklist: ChecklistItem[];
  creationDate: string;
  conclusionDate?: string;
  creatorId: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'Planejamento' | 'Em Andamento' | 'Pausado' | 'Concluído' | 'Cancelado';
  participantIds: string[];
  workspaceId: string;
  clientId?: string;
  opportunityId?: string;
  pmoId?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  clientId?: string;
  responsibleId: string;
  participantIds: string[];
  isOwner?: boolean;
  status: 'Ativo' | 'Arquivado';
}

export interface Workbook {
  id: string;
  name: string;
  description: string;
  workspaceId: string;
  projectIds: string[];
}


// Tipos para Templates de Projeto
export interface TemplateTask {
  title: string;
  description: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  // A duração em dias a partir da data de início do projeto
  dueDayOffset: number;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  tasks: TemplateTask[];
}

export interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  project: string;
  dependencies?: string;
}
