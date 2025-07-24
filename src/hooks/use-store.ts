'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import React from 'react';
import type { Project, Task, Participant, Role, Client, Permission } from '@/lib/types';
import { initialProjects, initialTasks, initialParticipants, initialRoles, initialClients } from '@/lib/data';

type Store = {
  projects: Project[];
  tasks: Task[];
  participants: Participant[];
  roles: Role[];
  clients: Client[];
  currentUserId: string | null;
};

const STORE_KEY = 'chbproject-store';

const getInitialState = (): Store => {
  if (typeof window === 'undefined') {
    return { projects: [], tasks: [], participants: [], roles: [], clients: [], currentUserId: null };
  }
  try {
    const item = window.localStorage.getItem(STORE_KEY);
    if (item) {
      const storedData = JSON.parse(item);
      // Basic schema validation and migration
      if (!storedData.roles) storedData.roles = initialRoles;
      if (!storedData.clients) storedData.clients = initialClients;
      if (!storedData.participants) storedData.participants = initialParticipants;
      if (storedData.participants.some((p: Participant) => !p.password)) {
          storedData.participants = initialParticipants; // Reset if old data structure
      }
      if (storedData.roles.some((r: Role) => !r.permissions)) {
          storedData.roles = initialRoles; // Reset if old data structure
      }
      if (typeof storedData.currentUserId === 'undefined') storedData.currentUserId = null;
      
      return storedData;
    }
  } catch (error) {
    console.warn('Error reading from localStorage', error);
  }
  return {
    projects: initialProjects,
    tasks: initialTasks,
    participants: initialParticipants,
    roles: initialRoles,
    clients: initialClients,
    currentUserId: null,
  };
};

// Singleton state
let storeState: Store = getInitialState();
const listeners = new Set<() => void>();

const updateStore = (newState: Partial<Store>, overwrite = false) => {
  storeState = overwrite ? (newState as Store) : { ...storeState, ...newState };
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(storeState));
  } catch (error) {
    console.warn('Error writing to localStorage', error);
  }
  listeners.forEach(l => l());
};


const StoreContext = createContext<Store & { dispatch: (newState: Partial<Store>) => void } | null>(null);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState(storeState);

    useEffect(() => {
        const listener = () => setState(storeState);
        listeners.add(listener);
        // Sync with a potentially updated store on mount (e.g. from another tab)
        listener(); 
        
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === STORE_KEY) {
                storeState = getInitialState();
                listener();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            listeners.delete(listener);
            window.removeEventListener('storage', handleStorageChange);
        }
    }, []);

    const dispatch = (newState: Partial<Store>) => {
        updateStore(newState);
    }

    return React.createElement(StoreContext.Provider, { value: {...state, dispatch} }, children);
}

const useStoreRaw = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
}

