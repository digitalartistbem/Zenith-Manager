
import React, { createContext, useContext, useState, useEffect, ReactNode, useReducer } from 'react';
import { AppData, Account, Transaction, Project, Task, Contact, MoodLog, JournalEntry, Category, TaskStatus } from '../types';

// Default data for first-time users
const initialData: AppData = {
  accounts: [],
  transactions: [],
  projects: [
    { 
      id: 'proj-1', 
      name: 'Plan vacation', 
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), 
      isCompleted: false,
      tasks: [
          {id: 'task-1', text: 'Book flights', status: 'todo'},
          {id: 'task-2', text: 'Reserve hotel', status: 'todo'},
      ] 
    },
  ],
  contacts: [],
  categories: [],
  moodLogs: [],
  journalEntries: [],
};

type Action =
  | { type: 'SET_DATA'; payload: AppData }
  // Accounts
  | { type: 'ADD_ACCOUNT'; payload: Omit<Account, 'id'> }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  // Transactions
  | { type: 'ADD_TRANSACTION'; payload: Omit<Transaction, 'id'> }
  // Journals
  | { type: 'ADD_JOURNAL'; payload: Omit<JournalEntry, 'id'> }
  | { type: 'UPDATE_JOURNAL'; payload: JournalEntry }
  | { type: 'DELETE_JOURNAL'; payload: string }
  // Mood
  | { type: 'ADD_MOOD'; payload: Omit<MoodLog, 'id'> }
  // Categories
  | { type: 'ADD_CATEGORY'; payload: Omit<Category, 'id'> }
  | { type: 'DELETE_CATEGORY'; payload: string }
  // Projects
  | { type: 'ADD_PROJECT'; payload: Omit<Project, 'id'> }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  // Tasks
  | { type: 'ADD_TASK'; payload: { projectId: string; task: Omit<Task, 'id'> } }
  | { type: 'UPDATE_TASK'; payload: { projectId: string; task: Task } }
  | { type: 'DELETE_TASK'; payload: { projectId: string; taskId: string } }
  | { type: 'UPDATE_TASK_STATUS'; payload: { projectId: string; taskId: string; status: TaskStatus } }
  // Contacts
  | { type: 'ADD_CONTACT'; payload: Omit<Contact, 'id'> }
  | { type: 'UPDATE_CONTACT'; payload: Contact }
  | { type: 'DELETE_CONTACT'; payload: string };


