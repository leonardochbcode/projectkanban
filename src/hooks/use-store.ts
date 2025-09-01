
'use client';

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
  useMemo,
} from 'react';
import React from 'react';
import type { Project, Task, Participant, Role, Client, Opportunity, CompanyInfo, ProjectTemplate, Workspace, TemplateTask } from '@/lib/types';
import {
  initialProjects,
  initialTasks,
  initialParticipants,
  initialRoles,
  initialClients,
  initialOpportunities,
  initialCompanyInfo,
  initialProjectTemplates,
  initialWorkspaces,
} from '@/lib/data';
import { format, addDays } from 'date-fns';

interface Store {
  isLoaded: boolean;
  projects: Project[];
  tasks: Task[];
  participants: Participant[];
  roles: Role[];
  clients: Client[];
  opportunities: Opportunity[];
  currentUser: Participant | null;
  companyInfo: CompanyInfo | null;
  projectTemplates: ProjectTemplate[];
  workspaces: Workspace[];
}

const StoreContext = createContext<Store & { dispatch: (newState: Partial<Store>) => void } | null>(
  null
);

const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };
  return [storedValue, setValue] as const;
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', initialProjects);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', initialTasks);
  const [participants, setParticipants] = useLocalStorage<Participant[]>('participants', initialParticipants);
  const [roles, setRoles] = useLocalStorage<Role[]>('roles', initialRoles);
  const [clients, setClients] = useLocalStorage<Client[]>('clients', initialClients);
  const [opportunities, setOpportunities] = useLocalStorage<Opportunity[]>('opportunities', initialOpportunities);
  const [currentUser, setCurrentUser] = useLocalStorage<Participant | null>('currentUser', null);
  const [companyInfo, setCompanyInfo] = useLocalStorage<CompanyInfo | null>('companyInfo', initialCompanyInfo);
  const [projectTemplates, setProjectTemplates] = useLocalStorage<ProjectTemplate[]>('projectTemplates', initialProjectTemplates);
  const [workspaces, setWorkspaces] = useLocalStorage<Workspace[]>('workspaces', initialWorkspaces);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const store: Store = useMemo(() => ({
    isLoaded,
    projects,
    tasks,
    participants,
    roles,
    clients,
    opportunities,
    currentUser,
    companyInfo,
    projectTemplates,
    workspaces,
  }), [isLoaded, projects, tasks, participants, roles, clients, opportunities, currentUser, companyInfo, projectTemplates, workspaces]);

  const dispatch = (newState: Partial<Store>) => {
    if (newState.projects) setProjects(newState.projects);
    if (newState.tasks) setTasks(newState.tasks);
    if (newState.participants) setParticipants(newState.participants);
    if (newState.roles) setRoles(newState.roles);
    if (newState.clients) setClients(newState.clients);
    if (newState.opportunities) setOpportunities(newState.opportunities);
    if (newState.hasOwnProperty('currentUser')) setCurrentUser(newState.currentUser ?? null);
    if (newState.companyInfo) setCompanyInfo(newState.companyInfo);
    if (newState.projectTemplates) setProjectTemplates(newState.projectTemplates);
    if (newState.workspaces) setWorkspaces(newState.workspaces);
  };
  
  const value = useMemo(() => ({ ...store, dispatch }), [store]);

  return React.createElement(StoreContext.Provider, { value }, children);
};


