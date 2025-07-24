export interface Role {
  id: string;
  name: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  roleId: string;
  avatar: string;
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
}
