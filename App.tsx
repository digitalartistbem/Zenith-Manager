
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { Budget } from './components/Budget.tsx';
import { Projects } from './components/Projects.tsx';
import { CalendarView } from './components/CalendarView.tsx';
import { Contacts } from './components/Contacts.tsx';
import { Wellbeing } from './components/Wellbeing.tsx';
import { Journals } from './components/Journals.tsx';
import { AppDataProvider } from './hooks/useAppData.tsx';

export type View = 'dashboard' | 'budget' | 'projects' | 'calendar' | 'contacts' | 'wellbeing' | 'journals';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('dashboard');

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard />;
            case 'budget':
                return <Budget />;
            case 'projects':
                return <Projects />;
            case 'calendar':
                return <CalendarView />;
            case 'contacts':
                return <Contacts />;
            case 'wellbeing':
                return <Wellbeing />;
            case 'journals':
                return <Journals />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <AppDataProvider>
            <div className="flex h-screen bg-background text-text-primary font-sans">
                <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {renderView()}
                </main>
            </div>
        </AppDataProvider>
    );
};

export default App;
