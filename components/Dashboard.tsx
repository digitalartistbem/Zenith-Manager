
import React, { useState, useEffect, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { getInspirationalContent } from '../services/geminiService';

const InspirationalContent: React.FC = () => {
    const [content, setContent] = useState('');
    const [type, setType] = useState<'quote' | 'verse'>('quote');
    const [loading, setLoading] = useState(true);

    const fetchContent = async (contentType: 'quote' | 'verse') => {
        setLoading(true);
        try {
            const result = await getInspirationalContent(contentType);
            setContent(result);
        } catch (error) {
            console.error('Failed to fetch content:', error);
            setContent('Could not load content. Please try again later.');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchContent(type);
    }, [type]);

    return (
        <div className="bg-surface p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Daily Inspiration</h3>
                <div className="flex space-x-2">
                    <button onClick={() => setType('quote')} className={`px-3 py-1 text-sm rounded-md ${type === 'quote' ? 'bg-primary text-white' : 'bg-background'}`}>Quote</button>
                    <button onClick={() => setType('verse')} className={`px-3 py-1 text-sm rounded-md ${type === 'verse' ? 'bg-primary text-white' : 'bg-background'}`}>Verse</button>
                </div>
            </div>
            {loading ? <p className="text-text-secondary">Loading...</p> : <p className="text-lg italic text-center text-text-primary">"{content}"</p>}
        </div>
    );
};


export const Dashboard: React.FC = () => {
    const { data } = useAppData();

    const upcomingDeadlines = useMemo(() => {
        const today = new Date();
        today.setHours(0,0,0,0);
        return data.projects
            .filter(p => !p.isCompleted && new Date(p.deadline) >= today)
            .sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
            .slice(0, 3);
    }, [data.projects]);

    const recentTransactions = useMemo(() => {
        return [...data.transactions]
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
    }, [data.transactions]);
    
    const todaysTasks = useMemo(() => {
        const todayString = new Date().toISOString().split('T')[0];
        return data.projects.flatMap(p => 
            p.tasks
                .filter(t => t.deadline === todayString && t.status !== 'done')
                .map(t => ({...t, projectName: p.name}))
        );
    }, [data.projects]);

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold">Welcome Back!</h1>
            <InspirationalContent />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">Today's Tasks</h3>
                    <ul className="space-y-2">
                        {todaysTasks.length > 0 ? todaysTasks.map(task => (
                           <li key={task.id} className="bg-background p-3 rounded-md">
                            <p>{task.text}</p>
                            <p className="text-xs text-text-secondary">{task.projectName}</p>
                           </li>
                        )) : <p className="text-text-secondary">No tasks due today. Enjoy your day!</p>}
                    </ul>
                </div>
                <div className="bg-surface p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">Upcoming Deadlines</h3>
                     <ul className="space-y-2">
                        {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(p => (
                           <li key={p.id} className="bg-background p-3 rounded-md flex justify-between">
                               <span>{p.name}</span>
                               <span className="text-text-secondary">{new Date(p.deadline).toLocaleDateString()}</span>
                           </li>
                        )) : <p className="text-text-secondary">No upcoming deadlines.</p>}
                    </ul>
                </div>
                 <div className="bg-surface p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
                    <ul className="space-y-2">
                        {recentTransactions.length > 0 ? recentTransactions.map(t => (
                            <li key={t.id} className="bg-background p-3 rounded-md flex justify-between">
                                <span>{t.description}</span>
                                <span className={t.type === 'income' ? 'text-green-400' : 'text-red-400'}>
                                    {t.type === 'income' ? '+' : '-'}₱{t.amount.toFixed(2)}
                                </span>
                            </li>
                        )) : <p className="text-text-secondary">No recent transactions.</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
};