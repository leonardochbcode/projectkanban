import type { Project, Task, Participant } from './types';

export const initialParticipants: Participant[] = [
  { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Manager', avatar: '/avatars/01.png' },
  { id: 'user-2', name: 'Bob Williams', email: 'bob@example.com', role: 'Developer', avatar: '/avatars/02.png' },
  { id: 'user-3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Designer', avatar: '/avatars/03.png' },
  { id: 'user-4', name: 'Diana Prince', email: 'diana@example.com', role: 'Analyst', avatar: '/avatars/04.png' },
];

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with a modern UI/UX.',
    startDate: '2024-08-01',
    endDate: '2024-10-31',
    status: 'In Progress',
    participantIds: ['user-1', 'user-2', 'user-3'],
  },
  {
    id: 'proj-2',
    name: 'Mobile App Development',
    description: 'Create a new mobile application for iOS and Android platforms.',
    startDate: '2024-09-15',
    endDate: '2025-01-15',
    status: 'Planning',
    participantIds: ['user-1', 'user-2', 'user-4'],
  },
  {
    id: 'proj-3',
    name: 'Marketing Campaign',
    description: 'Launch a new marketing campaign for the Q4 product release.',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    status: 'Paused',
    participantIds: ['user-1', 'user-4'],
  },
  {
    id: 'proj-4',
    name: 'API Integration',
    description: 'Integrate third-party APIs for extended functionality.',
    startDate: '2024-07-20',
    endDate: '2024-09-20',
    status: 'Completed',
    participantIds: ['user-2'],
  },
];

export const initialTasks: Task[] = [
  // Project 1 Tasks
  { id: 'task-1', projectId: 'proj-1', title: 'Design new homepage mockups', description: 'Create high-fidelity mockups in Figma.', status: 'Completed', priority: 'High', dueDate: '2024-08-15', assigneeId: 'user-3', comments: [] },
  { id: 'task-2', projectId: 'proj-1', title: 'Develop frontend components', description: 'Build React components for the new design system.', status: 'In Progress', priority: 'High', dueDate: '2024-09-30', assigneeId: 'user-2', comments: [{ id: 'comment-1', content: 'We need to make sure the components are accessible.', authorId: 'user-1', createdAt: '2024-09-01T10:00:00Z' }] },
  { id: 'task-3', projectId: 'proj-1', title: 'Setup project repository', description: 'Initialize GitHub repo and basic project structure.', status: 'Completed', priority: 'Medium', dueDate: '2024-08-05', assigneeId: 'user-2', comments: [] },
  { id: 'task-4', projectId: 'proj-1', title: 'User testing for new design', description: 'Conduct usability tests with a focus group.', status: 'To Do', priority: 'Medium', dueDate: '2024-10-10', assigneeId: 'user-4', comments: [] },

  // Project 2 Tasks
  { id: 'task-5', projectId: 'proj-2', title: 'Define app features and requirements', description: 'Create a detailed product requirements document.', status: 'In Progress', priority: 'High', dueDate: '2024-09-30', assigneeId: 'user-1', comments: [] },
  { id: 'task-6', projectId: 'proj-2', title: 'Choose technology stack', description: 'Research and decide on the best technologies for the app.', status: 'To Do', priority: 'High', dueDate: '2024-10-05', assigneeId: 'user-2', comments: [] },

  // Project 3 Tasks
  { id: 'task-7', projectId: 'proj-3', title: 'Create ad copy', description: 'Write compelling copy for social media ads.', status: 'To Do', priority: 'Medium', dueDate: '2024-10-15', comments: [] },

  // Project 4 Tasks
  { id: 'task-8', projectId: 'proj-4', title: 'Implement payment gateway API', description: 'Integrate Stripe API for payments.', status: 'Completed', priority: 'High', dueDate: '2024-08-30', assigneeId: 'user-2', comments: [] },
];
