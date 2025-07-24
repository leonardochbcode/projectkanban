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
  type AuthError,
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
  isSeeding: boolean;
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

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [store, setStore] = useState<Store>({
    isLoaded: false,
    isSeeding: true, // Start in seeding state
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

  useEffect(() => {
    const seedInitialData = async () => {
      console.log('Checking if seeding is needed...');
      dispatch({ isSeeding: true });
      const seedingMarkerRef = doc(db, 'internal', 'seedingComplete');

      try {
        const seedingMarkerDoc = await getDoc(seedingMarkerRef);
        if (seedingMarkerDoc.exists()) {
          console.log('Data already seeded. Skipping.');
          dispatch({ isSeeding: false });
          return;
        }

        console.log('Seeding initial data...');
        
        const adminUser = initialParticipants.find(p => p.email === 'alice@example.com');
        if (adminUser && adminUser.password) {
             try {
                 await createUserWithEmailAndPassword(auth, adminUser.email, adminUser.password);
                 console.log(`Successfully created auth user for ${adminUser.email}`);
            } catch(e) {
                const authError = e as AuthError;
                if(authError.code === 'auth/email-already-in-use') {
                    console.log(`Auth user for ${adminUser.email} already exists. Skipping auth creation.`);
                } else {
                    console.error(`Could not create initial admin user in Auth.`, authError);
                    // Don't re-throw, allow seeding to continue
                }
            }
        }
        
        await runTransaction(db, async (transaction) => {
          initialParticipants.forEach((p) => {
            const { password, ...participantData } = p;
            const docRef = doc(db, 'participants', p.id);
            transaction.set(docRef, participantData);
          });
          initialRoles.forEach((role) => {
            const docRef = doc(db, 'roles', role.id);
            transaction.set(docRef, role);
          });
          initialClients.forEach((client) => {
            const docRef = doc(db, 'clients', client.id);
            transaction.set(docRef, client);
          });
          initialProjects.forEach((project) => {
            const docRef = doc(db, 'projects', project.id);
            transaction.set(docRef, project);
          });
          initialTasks.forEach((task) => {
            const docRef = doc(db, 'tasks', task.id);
            transaction.set(docRef, task);
          });
          transaction.set(seedingMarkerRef, { completed: true, seededAt: new Date() });
        });

        console.log('Initial data seeding process completed.');
      } catch (e) {
        console.error('Error during seeding transaction: ', e);
      } finally {
        dispatch({ isSeeding: false });
      }
    };

    seedInitialData();
  }, []);

  useEffect(() => {
    const fetchAllData = async (user: FirebaseUser | null) => {
      if (store.isSeeding) return;

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
      ] = await Promise.all([
        getDocs(projectsCol),
        getDocs(tasksCol),
        getDocs(participantsCol),
        getDocs(rolesCol),
        getDocs(clientsCol),
      ]);
      
      const participants = participantsSnap.docs.map((d) => d.data() as Participant)
      const currentUserData = participants.find(p => p.id === user.uid)

      dispatch({
        isLoaded: true,
        projects: projectsSnap.docs.map((d) => d.data() as Project),
        tasks: tasksSnap.docs.map((d) => d.data() as Task),
        participants: participants,
        roles: rolesSnap.docs.map((d) => d.data() as Role),
        clients: clientsSnap.docs.map((d) => d.data() as Client),
        currentUser: currentUserData
          ? ({ ...currentUserData, uid: user.uid } as Participant & { uid: string })
          : null,
        firebaseUser: user,
      });
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      fetchAllData(user);
    });

    return () => unsubscribe();
  }, [store.isSeeding]);

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
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener will handle fetching data and setting the user.
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Re-throw the error to be caught by the login page component
    }
  }, []);
  
  const hardcodedLogin = useCallback(async () => {
      const [
        projectsSnap,
        tasksSnap,
        participantsSnap,
        rolesSnap,
        clientsSnap,
      ] = await Promise.all([
        getDocs(projectsCol),
        getDocs(tasksCol),
        getDocs(participantsCol),
        getDocs(rolesCol),
        getDocs(clientsCol),
      ]);

      const participants = participantsSnap.docs.map(d => d.data() as Participant);
      const adminParticipant = participants.find(p => p.email === 'alice@example.com') || participants[0];

      if (!adminParticipant) {
        throw new Error("Nenhum participante de fallback encontrado para o login codificado.");
      }
      
      // Simulate login state
       dispatch({
        isLoaded: true,
        projects: projectsSnap.docs.map((d) => d.data() as Project),
        tasks: tasksSnap.docs.map((d) => d.data() as Task),
        participants: participants,
        roles: rolesSnap.docs.map((d) => d.data() as Role),
        clients: clientsSnap.docs.map((d) => d.data() as Client),
        // Fake a user object for the hardcoded admin
        currentUser: { ...adminParticipant, uid: adminParticipant.id },
        firebaseUser: null // No real Firebase user for this session
      });
  }, [dispatch]);

  const logout = useCallback(async () => {
    // If there is a real firebase user, sign them out.
    if (auth.currentUser) {
        await signOut(auth);
    }
    // For both hardcoded and real users, this will clear the state.
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
  }, [dispatch]);

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

    // 2. Create participant document in Firestore, using the auth UID as the document ID
    const newParticipantData: Participant = {
      id: uid,
      name: participant.name,
      email: participant.email,
      roleId: participant.roleId,
      avatar: `/avatars/0${(store.participants.length % 5) + 1}.png`,
    };
    await setDoc(doc(db, 'participants', uid), newParticipantData);
    
    dispatch({ participants: [...store.participants, newParticipantData]});
  }, [store.participants, dispatch]);

  const updateParticipant = useCallback(async (updatedParticipant: Participant) => {
    const participantRef = doc(db, 'participants', updatedParticipant.id);
    const { email, ...updateData } = updatedParticipant;
    await updateDoc(participantRef, updateData);
    dispatch({
      participants: store.participants.map(p => p.id === updatedParticipant.id ? updatedParticipant : p)
    });
  }, [store.participants, dispatch]);

  const deleteParticipant = useCallback(async (participantId: string) => {
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
    await updateDoc(docRef, {id: docRef.id});
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
    hardcodedLogin,
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
