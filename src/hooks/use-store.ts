'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Project, Task, Participant } from '@/lib/types';
import { initialProjects, initialTasks, initialParticipants } from '@/lib/data';

type Store = {
  projects: Project[];
  tasks: Task[];
  participants: Participant[];
};

const getInitialState = (): Store => {
  if (typeof window === 'undefined') {
    return { projects: [], tasks: [], participants: [] };
  }
  try {
    const item = window.localStorage.getItem('visiotask-store');
    if (item) {
      return JSON.parse(item);
    }
  } catch (error) {
    console.warn('Error reading from localStorage', error);
  }
  return {
    projects: initialProjects,
    tasks: initialTasks,
    participants: initialParticipants,
  };
};

// Singleton state
let storeState: Store = getInitialState();
const listeners = new Set<() => void>();

const useStoreState = () => {
  const [state, setState] = useState(storeState);

  useEffect(() => {
    const listener = () => setState(storeState);
    listeners.add(listener);
    // Sync with a potentially updated store on mount
    listener(); 
    return () => listeners.delete(listener);
  }, []);

  return state;
};

const updateStore = (newState: Partial<Store>) => {
  storeState = { ...storeState, ...newState };
  try {
    window.localStorage.setItem('visiotask-store', JSON.stringify(storeState));
  } catch (error) {
    console.warn('Error writing to localStorage', error);
  }
  listeners.forEach(l => l());
};


export const useStore = () => {
  const { projects, tasks, participants } = useStoreState();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, ensuring localStorage is available.
    // Hydrate the store from localStorage on mount.
    const hydratedState = getInitialState();
    if (JSON.stringify(storeState) !== JSON.stringify(hydratedState)) {
      storeState = hydratedState;
      listeners.forEach(l => l());
    }
    setIsLoaded(true);
  }, []);

  const getProjectTasks = useCallback((projectId: string) => {
    return tasks.filter(task => task.projectId === projectId);
  }, [tasks]);

  const addProject = useCallback((project: Omit<Project, 'id' | 'participantIds'>) => {
    const newProject: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      participantIds: [],
    };
    updateStore({ projects: [...projects, newProject] });
    return newProject;
  }, [projects]);

  const updateProject = useCallback((updatedProject: Project) => {
    updateStore({
      projects: projects.map(p => (p.id === updatedProject.id ? updatedProject : p)),
    });
  }, [projects]);
  
  const deleteProject = useCallback((projectId: string) => {
    updateStore({
      projects: projects.filter(p => p.id !== projectId),
      tasks: tasks.filter(t => t.projectId !== projectId)
    });
  }, [projects, tasks]);


  const addTask = useCallback((task: Omit<Task, 'id' | 'comments'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      comments: [],
    };
    updateStore({ tasks: [...tasks, newTask] });
    return newTask;
  }, [tasks]);

  const updateTask = useCallback((updatedTask: Task) => {
    updateStore({
      tasks: tasks.map(t => (t.id === updatedTask.id ? updatedTask : t)),
    });
  }, [tasks]);

  const deleteTask = useCallback((taskId: string) => {
    updateStore({
      tasks: tasks.filter(t => t.id !== taskId),
    });
  }, [tasks]);

  const getParticipant = useCallback((participantId: string) => {
    return participants.find(p => p.id === participantId);
  }, [participants]);

  return {
    isLoaded,
    projects,
    tasks,
    participants,
    getProjectTasks,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    getParticipant,
  };
};
