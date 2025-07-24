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
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  runTransaction,
} from 'firebase/firestore';
import { app } from '@/lib/firebase';
import type { Project, Task, Participant, Role, Client } from '@/lib/types';
import {
  initialProjects,
  initialTasks,
  initialParticipants,
  initialRoles,
  initialClients,
} from '@/lib/data';

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Collection references
const projectsCol = collection(db, 'projects');
const tasksCol = collection(db, 'tasks');
const participantsCol = collection(db, 'participants');
const rolesCol = collection(db, 'roles');
const clientsCol = collection(db, 'clients');

interface Store {
  isLoaded: boolean;
  projects: Project[];
  tasks: Task[];
  participants: Participant[];
  roles: Role[];
  clients: Client[];
  currentUser: (Participant & { uid: string }) | null;
  firebaseUser: FirebaseUser | null;
}

const StoreContext = createContext<Store & { dispatch: (newState: Partial<Store>) => void } | null>(
  null
);

const seedInitialData = async () => {
    console.log("Checking if seeding is needed...");
    const seedingMarkerRef = doc(db, 'internal', 'seedingComplete');
    
    try {
        await runTransaction(db, async (transaction) => {
            const seedingMarkerDoc = await transaction.get(seedingMarkerRef);
            if (seedingMarkerDoc.exists()) {
                console.log("Data already seeded. Skipping.");
                return;
            }

            console.log("Seeding initial data...");

            // Seed Roles
            initialRoles.forEach(role => {
                const docRef = doc(db, 'roles', role.id);
                transaction.set(docRef, role);
            });
            
            // Seed Clients
            initialClients.forEach(client => {
                const docRef = doc(db, 'clients', client.id);
                transaction.set(docRef, client);
            });

            // Seed Projects
            initialProjects.forEach(project => {
                const docRef = doc(db, 'projects', project.id);
                transaction.set(docRef, project);
            });

            // Seed Tasks
            initialTasks.forEach(task => {
                const docRef = doc(db, 'tasks', task.id);
                transaction.set(docRef, task);
            });

            // Mark seeding as complete
            transaction.set(seedingMarkerRef, { completed: true, seededAt: new Date() });
        });

        // Create Auth users separately as it cannot be done in a transaction
        // We'll check if they exist first
        for (const p of initialParticipants) {
          try {
            // This is not a perfect check for existence without a backend, 
            // but createUserWithEmailAndPassword will fail if the user exists, which is what we want.
            const userCredential = await createUserWithEmailAndPassword(auth, p.email, p.password!);
            const { uid } = userCredential.user;
            const participantDocRef = doc(db, 'participants', uid);
            const { password, ...participantData } = p; // Don't store password in Firestore
            await setDoc(participantDocRef, { ...participantData, id: uid, uid });
          } catch (error: any) {
             if (error.code !== 'auth/email-already-in-use') {
                 console.error(`Error creating auth user for ${p.email}:`, error);
             } else {
                 console.log(`Auth user ${p.email} already exists.`);
                 // If user exists in Auth, ensure they exist in Firestore participants collection too.
                 // This covers cases where Firestore seeding might have failed after Auth creation.
                 // This part of the logic is complex and would ideally be handled by a backend function.
                 // For this prototype, we'll assume if auth/email-already-in-use, the Firestore doc is also there.
             }
          }
        }
        
        console.log("Initial data seeding process completed.");
    } catch (e) {
        console.error("Error during seeding transaction: ", e);
    }
};


