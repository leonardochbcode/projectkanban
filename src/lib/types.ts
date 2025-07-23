export interface Participant {
  id: string;
  name: string;
  email: string;
  role: 'Manager' | 'Analyst' | 'Developer' | 'Designer';
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
  status: 'To Do' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
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
  status: 'Planning' | 'In Progress' | 'Paused' | 'Completed';
  participantIds: string[];
}
