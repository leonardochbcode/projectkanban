
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
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [participants, setParticipants] = useLocalStorage<Participant[]>('participants', []);
  const [roles, setRoles] = useLocalStorage<Role[]>('roles', []);
  const [clients, setClients] = useLocalStorage<Client[]>('clients', []);
  const [opportunities, setOpportunities] = useLocalStorage<Opportunity[]>('opportunities', []);
  const [currentUser, setCurrentUser] = useLocalStorage<Participant | null>('currentUser', null);
  const [companyInfo, setCompanyInfo] = useLocalStorage<CompanyInfo | null>('companyInfo', null);
  const [projectTemplates, setProjectTemplates] = useLocalStorage<ProjectTemplate[]>('projectTemplates', []);
  const [workspaces, setWorkspaces] = useLocalStorage<Workspace[]>('workspaces', []);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const dataPromise = (async () => {
          const [
            projectsRes,
            tasksRes,
            workspacesRes,
            participantsRes,
            rolesRes,
            clientsRes,
            opportunitiesRes,
            templatesRes,
            companyInfoRes,
          ] = await Promise.all([
            fetch('/api/projects'),
            fetch('/api/tasks'),
            fetch('/api/workspaces'),
            fetch('/api/participants'), // Assuming these will be created
            fetch('/api/roles'),         // Assuming these will be created
            fetch('/api/clients'),       // Assuming these will be created
            fetch('/api/opportunities'), // Assuming these will be created
            fetch('/api/project-templates'), // Assuming this will be created
            fetch('/api/company-info'),    // Assuming this will be created
          ]);

          const [
            projects,
            tasks,
            workspaces,
            participants,
            roles,
            clients,
            opportunities,
            projectTemplates,
            companyInfo,
          ] = await Promise.all([
            projectsRes.ok ? projectsRes.json() : [],
            tasksRes.ok ? tasksRes.json() : [],
            workspacesRes.ok ? workspacesRes.json() : [],
            participantsRes.ok ? participantsRes.json() : [],
            rolesRes.ok ? rolesRes.json() : [],
            clientsRes.ok ? clientsRes.json() : [],
            opportunitiesRes.ok ? opportunitiesRes.json() : [],
            templatesRes.ok ? templatesRes.json() : [],
            companyInfoRes.ok ? companyInfoRes.json() : null,
          ]);

          setProjects(projects);
          setTasks(tasks);
          setWorkspaces(workspaces);
          setParticipants(participants);
          setRoles(roles);
          setClients(clients);
          setOpportunities(opportunities);
          setProjectTemplates(projectTemplates);
          setCompanyInfo(companyInfo);
        })();

        const authPromise = (async () => {
          if (!currentUser) {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
              const user = await res.json();
              setCurrentUser(user);
            }
          }
        })();

        await Promise.all([dataPromise, authPromise]);

      } catch (error) {
        console.error("Could not initialize the app:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    initializeApp();
  }, []); // This effect runs only once on mount

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
    async (email: string, password?: string) => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          // You might want to parse the error message from the response
          return false;
        }

        const userResponse = await fetch('/api/auth/me');
        if(userResponse.ok) {
            const user = await userResponse.json();
            dispatch({ currentUser: user });
            return true;
        }
        return false;
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      dispatch({ currentUser: null });
    }
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
  
  const addProject = useCallback(async (project: Omit<Project, 'id'>, templateId?: string) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (!response.ok) throw new Error('Failed to create project');
      const newProject = await response.json();

      if (templateId && templateId !== 'none') {
        const template = store.projectTemplates.find(t => t.id === templateId);
        if (template) {
          const taskPromises = template.tasks.map(templateTask => {
            const dueDate = addDays(new Date(newProject.startDate), templateTask.dueDayOffset);
            const taskData = {
              projectId: newProject.id,
              title: templateTask.title,
              description: templateTask.description,
              status: 'A Fazer',
              priority: templateTask.priority,
              dueDate: format(dueDate, 'yyyy-MM-dd'),
            };
            return fetch('/api/tasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(taskData),
            }).then(res => {
              if (!res.ok) throw new Error(`Failed to create task: ${templateTask.title}`);
              return res.json();
            });
          });

          const newTasks = await Promise.all(taskPromises);
          dispatch({ tasks: [...store.tasks, ...newTasks] });
        }
      }

      dispatch({
        projects: [...store.projects, newProject],
      });
      return newProject;
    } catch (error) {
      console.error("Failed to add project:", error);
      // Optionally re-throw or handle the error (e.g., show a toast)
      return null;
    }
  }, [store.projects, store.tasks, store.projectTemplates, dispatch]);

  const updateProject = useCallback(async (updatedProject: Partial<Project> & { id: string }) => {
    try {
      const response = await fetch(`/api/projects/${updatedProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProject),
      });
      if (!response.ok) throw new Error('Failed to update project');
      const returnedProject = await response.json();
      dispatch({
        projects: store.projects.map(p => p.id === returnedProject.id ? returnedProject : p)
      });
    } catch(error) {
      console.error("Failed to update project:", error);
    }
  }, [store.projects, dispatch]);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
       const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete project');

      dispatch({
        projects: store.projects.filter(p => p.id !== projectId),
        tasks: store.tasks.filter(t => t.projectId !== projectId) // Also remove tasks locally
      });

    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  }, [store.projects, store.tasks, dispatch]);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'comments' | 'attachments' | 'checklist'>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (!response.ok) throw new Error('Failed to create task');
      const newTask = await response.json();
      dispatch({ tasks: [...store.tasks, newTask] });
      return newTask;
    } catch(error) {
      console.error("Failed to add task:", error);
      return null;
    }
  }, [store.tasks, dispatch]);

  const updateTask = useCallback(async (updatedTask: Partial<Task> & {id: string}) => {
    try {
      const response = await fetch(`/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
      if (!response.ok) throw new Error('Failed to update task');
      const returnedTask = await response.json();
      dispatch({
        tasks: store.tasks.map(t => t.id === returnedTask.id ? returnedTask : t)
      });
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  }, [store.tasks, dispatch]);
  
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
      dispatch({
          tasks: store.tasks.filter(t => t.id !== taskId)
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  }, [store.tasks, dispatch]);
  
  const getParticipant = useCallback((participantId?: string) => {
      if(!participantId) return undefined;
      return store.participants.find(p => p.id === participantId);
  }, [store.participants]);

  const addParticipant = useCallback(async (participant: Omit<Participant, 'id' | 'avatar'> & { password?: string }) => {
    try {
      const payload = {
        ...participant,
        avatar: `/avatars/0${(store.participants.length % 5) + 1}.png`,
      };
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create participant');
      }
      const newParticipant = await response.json();
      dispatch({ participants: [...store.participants, newParticipant] });
      return newParticipant;
    } catch(error) {
      console.error("Failed to add participant:", error);
      // Re-throw the error so the form can catch it
      throw error;
    }
  }, [store.participants, dispatch]);

  const updateParticipant = useCallback(async (updatedParticipant: Partial<Participant> & { id: string, password?: string }) => {
    try {
      const response = await fetch(`/api/participants/${updatedParticipant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedParticipant),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update participant');
      }
      const returnedParticipant = await response.json();
      dispatch({
        participants: store.participants.map(p => p.id === returnedParticipant.id ? returnedParticipant : p)
      });
    } catch(error) {
      console.error("Failed to update participant:", error);
      throw error;
    }
  }, [store.participants, dispatch]);

  const deleteParticipant = useCallback(async (participantId: string) => {
    try {
      const response = await fetch(`/api/participants/${participantId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete participant');
      dispatch({
        participants: store.participants.filter(p => p.id !== participantId)
      });
    } catch(error) {
      console.error("Failed to delete participant:", error);
    }
  }, [store.participants, dispatch]);

  const addRole = useCallback(async (role: Omit<Role, 'id'>) => {
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(role),
      });
      if (!response.ok) {
         const error = await response.json();
        throw new Error(error.message || 'Failed to create role');
      }
      const newRole = await response.json();
      dispatch({ roles: [...store.roles, newRole] });
      return newRole;
    } catch(error) {
      console.error("Failed to add role:", error);
      throw error;
    }
  }, [store.roles, dispatch]);

  const updateRole = useCallback(async (updatedRole: Partial<Role> & {id: string}) => {
    try {
      const response = await fetch(`/api/roles/${updatedRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRole),
      });
      if (!response.ok) throw new Error('Failed to update role');
      const returnedRole = await response.json();
      dispatch({
        roles: store.roles.map(r => r.id === returnedRole.id ? returnedRole : r)
      });
    } catch(error) {
      console.error("Failed to update role:", error);
    }
  }, [store.roles, dispatch]);
  
  const deleteRole = useCallback(async (roleId: string) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
      });
       if (!response.ok) {
        const error = await response.json();
        // The alert is now handled by the component catching the error
        throw new Error(error.message || 'Failed to delete role');
      }
      dispatch({
          roles: store.roles.filter(r => r.id !== roleId)
      });
    } catch(error) {
       console.error("Failed to delete role:", error);
       throw error;
    }
  }, [store.roles, store.participants, dispatch]);

  const getClient = useCallback((clientId: string) => {
    return store.clients.find(c => c.id === clientId);
  }, [store.clients]);

  const addClient = useCallback(async (client: Omit<Client, 'id' | 'avatar'>) => {
    try {
      const payload = {
        ...client,
        avatar: `/avatars/c0${(store.clients.length % 3) + 1}.png`,
      };
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create client');
      const newClient = await response.json();
      dispatch({ clients: [...store.clients, newClient] });
      return newClient;
    } catch(error) {
      console.error("Failed to add client:", error);
      return null;
    }
  }, [store.clients, dispatch]);

  const updateClient = useCallback(async (updatedClient: Partial<Client> & {id: string}) => {
    try {
      const response = await fetch(`/api/clients/${updatedClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedClient),
      });
      if (!response.ok) throw new Error('Failed to update client');
      const returnedClient = await response.json();
      dispatch({
        clients: store.clients.map(c => c.id === returnedClient.id ? returnedClient : c)
      });
    } catch(error) {
      console.error("Failed to update client:", error);
    }
  }, [store.clients, dispatch]);

  const deleteClient = useCallback(async (clientId: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete client');
      dispatch({
        clients: store.clients.filter(c => c.id !== clientId)
      });
    } catch(error) {
      console.error("Failed to delete client:", error);
    }
  }, [store.clients, dispatch]);
    
  const getOpportunity = useCallback((opportunityId: string) => {
      return store.opportunities.find(l => l.id === opportunityId);
  }, [store.opportunities]);

  const addOpportunity = useCallback(async (opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'comments' | 'attachments' | 'ownerId'>) => {
    try {
      const payload = {
        ...opportunity,
        ownerId: store.currentUser!.id,
      };
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create opportunity');
      const newOpportunity = await response.json();
      dispatch({ opportunities: [...store.opportunities, newOpportunity] });
      return newOpportunity;
    } catch(error) {
      console.error("Failed to add opportunity:", error);
      return null;
    }
  }, [store.opportunities, store.currentUser, dispatch]);

  const updateOpportunity = useCallback(async (updatedOpportunity: Partial<Opportunity> & {id: string}) => {
    try {
      const response = await fetch(`/api/opportunities/${updatedOpportunity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOpportunity),
      });
      if (!response.ok) throw new Error('Failed to update opportunity');
      const returnedOpportunity = await response.json();
      dispatch({
        opportunities: store.opportunities.map(l => l.id === returnedOpportunity.id ? returnedOpportunity : l)
      });
    } catch(error) {
      console.error("Failed to update opportunity:", error);
    }
  }, [store.opportunities, dispatch]);

  const deleteOpportunity = useCallback(async (opportunityId: string) => {
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete opportunity');
      dispatch({
        opportunities: store.opportunities.filter(l => l.id !== opportunityId)
      });
    } catch(error) {
      console.error("Failed to delete opportunity:", error);
    }
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
  
  const addWorkspace = useCallback(async (workspace: Omit<Workspace, 'id'>) => {
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workspace),
      });
      if (!response.ok) throw new Error('Failed to create workspace');
      const newWorkspace = await response.json();
      dispatch({ workspaces: [...store.workspaces, newWorkspace] });
      return newWorkspace;
    } catch(error) {
      console.error("Failed to add workspace:", error);
      return null;
    }
  }, [store.workspaces, dispatch]);

  const updateWorkspace = useCallback(async (updatedWorkspace: Partial<Workspace> & {id: string}) => {
    try {
      const response = await fetch(`/api/workspaces/${updatedWorkspace.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedWorkspace),
      });
      if (!response.ok) throw new Error('Failed to update workspace');
      const returnedWorkspace = await response.json();
      dispatch({
        workspaces: store.workspaces.map(w => w.id === returnedWorkspace.id ? returnedWorkspace : w)
      });
    } catch(error) {
      console.error("Failed to update workspace:", error);
    }
  }, [store.workspaces, dispatch]);

  const deleteWorkspace = useCallback(async (workspaceId: string) => {
    const projectsInWorkspace = store.projects.filter(p => p.workspaceId === workspaceId);
    if (projectsInWorkspace.length > 0) {
      alert("Não é possível excluir um espaço de trabalho que contém projetos.");
      return;
    }
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete workspace');
      dispatch({
        workspaces: store.workspaces.filter(w => w.id !== workspaceId)
      });
    } catch(error) {
      console.error("Failed to delete workspace:", error);
    }
  }, [store.workspaces, store.projects, dispatch]);


  return {
    ...store,
    projects: visibleProjects,
    allProjects: store.projects, // Expose all projects for lookups
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