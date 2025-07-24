import type { Project, Task, Participant, Role, Client } from './types';

export const initialRoles: Role[] = [
  { id: 'role-1', name: 'Gerente', permissions: ['view_dashboard', 'manage_projects', 'manage_clients', 'manage_team', 'view_reports', 'manage_settings'] },
  { id: 'role-2', name: 'Desenvolvedor', permissions: ['view_dashboard', 'manage_projects', 'view_reports'] },
  { id: 'role-3', name: 'Designer', permissions: ['view_dashboard', 'manage_projects'] },
  { id: 'role-4', name: 'Analista', permissions: ['view_dashboard', 'view_reports'] },
];

export const initialParticipants: Participant[] = [
  { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.com', roleId: 'role-1', avatar: '/avatars/01.png', password: 'password123' },
  { id: 'user-2', name: 'Bob Williams', email: 'bob@example.com', roleId: 'role-2', avatar: '/avatars/02.png', password: 'password123' },
  { id: 'user-3', name: 'Charlie Brown', email: 'charlie@example.com', roleId: 'role-3', avatar: '/avatars/03.png', password: 'password123' },
  { id: 'user-4', name: 'Diana Prince', email: 'diana@example.com', roleId: 'role-4', avatar: '/avatars/04.png', password: 'password123' },
];

export const initialClients: Client[] = [
    { id: 'client-1', name: 'Acme Corporation', email: 'contact@acme.com', company: 'Acme Corp', avatar: '/avatars/c01.png', cnpj: '00.000.000/0001-00', address: '123 Main St, Anytown, USA', suportewebCode: 'ACME001' },
    { id: 'client-2', name: 'Stark Industries', email: 'tony@starkindustries.com', company: 'Stark Industries', avatar: '/avatars/c02.png', cnpj: '11.111.111/0001-11', address: '10880 Malibu Point, 90265', suportewebCode: 'STARK002' },
    { id: 'client-3', name: 'Wayne Enterprises', email: 'bruce@wayne.com', company: 'Wayne Enterprises', avatar: '/avatars/c03.png', cnpj: '22.222.222/0001-22', address: '1007 Mountain Drive, Gotham', suportewebCode: 'WAYNE003' },
];


export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Redesign do Website',
    description: 'Revisão completa do site da empresa com uma UI/UX moderna.',
    startDate: '2024-08-01',
    endDate: '2024-10-31',
    status: 'Em Andamento',
    participantIds: ['user-1', 'user-2', 'user-3'],
    clientId: 'client-1',
  },
  {
    id: 'proj-2',
    name: 'Desenvolvimento de App Móvel',
    description: 'Criar um novo aplicativo móvel para as plataformas iOS e Android.',
    startDate: '2024-09-15',
    endDate: '2025-01-15',
    status: 'Planejamento',
    participantIds: ['user-1', 'user-2', 'user-4'],
    clientId: 'client-2',
  },
  {
    id: 'proj-3',
    name: 'Campanha de Marketing',
    description: 'Lançar uma nova campanha de marketing para o lançamento do produto do 4º trimestre.',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    status: 'Pausado',
    participantIds: ['user-1', 'user-4'],
    clientId: 'client-3',
  },
  {
    id: 'proj-4',
    name: 'Integração de API',
    description: 'Integrar APIs de terceiros para funcionalidades estendidas.',
    startDate: '2024-07-20',
    endDate: '2024-09-20',
    status: 'Concluído',
    participantIds: ['user-2'],
  },
];

export const initialTasks: Task[] = [
  // Project 1 Tasks
  { id: 'task-1', projectId: 'proj-1', title: 'Desenhar mockups da nova homepage', description: 'Criar mockups de alta fidelidade no Figma.', status: 'Concluída', priority: 'Alta', dueDate: '2024-08-15', assigneeId: 'user-3', comments: [] },
  { id: 'task-2', projectId: 'proj-1', title: 'Desenvolver componentes de frontend', description: 'Construir componentes React para o novo sistema de design.', status: 'Em Andamento', priority: 'Alta', dueDate: '2024-09-30', assigneeId: 'user-2', comments: [{ id: 'comment-1', content: 'Precisamos garantir que os componentes sejam acessíveis.', authorId: 'user-1', createdAt: '2024-09-01T10:00:00Z' }] },
  { id: 'task-3', projectId: 'proj-1', title: 'Configurar repositório do projeto', description: 'Inicializar repositório no GitHub e estrutura básica do projeto.', status: 'Concluída', priority: 'Média', dueDate: '2024-08-05', assigneeId: 'user-2', comments: [] },
  { id: 'task-4', projectId: 'proj-1', title: 'Teste de usuário para o novo design', description: 'Realizar testes de usabilidade com um grupo de foco.', status: 'A Fazer', priority: 'Média', dueDate: '2024-10-10', assigneeId: 'user-4', comments: [] },

  // Project 2 Tasks
  { id: 'task-5', projectId: 'proj-2', title: 'Definir recursos e requisitos do app', description: 'Criar um documento detalhado de requisitos do produto.', status: 'Em Andamento', priority: 'Alta', dueDate: '2024-09-30', assigneeId: 'user-1', comments: [] },
  { id: 'task-6', projectId: 'proj-2', title: 'Escolher a stack de tecnologia', description: 'Pesquisar e decidir as melhores tecnologias para o aplicativo.', status: 'A Fazer', priority: 'Alta', dueDate: '2024-10-05', assigneeId: 'user-2', comments: [] },

  // Project 3 Tasks
  { id: 'task-7', projectId: 'proj-3', title: 'Criar texto para anúncios', description: 'Escrever textos persuasivos para anúncios em redes sociais.', status: 'A Fazer', priority: 'Média', dueDate: '2024-10-15', comments: [] },

  // Project 4 Tasks
  { id: 'task-8', projectId: 'proj-4', title: 'Implementar API de gateway de pagamento', description: 'Integrar a API do Stripe para pagamentos.', status: 'Concluída', priority: 'Alta', dueDate: '2024-08-30', assigneeId: 'user-2', comments: [] },
];