const appReducer = (state: AppData, action: Action): AppData => {
    switch (action.type) {
        case 'SET_DATA':
            return action.payload;
        case 'ADD_ACCOUNT':
            return { ...state, accounts: [...state.accounts, { ...action.payload, id: crypto.randomUUID() }] };
        case 'DELETE_ACCOUNT':
            return {
                ...state,
                accounts: state.accounts.filter(a => a.id !== action.payload),
                transactions: state.transactions.filter(t => t.accountId !== action.payload),
            };
        case 'ADD_TRANSACTION':
            return { ...state, transactions: [...state.transactions, { ...action.payload, id: crypto.randomUUID() }] };
        case 'ADD_JOURNAL':
            return { ...state, journalEntries: [...state.journalEntries, { ...action.payload, id: crypto.randomUUID() }] };
        case 'UPDATE_JOURNAL':
            return { ...state, journalEntries: state.journalEntries.map(j => j.id === action.payload.id ? action.payload : j) };
        case 'DELETE_JOURNAL':
            return { ...state, journalEntries: state.journalEntries.filter(j => j.id !== action.payload) };
        case 'ADD_MOOD':
            return { ...state, moodLogs: [...state.moodLogs, { ...action.payload, id: crypto.randomUUID() }] };
        case 'ADD_CATEGORY':
            return { ...state, categories: [...state.categories, { ...action.payload, id: crypto.randomUUID() }] };
        case 'DELETE_CATEGORY': {
            const category = state.categories.find(c => c.id === action.payload);
            if (!category) return state;
            const projects = category.type === 'project' ? state.projects.map(p => p.categoryId === action.payload ? { ...p, categoryId: undefined } : p) : state.projects;
            const contacts = category.type === 'contact' ? state.contacts.map(c => c.categoryId === action.payload ? { ...c, categoryId: undefined } : c) : state.contacts;
            return {
                ...state,
                categories: state.categories.filter(c => c.id !== action.payload),
                projects,
                contacts,
            };
        }
        case 'ADD_PROJECT':
            return { ...state, projects: [...state.projects, { ...action.payload, id: crypto.randomUUID() }] };
        case 'UPDATE_PROJECT':
            return { ...state, projects: state.projects.map(p => p.id === action.payload.id ? action.payload : p) };
        case 'DELETE_PROJECT':
            return { ...state, projects: state.projects.filter(p => p.id !== action.payload) };
        case 'ADD_TASK': {
            const newProjects = state.projects.map(p => {
                if (p.id === action.payload.projectId) {
                    return { ...p, tasks: [...p.tasks, { ...action.payload.task, id: crypto.randomUUID() }] };
                }
                return p;
            });
            return { ...state, projects: newProjects };
        }
        case 'UPDATE_TASK': {
            const newProjects = state.projects.map(p => {
                if (p.id === action.payload.projectId) {
                    return { ...p, tasks: p.tasks.map(t => t.id === action.payload.task.id ? action.payload.task : t) };
                }
                return p;
            });
            return { ...state, projects: newProjects };
        }
        case 'DELETE_TASK': {
            const newProjects = state.projects.map(p => {
                if (p.id === action.payload.projectId) {
                    return { ...p, tasks: p.tasks.filter(t => t.id !== action.payload.taskId) };
                }
                return p;
            });
            return { ...state, projects: newProjects };
        }
        case 'UPDATE_TASK_STATUS': {
            const newProjects = state.projects.map(p => {
                if (p.id === action.payload.projectId) {
                    const newTasks = p.tasks.map(t => t.id === action.payload.taskId ? {...t, status: action.payload.status} : t);
                    return { ...p, tasks: newTasks };
                }
                return p;
            });
            return { ...state, projects: newProjects };
        }
        case 'ADD_CONTACT':
            return { ...state, contacts: [...state.contacts, { ...action.payload, id: crypto.randomUUID() }] };
        case 'UPDATE_CONTACT':
            return { ...state, contacts: state.contacts.map(c => c.id === action.payload.id ? action.payload : c) };
        case 'DELETE_CONTACT':
            return { ...state, contacts: state.contacts.filter(c => c.id !== action.payload) };
        default:
            return state;
    }
};

interface AppDataContextType {
  data: AppData;
  dispatch: React.Dispatch<Action>;
  handleBackup: () => void;
  handleRestore: (event: React.ChangeEvent<HTMLInputElement>) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  deleteAccount: (accountId: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  updateJournalEntry: (entry: JournalEntry) => void;
  deleteJournalEntry: (entryId: string) => void;
  addMoodLog: (mood: Omit<MoodLog, 'id'>) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, dispatch] = useReducer(appReducer, initialData, (initial) => {
    try {
      const storedData = localStorage.getItem('zenith-app-data');
      return storedData ? JSON.parse(storedData) : initial;
    } catch (error) {
      console.error("Could not parse localStorage data:", error);
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zenith-app-data', JSON.stringify(data));
    } catch (error) {
      console.error("Could not save to localStorage:", error);
    }
  }, [data]);

  const handleBackup = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `zenith-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text === 'string') {
            const restoredData = JSON.parse(text);
            dispatch({ type: 'SET_DATA', payload: restoredData });
            alert("Data restored successfully!");
          }
        } catch (error) {
          console.error("Failed to parse restore file", error);
          alert("Failed to restore data. The file might be corrupted.");
        }
      };
      reader.readAsText(file);
    }
  };

  const addAccount = (account: Omit<Account, 'id'>) => dispatch({ type: 'ADD_ACCOUNT', payload: account });
  const deleteAccount = (accountId: string) => dispatch({ type: 'DELETE_ACCOUNT', payload: accountId });
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
  const addJournalEntry = (entry: Omit<JournalEntry, 'id'>) => dispatch({ type: 'ADD_JOURNAL', payload: entry });
  const updateJournalEntry = (entry: JournalEntry) => dispatch({ type: 'UPDATE_JOURNAL', payload: entry });
  const deleteJournalEntry = (entryId: string) => dispatch({ type: 'DELETE_JOURNAL', payload: entryId });
  const addMoodLog = (mood: Omit<MoodLog, 'id'>) => dispatch({ type: 'ADD_MOOD', payload: mood });

  const value = { 
      data, 
      dispatch, 
      handleBackup, 
      handleRestore,
      addAccount,
      deleteAccount,
      addTransaction,
      addJournalEntry,
      updateJournalEntry,
      deleteJournalEntry,
      addMoodLog,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};