
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Budget } from './components/Budget';
import { Projects } from './components/Projects';
import { CalendarView } from './components/CalendarView';
import { Contacts } from './components/Contacts';
import { Wellbeing } from './components/Wellbeing';
import { Journals } from './components/Journals';
import { AppDataProvider } from './hooks/useAppData';

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