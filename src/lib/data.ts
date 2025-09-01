import type { Project, Task, Participant, Role, Client, Opportunity, CompanyInfo, ProjectTemplate, Workspace } from './types';

export const initialRoles: Role[] = [
  { id: 'role-1', name: 'Gerente', permissions: ['view_dashboard', 'manage_workspaces', 'manage_projects', 'manage_clients', 'manage_team', 'view_reports', 'manage_settings', 'manage_opportunities', 'view_opportunity_values'] },
  { id: 'role-2', name: 'Desenvolvedor', permissions: ['view_dashboard', 'manage_workspaces', 'manage_projects', 'view_reports'] },
  { id: 'role-3', name: 'Designer', permissions: ['view_dashboard', 'manage_workspaces', 'manage_projects'] },
  { id: 'role-4', name: 'Analista', permissions: ['view_dashboard', 'view_reports', 'manage_opportunities'] },
];

export const initialParticipants: (Omit<Participant, 'id'> & { id: string, password?: string })[] = [
  { id: 'user-0', name: 'Admin', email: 'admin@chb.com.br', roleId: 'role-1', avatar: '/avatars/05.png', password: 'chb123' },
  { id: 'user-1', name: 'Tiago Rodrigues', email: 'tiago@example.com', roleId: 'role-1', avatar: '/avatars/01.png', password: 'password123' },
  { id: 'user-2', name: 'Leonardo Alves', email: 'leonardo@example.com', roleId: 'role-2', avatar: '/avatars/02.png', password: 'password123' },
  { id: 'user-3', name: 'Fernando', email: 'fernando@example.com', roleId: 'role-3', avatar: '/avatars/03.png', password: 'password123' },
  { id: 'user-4', name: 'Campos', email: 'campos@example.com', roleId: 'role-4', avatar: '/avatars/04.png', password: 'password123' },
];

export const initialCompanyInfo: CompanyInfo = {
    name: 'CHB Systems',
    cnpj: '00.000.000/0001-00',
    address: '123 Main St, Anytown, USA',
    suportewebCode: 'CHB001',
    logoUrl: ''
}

export const initialClients: Client[] = [
    { id: 'client-1', name: 'CARMEN STEFFENS', email: 'contact@carmensteffens.com.br', company: 'CARMEN STEFFENS', avatar: '/avatars/c01.png', cnpj: '00.000.000/0001-01', address: 'CS Address', suportewebCode: 'CS001' },
    { id: 'client-2', name: 'CALÇADOS FERRACINI', email: 'contact@ferracini.com.br', company: 'CALÇADOS FERRACINI', avatar: '/avatars/c02.png', cnpj: '11.111.111/0001-11', address: 'Ferracini Address', suportewebCode: 'FERRACINI002' },
    { id: 'client-3', name: 'VIRALCOOL AÇUCAR E ALCOOL', email: 'contact@viralcool.com.br', company: 'VIRALCOOL', avatar: '/avatars/c03.png', cnpj: '22.222.222/0001-22', address: 'Viralcool Address', suportewebCode: 'VIRALCOOL003' },
    { id: 'client-4', name: 'LATICINIOS JUSSARA', email: 'contact@jussara.com.br', company: 'LATICINIOS JUSSARA', avatar: '/avatars/c01.png', cnpj: '33.333.333/0001-33', address: 'Jussara Address', suportewebCode: 'JUSSARA004' },
    { id: 'client-5', name: 'USINA BARRALCOOL', email: 'contact@barralcool.com.br', company: 'USINA BARRALCOOL', avatar: '/avatars/c02.png', cnpj: '44.444.444/0001-44', address: 'Barralcool Address', suportewebCode: 'BARRAL005' },
    { id: 'client-6', name: 'CHB SISTEMAS LTDA', email: 'contact@chb.com.br', company: 'CHB SISTEMAS', avatar: '/avatars/c03.png', cnpj: '55.555.555/0001-55', address: 'CHB Address', suportewebCode: 'CHB006' },
];