export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [store, setStore] = useState<Store>({
    isLoaded: false,
    projects: [],
    tasks: [],
    participants: [],
    roles: [],
    clients: [],
    currentUser: null,
    firebaseUser: null,
  });

  const dispatch = (newState: Partial<Store>) => {
    setStore((prevState) => ({ ...prevState, ...newState }));
  };
  
  // Seed data once on initial load
  useEffect(() => {
    seedInitialData();
  }, []);

  useEffect(() => {
    const fetchAllData = async (user: FirebaseUser | null) => {
      if (!user) {
        dispatch({
          isLoaded: true,
          projects: [],
          tasks: [],
          participants: [],
          roles: [],
          clients: [],
          currentUser: null,
          firebaseUser: null,
        });
        return;
      }

      const [
        projectsSnap,
        tasksSnap,
        participantsSnap,
        rolesSnap,
        clientsSnap,
        currentUserSnap,
      ] = await Promise.all([
        getDocs(projectsCol),
        getDocs(tasksCol),
        getDocs(participantsCol),
        getDocs(rolesCol),
        getDocs(clientsCol),
        getDoc(doc(db, 'participants', user.uid)),
      ]);

      dispatch({
        isLoaded: true,
        projects: projectsSnap.docs.map((d) => d.data() as Project),
        tasks: tasksSnap.docs.map((d) => d.data() as Task),
        participants: participantsSnap.docs.map((d) => d.data() as Participant),
        roles: rolesSnap.docs.map((d) => d.data() as Role),
        clients: clientsSnap.docs.map((d) => d.data() as Client),
        currentUser: currentUserSnap.exists()
          ? ({ ...currentUserSnap.data(), uid: user.uid } as Participant & { uid: string })
          : null,
        firebaseUser: user,
      });
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      fetchAllData(user);
    });

    return () => unsubscribe();
  }, []);

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

  const login = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return !!cred.user;
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const getProjectTasks = useCallback(
    (projectId: string) => {
      return store.tasks.filter((task) => task.projectId === projectId);
    },
    [store.tasks]
  );
  
  const addProject = useCallback(async (project: Omit<Project, 'id' | 'participantIds'>) => {
    const newProjectData: Omit<Project, 'id'> = {
        ...project,
        participantIds: [],
    };
    const docRef = await addDoc(projectsCol, newProjectData);
    const newProject = { ...newProjectData, id: docRef.id };
    await updateDoc(docRef, {id: docRef.id});
    dispatch({ projects: [...store.projects, newProject]});
    return newProject;
  }, [store.projects, dispatch]);

  const updateProject = useCallback(async (updatedProject: Project) => {
    const projectRef = doc(db, 'projects', updatedProject.id);
    await updateDoc(projectRef, updatedProject);
    dispatch({
      projects: store.projects.map(p => p.id === updatedProject.id ? updatedProject : p)
    });
  }, [store.projects, dispatch]);

  const deleteProject = useCallback(async (projectId: string) => {
    await deleteDoc(doc(db, 'projects', projectId));
    // Also delete associated tasks
    const tasksToDelete = store.tasks.filter(t => t.projectId === projectId);
    const batch = writeBatch(db);
    tasksToDelete.forEach(t => batch.delete(doc(db, 'tasks', t.id)));
    await batch.commit();

    dispatch({
      projects: store.projects.filter(p => p.id !== projectId),
      tasks: store.tasks.filter(t => t.projectId !== projectId)
    });
  }, [store.projects, store.tasks, dispatch]);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'comments'>) => {
    const newTaskData: Omit<Task, 'id'> = {
        ...task,
        comments: [],
    };
    const docRef = await addDoc(tasksCol, newTaskData);
    const newTask = { ...newTaskData, id: docRef.id };
    await updateDoc(docRef, {id: docRef.id});
    dispatch({ tasks: [...store.tasks, newTask]});
    return newTask;
  }, [store.tasks, dispatch]);

  const updateTask = useCallback(async (updatedTask: Task) => {
    const taskRef = doc(db, 'tasks', updatedTask.id);
    await updateDoc(taskRef, updatedTask);
    dispatch({
      tasks: store.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    });
  }, [store.tasks, dispatch]);
  
  const deleteTask = useCallback(async (taskId: string) => {
    await deleteDoc(doc(db, 'tasks', taskId));
    dispatch({
        tasks: store.tasks.filter(t => t.id !== taskId)
    });
  }, [store.tasks, dispatch]);
  
  const getParticipant = useCallback((participantId: string) => {
      return store.participants.find(p => p.id === participantId);
  }, [store.participants]);

  const addParticipant = useCallback(async (participant: Omit<Participant, 'id' | 'avatar'> & { password?: string }) => {
    if (!participant.password) throw new Error("Senha é obrigatória para novo usuário.");
    
    // 1. Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, participant.email, participant.password);
    const { uid } = userCredential.user;

    // 2. Create participant document in Firestore
    const newParticipantData: Omit<Participant, 'id'|'password'> = {
      name: participant.name,
      email: participant.email,
      roleId: participant.roleId,
      avatar: `/avatars/0${(store.participants.length % 5) + 1}.png`,
    };
    await setDoc(doc(db, 'participants', uid), { ...newParticipantData, id: uid, uid });
    
    const newParticipant = { ...newParticipantData, id: uid };
    dispatch({ participants: [...store.participants, newParticipant]});
  }, [store.participants, dispatch]);

  const updateParticipant = useCallback(async (updatedParticipant: Participant) => {
    const participantRef = doc(db, 'participants', updatedParticipant.id);
    // You typically don't update the email this way, would require re-auth.
    // For this app, we'll just update the non-sensitive fields.
    const { email, ...updateData } = updatedParticipant;
    await updateDoc(participantRef, updateData);
    dispatch({
      participants: store.participants.map(p => p.id === updatedParticipant.id ? updatedParticipant : p)
    });
  }, [store.participants, dispatch]);

  const deleteParticipant = useCallback(async (participantId: string) => {
    // Note: Deleting from Firestore. Deleting from Firebase Auth is a separate, more complex operation
    // usually handled by a backend function for security reasons. We'll skip that part here.
    await deleteDoc(doc(db, 'participants', participantId));
    dispatch({
      participants: store.participants.filter(p => p.id !== participantId)
    });
  }, [store.participants, dispatch]);

  const getRole = useCallback((roleId: string) => {
    return store.roles.find(r => r.id === roleId);
  }, [store.roles]);

  const addRole = useCallback(async (role: Omit<Role, 'id'>) => {
    const docRef = await addDoc(rolesCol, role);
    const newRole = { ...role, id: docRef.id };
    await updateDoc(docRef, {id: docRef.id}); // write the id back
    dispatch({ roles: [...store.roles, newRole]});
  }, [store.roles, dispatch]);

  const updateRole = useCallback(async (updatedRole: Role) => {
    const roleRef = doc(db, 'roles', updatedRole.id);
    await updateDoc(roleRef, updatedRole);
    dispatch({
      roles: store.roles.map(r => r.id === updatedRole.id ? updatedRole : r)
    });
  }, [store.roles, dispatch]);
  
  const deleteRole = useCallback(async (roleId: string) => {
    const isRoleInUse = store.participants.some(p => p.roleId === roleId);
    if(isRoleInUse) {
        alert("Esta função está em uso e não pode ser excluída.");
        return;
    }
    await deleteDoc(doc(db, 'roles', roleId));
    dispatch({
        roles: store.roles.filter(r => r.id !== roleId)
    });
  }, [store.roles, store.participants, dispatch]);

  const getClient = useCallback((clientId: string) => {
    return store.clients.find(c => c.id === clientId);
  }, [store.clients]);

  const addClient = useCallback(async (client: Omit<Client, 'id' | 'avatar'>) => {
    const newClientData: Omit<Client, 'id'> = {
        ...client,
        avatar: `/avatars/c0${(store.clients.length % 3) + 1}.png`
    };
    const docRef = await addDoc(clientsCol, newClientData);
    const newClient = { ...newClientData, id: docRef.id };
    await updateDoc(docRef, {id: docRef.id});
    dispatch({ clients: [...store.clients, newClient]});
  }, [store.clients, dispatch]);

  const updateClient = useCallback(async (updatedClient: Client) => {
    const clientRef = doc(db, 'clients', updatedClient.id);
    await updateDoc(clientRef, updatedClient);
    dispatch({
      clients: store.clients.map(c => c.id === updatedClient.id ? updatedClient : c)
    });
  }, [store.clients, dispatch]);

  const deleteClient = useCallback(async (clientId: string) => {
    await deleteDoc(doc(db, 'clients', clientId));
    dispatch({
      clients: store.clients.filter(c => c.id !== clientId)
    });
  }, [store.clients, dispatch]);

  return {
    ...store,
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