export const useStore = () => {
  const { projects, tasks, participants, roles, clients, currentUserId, dispatch } = useStoreRaw();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Hydration check
    setIsLoaded(true);
  }, []);

  const currentUser = useMemo(() => {
    if (!currentUserId) return null;
    return participants.find(p => p.id === currentUserId) || null;
  }, [currentUserId, participants]);


  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const user = participants.find(p => p.email.toLowerCase() === email.toLowerCase());
    // NOTE: In a real app, this would be a fetch call to a backend,
    // and password checking would be done with hashing.
    if (user && user.password === password) {
      dispatch({ currentUserId: user.id });
      return true;
    }
    return false;
  }, [participants, dispatch]);

  const logout = useCallback(() => {
    dispatch({ currentUserId: null });
  }, [dispatch]);

  const getProjectTasks = useCallback((projectId: string) => {
    return tasks.filter(task => task.projectId === projectId);
  }, [tasks]);

  const addProject = useCallback((project: Omit<Project, 'id' | 'participantIds'>) => {
    const newProject: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      participantIds: [],
    };
    dispatch({ projects: [...projects, newProject] });
    return newProject;
  }, [projects, dispatch]);

  const updateProject = useCallback((updatedProject: Project) => {
    dispatch({
      projects: projects.map(p => (p.id === updatedProject.id ? updatedProject : p)),
    });
  }, [projects, dispatch]);
  
  const deleteProject = useCallback((projectId: string) => {
    dispatch({
      projects: projects.filter(p => p.id !== projectId),
      tasks: tasks.filter(t => t.projectId !== projectId)
    });
  }, [projects, tasks, dispatch]);


  const addTask = useCallback((task: Omit<Task, 'id' | 'comments'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      comments: [],
    };
    dispatch({ tasks: [...tasks, newTask] });
    return newTask;
  }, [tasks, dispatch]);

  const updateTask = useCallback((updatedTask: Task) => {
    dispatch({
      tasks: tasks.map(t => (t.id === updatedTask.id ? updatedTask : t)),
    });
  }, [tasks, dispatch]);

  const deleteTask = useCallback((taskId: string) => {
    dispatch({
      tasks: tasks.filter(t => t.id !== taskId),
    });
  }, [tasks, dispatch]);

  const getParticipant = useCallback((participantId: string) => {
    return participants.find(p => p.id === participantId);
  }, [participants]);
  
  const addParticipant = useCallback((participant: Omit<Participant, 'id' | 'avatar'>) => {
    const newParticipant: Participant = {
      ...participant,
      id: `user-${Date.now()}`,
      avatar: `/avatars/0${(participants.length % 5) + 1}.png`
    };
    dispatch({ participants: [...participants, newParticipant]});
  }, [participants, dispatch]);

  const updateParticipant = useCallback((updatedParticipant: Participant) => {
    dispatch({
      participants: participants.map(p => p.id === updatedParticipant.id ? updatedParticipant : p)
    });
  }, [participants, dispatch]);
  
  const deleteParticipant = useCallback((participantId: string) => {
    dispatch({
      participants: participants.filter(p => p.id !== participantId)
    });
  }, [participants, dispatch]);
  
  const getRole = useCallback((roleId: string) => {
    return roles.find(r => r.id === roleId);
  }, [roles]);

  const addRole = useCallback((role: Omit<Role, 'id'>) => {
    const newRole: Role = {
      ...role,
      id: `role-${Date.now()}`
    };
    dispatch({ roles: [...roles, newRole] });
  }, [roles, dispatch]);
  
  const updateRole = useCallback((updatedRole: Role) => {
    dispatch({
      roles: roles.map(r => r.id === updatedRole.id ? updatedRole : r)
    });
  }, [roles, dispatch]);

  const deleteRole = useCallback((roleId: string) => {
    // Prevent deleting a role that is in use
    const isRoleInUse = participants.some(p => p.roleId === roleId);
    if (isRoleInUse) {
        alert("Esta função está em uso e não pode ser excluída.");
        return;
    }
    dispatch({
      roles: roles.filter(r => r.id !== roleId)
    });
  }, [roles, participants, dispatch]);

  const getClient = useCallback((clientId: string) => {
    return clients.find(c => c.id === clientId);
  }, [clients]);

  const addClient = useCallback((client: Omit<Client, 'id' | 'avatar'>) => {
    const newClient: Client = {
      ...client,
      id: `client-${Date.now()}`,
      avatar: `/avatars/c0${(clients.length % 3) + 1}.png`
    };
    dispatch({ clients: [...clients, newClient]});
  }, [clients, dispatch]);

  const updateClient = useCallback((updatedClient: Client) => {
    dispatch({
      clients: clients.map(c => c.id === updatedClient.id ? updatedClient : c)
    });
  }, [clients, dispatch]);

  const deleteClient = useCallback((clientId: string) => {
    dispatch({
      clients: clients.filter(c => c.id !== clientId)
    });
  }, [clients, dispatch]);

  return {
    isLoaded,
    projects,
    tasks,
    participants,
    roles,
    clients,
    currentUser,
    login,
    logout,
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
  };
};