export const initialWorkspaces: Workspace[] = [
    { id: 'ws-1', name: 'Espaço de Trabalho - CARMEN STEFFENS', description: 'Todos os projetos relacionados à CARMEN STEFFENS', clientId: 'client-1' },
    { id: 'ws-2', name: 'Espaço de Trabalho - CALÇADOS FERRACINI', description: 'Todos os projetos relacionados à CALÇADOS FERRACINI', clientId: 'client-2' },
    { id: 'ws-3', name: 'Workspace Interno', description: 'Projetos internos sem cliente.' },
];

export const initialOpportunities: Opportunity[] = [
    { id: 'lead-1', name: 'Novo site institucional', contactName: 'Ana Silva', email: 'lead1@email.com', company: 'Inovatech', description: 'Interessado em um novo site institucional.', status: 'A Analisar', createdAt: '2024-08-01T10:00:00Z', phone: '11 98765-4321', comments: [], attachments: [], value: 15000, ownerId: 'user-1' },
    { id: 'lead-2', name: 'App de E-commerce', contactName: 'Carlos Souza', email: 'lead2@email.com', company: 'VarejoGlobal', description: 'Solicitou uma proposta para um app de e-commerce.', status: 'Proposta Enviada', createdAt: '2024-07-25T15:30:00Z', phone: '21 91234-5678', comments: [], attachments: [], value: 50000, ownerId: 'user-1' },
    { id: 'lead-3', name: 'Campanha de Marketing', contactName: 'Juliana Lima', email: 'lead3@email.com', company: 'Consultoria XYZ', description: 'Buscando consultoria para campanha de marketing digital.', status: 'Contato Realizado', createdAt: '2024-08-05T11:00:00Z', phone: '31 99999-8888', comments: [], attachments: [], value: 5000, ownerId: 'user-4' },
    { id: 'lead-4', name: 'Venda App de Frota', contactName: 'Tony Stark', email: 'tony@starkindustries.com', company: 'Stark Industries', description: 'Prospectando a venda de um novo app de gestão de frota.', status: 'A Analisar', createdAt: '2024-08-10T09:00:00Z', phone: '21 91234-5678', comments: [], attachments: [], value: 80000, clientId: 'client-2', ownerId: 'user-4' },
];

export const initialProjectTemplates: ProjectTemplate[] = [
  {
    id: 'template-1',
    name: 'Desenvolvimento de Website',
    description: 'Um template padrão para criar um novo website, desde o design até o lançamento.',
    tasks: [
      { title: 'Reunião de Kick-off', description: 'Alinhar escopo, objetivos e cronograma com o cliente.', priority: 'Alta', dueDayOffset: 1 },
      { title: 'Criação de Wireframes', description: 'Desenhar a estrutura básica e layout das páginas principais.', priority: 'Alta', dueDayOffset: 7 },
      { title: 'Design de UI/UX', description: 'Criar o design visual completo no Figma, incluindo sistema de design.', priority: 'Alta', dueDayOffset: 14 },
      { title: 'Desenvolvimento Frontend', description: 'Implementar a interface do usuário com base no design aprovado.', priority: 'Média', dueDayOffset: 30 },
      { title: 'Desenvolvimento Backend', description: 'Configurar o servidor, banco de dados e APIs necessárias.', priority: 'Média', dueDayOffset: 30 },
      { title: 'Fase de Testes', description: 'Realizar testes de funcionalidade, usabilidade e compatibilidade.', priority: 'Média', dueDayOffset: 45 },
      { title: 'Lançamento', description: 'Fazer o deploy do site para o ambiente de produção.', priority: 'Alta', dueDayOffset: 60 },
    ],
  },
  {
    id: 'template-2',
    name: 'Campanha de Marketing Digital',
    description: 'Template para planejar e executar uma campanha de marketing online.',
    tasks: [
      { title: 'Definição de Público-Alvo e KPIs', description: 'Pesquisar e definir o público e os indicadores de sucesso.', priority: 'Alta', dueDayOffset: 2 },
      { title: 'Criação de Conteúdo', description: 'Produzir textos, imagens e vídeos para a campanha.', priority: 'Média', dueDayOffset: 10 },
      { title: 'Configuração das Plataformas de Anúncio', description: 'Configurar contas e campanhas no Google Ads, Facebook Ads, etc.', priority: 'Média', dueDayOffset: 15 },
      { title: 'Lançamento da Campanha', description: 'Ativar todos os anúncios e começar a veiculação.', priority: 'Alta', dueDayOffset: 20 },
      { title: 'Monitoramento e Otimização', description: 'Analisar os resultados diariamente e fazer ajustes.', priority: 'Alta', dueDayOffset: 30 },
    ],
  },
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
    workspaceId: 'ws-1',
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
    workspaceId: 'ws-2',
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
    workspaceId: 'ws-2',
    clientId: 'client-2',
  },
  {
    id: 'proj-4',
    name: 'Integração de API',
    description: 'Integrar APIs de terceiros para funcionalidades estendidas.',
    startDate: '2024-07-20',
    endDate: '2024-09-20',
    status: 'Concluído',
    participantIds: ['user-2'],
    workspaceId: 'ws-3',
  },
];

