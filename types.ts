// Budget
export type TransactionType = 'income' | 'expense';
export type AccountIcon = 'wallet' | 'bank' | 'cash';
export type IncomeCategory = 'salary' | 'business' | 'gifts';
export type ExpenseCategory = 'personal' | 'bills' | 'business';

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: TransactionType;
    category: IncomeCategory | ExpenseCategory;
    accountId: string;
    date: string; // ISO string
}

export interface Account {
    id: string;
    name: string;
    icon: AccountIcon;
    initialBalance: number;
}

// Projects & Tasks
export type TaskStatus = 'todo' | 'inprogress' | 'done';

export interface Task {
    id:string;
    text: string;
    status: TaskStatus;
    deadline?: string; // Optional deadline for individual tasks
}

export interface Project {
    id: string;
    name: string;
    deadline: string; // ISO string for overall project
    isCompleted: boolean;
    categoryId?: string;
    clientId?: string;
    notes?: string;
    tasks: Task[];
    value?: number; // For CRM calculation
}

// Contacts
export interface Contact {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    notes?: string;
    imageUrl?: string;
    categoryId?: string;
}

// Categories (for Projects and Contacts)
export interface Category {
    id: string;
    name: string;
    type: 'project' | 'contact';
}


// Wellbeing
export type Mood = 'happy' | 'excited' | 'neutral' | 'sad' | 'anxious';

export interface MoodLog {
    id: string;
    mood: Mood;
    notes: string;
    date: string; // ISO string
}

// Journals
export interface JournalEntry {
    id: string;
    title: string;
    content: string;
    date: string; // ISO string
}

// Main App Data Structure
export interface AppData {
    accounts: Account[];
    transactions: Transaction[];
    projects: Project[];
    contacts: Contact[];
    categories: Category[];
    moodLogs: MoodLog[];
    journalEntries: JournalEntry[];
}
