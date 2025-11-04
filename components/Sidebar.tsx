import React, { useRef } from 'react';
import { View } from '../App.tsx';
import { useAppData } from '../hooks/useAppData.tsx';
import { DownloadIcon, UploadIcon } from './Icons.tsx';

interface SidebarProps {
    currentView: View;
    setCurrentView: (view: View) => void;
}

const navItems: { view: View; label: string }[] = [
    { view: 'dashboard', label: 'Dashboard' },
    { view: 'budget', label: 'Budget' },
    { view: 'projects', label: 'Projects' },
    { view: 'calendar', label: 'Calendar' },
    { view: 'contacts', label: 'Contacts' },
    { view: 'wellbeing', label: 'Wellbeing' },
    { view: 'journals', label: 'Journals' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
    const { handleBackup, handleRestore } = useAppData();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onRestoreClick = () => {
        fileInputRef.current?.click();
    };
    
    return (
        <aside className="w-64 bg-surface p-4 flex-shrink-0 hidden md:block flex flex-col">
            <div>
                <h1 className="text-2xl font-bold text-primary mb-8">Zenith</h1>
                <nav>
                    <ul>
                        {navItems.map(({ view, label }) => (
                            <li key={view}>
                                <button
                                    onClick={() => setCurrentView(view)}
                                    className={`w-full text-left px-4 py-2 rounded-md my-1 transition-colors ${
                                        currentView === view
                                            ? 'bg-primary text-white font-semibold'
                                            : 'hover:bg-background'
                                    }`}
                                >
                                    {label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            <div className="mt-auto space-y-2">
                 <button onClick={handleBackup} className="w-full flex items-center justify-center text-left px-4 py-2 rounded-md my-1 transition-colors bg-gray-700 hover:bg-gray-600">
                    <DownloadIcon className="w-5 h-5 mr-2" /> Backup Data
                 </button>
                 <button onClick={onRestoreClick} className="w-full flex items-center justify-center text-left px-4 py-2 rounded-md my-1 transition-colors bg-gray-700 hover:bg-gray-600">
                    <UploadIcon className="w-5 h-5 mr-2" /> Restore Data
                 </button>
                 <input type="file" ref={fileInputRef} onChange={handleRestore} accept=".json" className="hidden"/>
            </div>
        </aside>
    );
};