export const initialTasks: Task[] = [
  // Project 1 Tasks
  { id: 'task-1', projectId: 'proj-1', title: 'Desenhar mockups da nova homepage', description: 'Criar mockups de alta fidelidade no Figma.', status: 'Concluída', priority: 'Alta', dueDate: '2024-08-15', assigneeId: 'user-3', comments: [], attachments: [], checklist: [] },
  { id: 'task-2', projectId: 'proj-1', title: 'Desenvolver componentes de frontend', description: 'Construir componentes React para o novo sistema de design.', status: 'Em Andamento', priority: 'Alta', dueDate: '2024-09-30', assigneeId: 'user-2', comments: [{ id: 'comment-1', content: 'Precisamos garantir que os componentes sejam acessíveis.', authorId: 'user-1', createdAt: '2024-09-01T10:00:00Z' }], attachments: [], checklist: [] },
  { id: 'task-3', projectId: 'proj-1', title: 'Configurar repositório do projeto', description: 'Inicializar repositório no GitHub e estrutura básica do projeto.', status: 'Concluída', priority: 'Média', dueDate: '2024-08-05', assigneeId: 'user-2', comments: [], attachments: [], checklist: [] },
  { id: 'task-4', projectId: 'proj-1', title: 'Teste de usuário para o novo design', description: 'Realizar testes de usabilidade com um grupo de foco.', status: 'A Fazer', priority: 'Média', dueDate: '2024-10-10', assigneeId: 'user-4', comments: [], attachments: [], checklist: [] },

  // Project 2 Tasks
  { id: 'task-5', projectId: 'proj-2', title: 'Definir recursos e requisitos do app', description: 'Criar um documento detalhado de requisitos do produto.', status: 'Em Andamento', priority: 'Alta', dueDate: '2024-09-30', assigneeId: 'user-1', comments: [], attachments: [], checklist: [] },
  { id: 'task-6', projectId: 'proj-2', title: 'Escolher a stack de tecnologia', description: 'Pesquisar e decidir as melhores tecnologias para o aplicativo.', status: 'A Fazer', priority: 'Alta', dueDate: '2024-10-05', assigneeId: 'user-2', comments: [], attachments: [], checklist: [] },

  // Project 3 Tasks
  { id: 'task-7', projectId: 'proj-3', title: 'Criar texto para anúncios', description: 'Escrever textos persuasivos para anúncios em redes sociais.', status: 'A Fazer', priority: 'Média', dueDate: '2024-10-15', assigneeId: undefined, comments: [], attachments: [], checklist: [] },

  // Project 4 Tasks
  { id: 'task-8', projectId: 'proj-4', title: 'Implementar API de gateway de pagamento', description: 'Integrar a API do Stripe para pagamentos.', status: 'Concluída', priority: 'Alta', dueDate: '2024-08-30', assigneeId: 'user-2', comments: [], attachments: [], checklist: [] },
];