const useStoreRaw = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const useStore = () => {
  const store = useStoreRaw();
  const { dispatch } = store;

  const login = useCallback(
    (email: string, password?: string) => {
      const user = store.participants.find(
        (p) => p.email.toLowerCase() === email.toLowerCase() && p.password === password
      );

      if (user) {
        dispatch({ currentUser: user });
        return true;
      }
      return false;
    },
    [store.participants, dispatch]
  );

  const logout = useCallback(() => {
    dispatch({ currentUser: null });
  }, [dispatch]);

  const getRole = useCallback((roleId: string) => {
    return store.roles.find(r => r.id === roleId);
  }, [store.roles]);

  const getProjectTasks = useCallback(
    (projectId: string) => {
      return store.tasks.filter((task) => task.projectId === projectId);
    },
    [store.tasks]
  );

  const visibleProjects = useMemo(() => {
    if (!store.currentUser || !store.isLoaded) return [];

    const userRole = getRole(store.currentUser.roleId);
    const canViewAll = userRole?.permissions.includes('view_all_projects');

    if (canViewAll) {
      return store.projects;
    }

    return store.projects.filter(project => {
        const userTasksInProject = store.tasks.filter(t => t.projectId === project.id && t.assigneeId === store.currentUser!.id);
        
        return project.participantIds.includes(store.currentUser!.id) ||
               project.pmoId === store.currentUser!.id ||
               userTasksInProject.length > 0;
    });

  }, [store.projects, store.currentUser, store.isLoaded, getRole, store.tasks]);


  const getWorkspaceProjects = useCallback(
    (workspaceId: string) => {
      return visibleProjects.filter((project) => project.workspaceId === workspaceId);
    },
    [visibleProjects]
  );
  
  const addProject = useCallback((project: Omit<Project, 'id'>, templateId?: string) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      ...project,
    };

    let newTasks: Task[] = [];
    if (templateId && templateId !== 'none') {
      const template = store.projectTemplates.find(t => t.id === templateId);
      if (template) {
        newTasks = template.tasks.map((templateTask: TemplateTask) => {
          const dueDate = addDays(new Date(newProject.startDate), templateTask.dueDayOffset);
          return {
            id: `task-${Date.now()}-${Math.random()}`,
            projectId: newProject.id,
            title: templateTask.title,
            description: templateTask.description,
            status: 'A Fazer',
            priority: templateTask.priority,
            dueDate: format(dueDate, 'yyyy-MM-dd'),
            comments: [],
            attachments: [],
            checklist: [],
          };
        });
      }
    }
    
    dispatch({ 
      projects: [...store.projects, newProject],
      tasks: [...store.tasks, ...newTasks] 
    });
    return newProject;
  }, [store.projects, store.tasks, store.projectTemplates, dispatch]);

  const updateProject = useCallback((updatedProject: Project) => {
    dispatch({
      projects: store.projects.map(p => p.id === updatedProject.id ? updatedProject : p)
    });
  }, [store.projects, dispatch]);

  const deleteProject = useCallback((projectId: string) => {
    dispatch({
      projects: store.projects.filter(p => p.id !== projectId),
      tasks: store.tasks.filter(t => t.projectId !== projectId)
    });
  }, [store.projects, store.tasks, dispatch]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'comments' | 'attachments' | 'checklist'>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      ...task,
      comments: [],
      attachments: [],
      checklist: [],
    };
    dispatch({ tasks: [...store.tasks, newTask] });
    return newTask;
  }, [store.tasks, dispatch]);

  const updateTask = useCallback((updatedTask: Task) => {
    dispatch({
      tasks: store.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    });
  }, [store.tasks, dispatch]);
  
  const deleteTask = useCallback((taskId: string) => {
    dispatch({
        tasks: store.tasks.filter(t => t.id !== taskId)
    });
  }, [store.tasks, dispatch]);
  
  const getParticipant = useCallback((participantId?: string) => {
      if(!participantId) return undefined;
      return store.participants.find(p => p.id === participantId);
  }, [store.participants]);

  const addParticipant = useCallback((participant: Omit<Participant, 'id' | 'avatar'>) => {
    const newParticipant: Participant = {
      id: `user-${Date.now()}`,
      ...participant,
      avatar: `/avatars/0${(store.participants.length % 5) + 1}.png`,
    };
    dispatch({ participants: [...store.participants, newParticipant]});
  }, [store.participants, dispatch]);

  const updateParticipant = useCallback((updatedParticipant: Participant) => {
    dispatch({
      participants: store.participants.map(p => p.id === updatedParticipant.id ? updatedParticipant : p)
    });
  }, [store.participants, dispatch]);

  const deleteParticipant = useCallback((participantId: string) => {
    dispatch({
      participants: store.participants.filter(p => p.id !== participantId)
    });
  }, [store.participants, dispatch]);

  const addRole = useCallback((role: Omit<Role, 'id'>) => {
    const newRole: Role = {
      id: `role-${Date.now()}`,
      ...role,
    };
    dispatch({ roles: [...store.roles, newRole]});
  }, [store.roles, dispatch]);

  const updateRole = useCallback((updatedRole: Role) => {
    dispatch({
      roles: store.roles.map(r => r.id === updatedRole.id ? updatedRole : r)
    });
  }, [store.roles, dispatch]);
  
  const deleteRole = useCallback((roleId: string) => {
    const isRoleInUse = store.participants.some(p => p.roleId === roleId);
    if(isRoleInUse) {
        alert("Esta função está em uso e não pode ser excluída.");
        return;
    }
    dispatch({
        roles: store.roles.filter(r => r.id !== roleId)
    });
  }, [store.roles, store.participants, dispatch]);

  const getClient = useCallback((clientId: string) => {
    return store.clients.find(c => c.id === clientId);
  }, [store.clients]);

  const addClient = useCallback((client: Omit<Client, 'id' | 'avatar'>) => {
    const newClient: Client = {
      id: `client-${Date.now()}`,
      ...client,
      avatar: `/avatars/c0${(store.clients.length % 3) + 1}.png`,
    };
    dispatch({ clients: [...store.clients, newClient]});
    return newClient;
  }, [store.clients, dispatch]);

  const updateClient = useCallback((updatedClient: Client) => {
    dispatch({
      clients: store.clients.map(c => c.id === updatedClient.id ? updatedClient : c)
    });
  }, [store.clients, dispatch]);

  const deleteClient = useCallback((clientId: string) => {
    dispatch({
      clients: store.clients.filter(c => c.id !== clientId)
    });
  }, [store.clients, dispatch]);
    
  const getOpportunity = useCallback((opportunityId: string) => {
      return store.opportunities.find(l => l.id === opportunityId);
  }, [store.opportunities]);

  const addOpportunity = useCallback((opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'comments' | 'attachments' | 'ownerId'>) => {
      const newOpportunity: Opportunity = {
          id: `lead-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...opportunity,
          ownerId: store.currentUser!.id,
          comments: [],
          attachments: [],
      };
      dispatch({ opportunities: [...store.opportunities, newOpportunity]});
  }, [store.opportunities, store.currentUser, dispatch]);

  const updateOpportunity = useCallback((updatedOpportunity: Opportunity) => {
      dispatch({
          opportunities: store.opportunities.map(l => l.id === updatedOpportunity.id ? updatedOpportunity : l)
      });
  }, [store.opportunities, dispatch]);

  const deleteOpportunity = useCallback((opportunityId: string) => {
      dispatch({
          opportunities: store.opportunities.filter(l => l.id !== opportunityId)
      });
  }, [store.opportunities, dispatch]);

  const updateCompanyInfo = useCallback((info: CompanyInfo) => {
    dispatch({ companyInfo: info });
  }, [dispatch]);

  const duplicateProject = useCallback((projectToDuplicate: Project) => {
    const newProject: Project = {
      ...projectToDuplicate,
      id: `proj-${Date.now()}`,
      name: `${projectToDuplicate.name} (Cópia)`,
    };
    const originalTasks = getProjectTasks(projectToDuplicate.id);
    const newTasks: Task[] = originalTasks.map(task => ({
      ...task,
      id: `task-${Date.now()}-${Math.random()}`,
      projectId: newProject.id,
    }));

    dispatch({ 
      projects: [...store.projects, newProject],
      tasks: [...store.tasks, ...newTasks] 
    });
    return newProject;
  }, [store.projects, store.tasks, getProjectTasks, dispatch]);

  const addProjectTemplate = useCallback((template: Omit<ProjectTemplate, 'id'>) => {
    const newTemplate: ProjectTemplate = {
      id: `template-${Date.now()}`,
      ...template,
    };
    dispatch({ projectTemplates: [...store.projectTemplates, newTemplate] });
  }, [store.projectTemplates, dispatch]);

  const updateProjectTemplate = useCallback((updatedTemplate: ProjectTemplate) => {
    dispatch({
      projectTemplates: store.projectTemplates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t)
    });
  }, [store.projectTemplates, dispatch]);

  const deleteProjectTemplate = useCallback((templateId: string) => {
    dispatch({
      projectTemplates: store.projectTemplates.filter(t => t.id !== templateId)
    });
  }, [store.projectTemplates, dispatch]);
  
  const addWorkspace = useCallback((workspace: Omit<Workspace, 'id'>) => {
    const newWorkspace: Workspace = {
      id: `ws-${Date.now()}`,
      ...workspace,
    };
    dispatch({ workspaces: [...store.workspaces, newWorkspace] });
  }, [store.workspaces, dispatch]);

  const updateWorkspace = useCallback((updatedWorkspace: Workspace) => {
    dispatch({
      workspaces: store.workspaces.map(w => w.id === updatedWorkspace.id ? updatedWorkspace : w)
    });
  }, [store.workspaces, dispatch]);

  const deleteWorkspace = useCallback((workspaceId: string) => {
    const projectsInWorkspace = store.projects.filter(p => p.workspaceId === workspaceId);
    if (projectsInWorkspace.length > 0) {
      alert("Não é possível excluir um espaço de trabalho que contém projetos.");
      return;
    }
    dispatch({
      workspaces: store.workspaces.filter(w => w.id !== workspaceId)
    });
  }, [store.workspaces, store.projects, dispatch]);


  return {
    ...store,
    projects: visibleProjects,
    login,
    logout,
    getWorkspaceProjects,
    getProjectTasks,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    getParticipant,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    getRole,
    addRole,
    updateRole,
    deleteRole,
    getClient,
    addClient,
    updateClient,
    deleteClient,
    getOpportunity,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
    updateCompanyInfo,
    duplicateProject,
    addProjectTemplate,
    updateProjectTemplate,
    deleteProjectTemplate,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
  };
};
