
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
import type { Project, Task, Participant, Role, Client, Opportunity, CompanyInfo, ProjectTemplate, Workspace, Workbook, TemplateTask } from '@/lib/types';
import { format, addDays } from 'date-fns';
import { useSession } from 'next-auth/react';

interface Store {
  isLoaded: boolean;
  projects: Project[];
  allProjects: Project[];
  tasks: Task[];
  participants: Participant[];
  roles: Role[];
  clients: Client[];
  opportunities: Opportunity[];
  currentUser: Participant | null;
  companyInfo: CompanyInfo | null;
  projectTemplates: ProjectTemplate[];
  workspaces: Workspace[];
  workbooks: Workbook[];
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
  const { data: session, status } = useSession();

  const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);
  const [allProjects, setAllProjects] = useLocalStorage<Project[]>('allProjects', []);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [participants, setParticipants] = useLocalStorage<Participant[]>('participants', []);
  const [roles, setRoles] = useLocalStorage<Role[]>('roles', []);
  const [clients, setClients] = useLocalStorage<Client[]>('clients', []);
  const [opportunities, setOpportunities] = useLocalStorage<Opportunity[]>('opportunities', []);
  const [companyInfo, setCompanyInfo] = useLocalStorage<CompanyInfo | null>('companyInfo', null);
  const [projectTemplates, setProjectTemplates] = useLocalStorage<ProjectTemplate[]>('projectTemplates', []);
  const [workspaces, setWorkspaces] = useLocalStorage<Workspace[]>('workspaces', []);
  const [workbooks, setWorkbooks] = useLocalStorage<Workbook[]>('workbooks', []);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const currentUser = useMemo(() => {
    if (status === 'authenticated' && session?.user?.id && participants.length > 0) {
      return participants.find(p => p.id === session.user.id) || null;
    }
    return null;
  }, [status, session, participants]);

  useEffect(() => {
    const initializeAppData = async () => {
      // Only fetch data if the user is authenticated and data hasn't been loaded yet.
      if (status === 'authenticated' && !isDataLoaded) {
        try {
          const [
            projectsRes,
            allProjectsRes,
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
            fetch('/api/projects/all'),
            fetch('/api/tasks'),
            fetch('/api/workspaces'),
            fetch('/api/participants'),
            fetch('/api/roles'),
            fetch('/api/clients'),
            fetch('/api/opportunities'),
            fetch('/api/project-templates'),
            fetch('/api/company-info'),
          ]);

          const [
            projects,
            allProjects,
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
            allProjectsRes.ok ? allProjectsRes.json() : [],
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
          setAllProjects(allProjects);
          setTasks(tasks);
          setWorkspaces(workspaces);
          setParticipants(participants);
          setRoles(roles);
          setClients(clients);
          setOpportunities(opportunities);
          setProjectTemplates(projectTemplates);
          setCompanyInfo(companyInfo);
        } catch (error) {
          console.error("Could not initialize app data:", error);
        } finally {
          setIsDataLoaded(true);
        }
      } else if (status === 'unauthenticated') {
        // If user is not authenticated, clear the data from local storage
        // to prevent showing stale data on re-login.
        setProjects([]);
        setAllProjects([]);
        setTasks([]);
        setWorkspaces([]);
        setParticipants([]);
        setRoles([]);
        setClients([]);
        setOpportunities([]);
        setProjectTemplates([]);
        setCompanyInfo(null);
        setIsDataLoaded(false); // Reset data loaded status
      }
    };

    initializeAppData();
  }, [status, isDataLoaded]); // Rerun when auth status changes

  const isLoaded = status !== 'loading' && (status === 'unauthenticated' || isDataLoaded);

  const store: Store = useMemo(() => ({
    isLoaded,
    projects,
    allProjects,
    tasks,
    participants,
    roles,
    clients,
    opportunities,
    currentUser,
    companyInfo,
    projectTemplates,
    workspaces,
    workbooks,
  }), [isLoaded, projects, allProjects, tasks, participants, roles, clients, opportunities, currentUser, companyInfo, projectTemplates, workspaces, workbooks]);

  const dispatch = (newState: Partial<Store>) => {
    if (newState.projects) setProjects(newState.projects);
    if (newState.allProjects) setAllProjects(newState.allProjects);
    if (newState.tasks) setTasks(newState.tasks);
    if (newState.participants) setParticipants(newState.participants);
    if (newState.roles) setRoles(newState.roles);
    if (newState.clients) setClients(newState.clients);
    if (newState.opportunities) setOpportunities(newState.opportunities);
    // currentUser is now derived, so we don't set it via dispatch
    if (newState.companyInfo) setCompanyInfo(newState.companyInfo);
    if (newState.projectTemplates) setProjectTemplates(newState.projectTemplates);
    if (newState.workspaces) setWorkspaces(newState.workspaces);
    if (newState.workbooks) setWorkbooks(newState.workbooks);
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

  const getRole = useCallback((roleId: string) => {
    return store.roles.find(r => r.id === roleId);
  }, [store.roles]);

  const getProjectTasks = useCallback(
    (projectId: string) => {
      return store.tasks.filter((task) => task.projectId === projectId);
    },
    [store.tasks]
  );

  const getWorkspaceProjects = useCallback(
    (workspaceId: string) => {
      // The `store.projects` array is already filtered by the API based on user access.
      return store.projects.filter((project) => project.workspaceId === workspaceId);
    },
    [store.projects]
  );

  const getProject = useCallback((projectId: string) => {
    // Note: This searches through allProjects, not just visibleProjects
    return store.projects.find(p => p.id === projectId);
  }, [store.projects]);

  const getProjectName = useCallback((projectId: string) => {
    return store.allProjects?.find(p => p.id === projectId)?.name || 'Projeto não encontrado';
  }, [store.allProjects]);

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
      // Re-throw the error to be caught by the calling component
      throw error;
    }
  }, [store.projects, store.tasks, store.projectTemplates, dispatch]);

  const updateProject = useCallback(async (updatedProject: Partial<Project> & { id: string }) => {
    // Optimistic update can be tricky. A safer pattern is to update the state
    // only after the API call is successful.
    const originalProjects = [...store.projects];

    // Immediately update the UI for a better user experience (optimistic update)
    const optimisticProject = { ...originalProjects.find(p => p.id === updatedProject.id)!, ...updatedProject };
    dispatch({
      projects: store.projects.map(p => p.id === updatedProject.id ? optimisticProject : p)
    });

    try {
      const response = await fetch(`/api/projects/${updatedProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProject),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update project');
      }

      const returnedProject = await response.json();
      if (!returnedProject) {
        throw new Error('Update operation did not return a project.');
      }

      // If successful, the optimistic update is already correct, but we can sync with the server response
      dispatch({
        projects: store.projects.map(p => p.id === returnedProject.id ? returnedProject : p)
      });

    } catch (error) {
      console.error("Failed to update project:", error);
      // If the API call fails, revert the state to the original
      dispatch({ projects: originalProjects });
      // Re-throw the error to be caught by the calling component
      throw error;
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
    } catch (error) {
      console.error("Failed to add task:", error);
      return null;
    }
  }, [store.tasks, dispatch]);

  const updateTask = useCallback(async (updatedTask: Partial<Task> & { id: string }) => {
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
    if (!participantId) return undefined;
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.error("Failed to delete participant:", error);
    }
  }, [store.participants, dispatch]);

  const fetchParticipants = useCallback(async () => {
    try {
      const response = await fetch('/api/participants');
      if (!response.ok) throw new Error('Failed to fetch participants');
      const data = await response.json();
      dispatch({ participants: data });
    } catch (error) {
      console.error("Failed to fetch participants:", error);
    }
  }, [dispatch]);

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
    } catch (error) {
      console.error("Failed to add role:", error);
      throw error;
    }
  }, [store.roles, dispatch]);

  const updateRole = useCallback(async (updatedRole: Partial<Role> & { id: string }) => {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.error("Failed to add client:", error);
      return null;
    }
  }, [store.clients, dispatch]);

  const updateClient = useCallback(async (updatedClient: Partial<Client> & { id: string }) => {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.error("Failed to add opportunity:", error);
      return null;
    }
  }, [store.opportunities, store.currentUser, dispatch]);

  const updateOpportunity = useCallback(async (updatedOpportunity: Partial<Opportunity> & { id: string }) => {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.error("Failed to add workspace:", error);
      return null;
    }
  }, [store.workspaces, dispatch]);

  const updateWorkspace = useCallback(async (updatedWorkspace: Partial<Workspace> & { id: string }) => {
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
    } catch (error) {
      console.error("Failed to update workspace:", error);
    }
  }, [store.workspaces, dispatch]);

  const updateWorkspaceInStore = useCallback((updatedWorkspace: Workspace) => {
      dispatch({
          workspaces: store.workspaces.map(w => w.id === updatedWorkspace.id ? updatedWorkspace : w)
      });
  }, [store.workspaces, dispatch]);

  const removeWorkspaceFromStore = useCallback((workspaceId: string) => {
    dispatch({
        workspaces: store.workspaces.filter(w => w.id !== workspaceId)
    });
  }, [store.workspaces, dispatch]);

  const addWorkspaceToStore = useCallback((workspace: Workspace) => {
      dispatch({ workspaces: [...store.workspaces, workspace] });
  }, [store.workspaces, dispatch]);

  const archiveWorkspace = useCallback(async (workspaceId: string) => {
    const projectsInWorkspace = getWorkspaceProjects(workspaceId);
    const canArchive = projectsInWorkspace.every(p => p.status === 'Concluído' || p.status === 'Cancelado');

    if (!canArchive) {
        alert("Não é possível arquivar um espaço de trabalho que ainda contém projetos ativos, em planejamento ou pausados.");
        return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: 'DELETE', // This endpoint now handles archiving (soft delete)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to archive workspace');
      }

      // Remove from the local state to update the UI immediately
      dispatch({
        workspaces: store.workspaces.filter(w => w.id !== workspaceId)
      });
    } catch (error) {
      console.error("Failed to archive workspace:", error);
      // Show error message to the user
      alert((error as Error).message);
    }
  }, [store.workspaces, getWorkspaceProjects, dispatch]);

  const getWorkbook = useCallback((workbookId: string) => {
    return store.workbooks.find(w => w.id === workbookId);
  }, [store.workbooks]);

  const getWorkbooksByWorkspace = useCallback((workspaceId: string) => {
    return store.workbooks.filter(w => w.workspaceId === workspaceId);
  }, [store.workbooks]);

  const fetchWorkbooksByWorkspace = useCallback(async (workspaceId: string) => {
    try {
      const response = await fetch(`/api/workbooks?workspaceId=${workspaceId}`);
      if (!response.ok) throw new Error('Failed to fetch workbooks');
      const fetchedWorkbooks: Workbook[] = await response.json();

      const updater = (prevWorkbooks: Workbook[]): Workbook[] => {
        const otherWorkspacesWorkbooks = prevWorkbooks.filter(w => w.workspaceId !== workspaceId);
        return [...otherWorkspacesWorkbooks, ...fetchedWorkbooks];
      };

      dispatch({ workbooks: updater as any });
    } catch (error) {
      console.error(`Failed to fetch workbooks for workspace ${workspaceId}:`, error);
    }
  }, []);

  const addWorkbook = useCallback(async (workbook: Omit<Workbook, 'id' | 'projectIds'>) => {
    try {
      const response = await fetch('/api/workbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workbook),
      });
      if (!response.ok) throw new Error('Failed to create workbook');
      const newWorkbook = await response.json();
      dispatch({ workbooks: [...store.workbooks, newWorkbook] });
      return newWorkbook;
    } catch (error) {
      console.error("Failed to add workbook:", error);
      return null;
    }
  }, [store.workbooks, dispatch]);

  const updateWorkbook = useCallback(async (updatedWorkbook: Partial<Workbook> & { id: string }) => {
    try {
      const response = await fetch(`/api/workbooks/${updatedWorkbook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedWorkbook),
      });
      if (!response.ok) throw new Error('Failed to update workbook');
      const returnedWorkbook = await response.json();
      dispatch({
        workbooks: store.workbooks.map(w => w.id === returnedWorkbook.id ? returnedWorkbook : w)
      });
    } catch (error) {
      console.error("Failed to update workbook:", error);
    }
  }, [store.workbooks, dispatch]);

  const deleteWorkbook = useCallback(async (workbookId: string) => {
    try {
      const response = await fetch(`/api/workbooks/${workbookId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete workbook');
      dispatch({
        workbooks: store.workbooks.filter(w => w.id !== workbookId)
      });
    } catch (error) {
      console.error("Failed to delete workbook:", error);
    }
  }, [store.workbooks, dispatch]);

  const updateWorkbookProjects = useCallback(async (
    workbookId: string,
    projectsToAdd: string[],
    projectsToRemove: string[]
  ) => {
    // Optimistic update
    const originalWorkbooks = [...store.workbooks];
    const updatedWorkbooks = store.workbooks.map(w => {
      if (w.id === workbookId) {
        const newProjectIds = new Set(w.projectIds);
        projectsToAdd.forEach(id => newProjectIds.add(id));
        projectsToRemove.forEach(id => newProjectIds.delete(id));
        return { ...w, projectIds: Array.from(newProjectIds) };
      }
      return w;
    });
    dispatch({ workbooks: updatedWorkbooks });

    try {
      const response = await fetch(`/api/workbooks/${workbookId}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectsToAdd, projectsToRemove }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update workbook projects');
      }

      // Optionally, you can refetch the workbook data to ensure consistency
      // For now, the optimistic update should suffice.

    } catch (error) {
      console.error("Failed to update workbook projects:", error);
      // Revert on failure
      dispatch({ workbooks: originalWorkbooks });
      throw error; // Re-throw to be handled by the component
    }
  }, [store.workbooks, dispatch]);


  return {
    ...store,
    getWorkspaceProjects,
    getProject,
    getProjectName,
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
    fetchParticipants,
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
    updateWorkspaceInStore,
    archiveWorkspace,
    removeWorkspaceFromStore,
    addWorkspaceToStore,
    getWorkbook,
    getWorkbooksByWorkspace,
    fetchWorkbooksByWorkspace,
    addWorkbook,
    updateWorkbook,
    deleteWorkbook,
    updateWorkbookProjects,
  };
};