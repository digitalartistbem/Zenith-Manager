
import React, { useState, useEffect } from 'react';
import { useAppData } from '../hooks/useAppData.tsx';
import { Mood } from '../types.ts';
import { getInspirationalContent } from '../services/geminiService.ts';

const moodOptions: { mood: Mood; emoji: string; color: string }[] = [
    { mood: 'happy', emoji: '😊', color: 'text-yellow-400' },
    { mood: 'excited', emoji: '🤩', color: 'text-orange-400' },
    { mood: 'neutral', emoji: '😐', color: 'text-gray-400' },
    { mood: 'sad', emoji: '😢', color: 'text-blue-400' },
    { mood: 'anxious', emoji: '😟', color: 'text-purple-400' },
];

const MoodTracker: React.FC = () => {
    const { addMoodLog, data } = useAppData();
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
        if(selectedMood) {
            addMoodLog({ mood: selectedMood, notes, date: new Date().toISOString() });
            setSelectedMood(null);
            setNotes('');
            alert('Mood logged successfully!');
        }
    };
    
    const todayLog = data.moodLogs.find(log => new Date(log.date).toDateString() === new Date().toDateString());

    return (
        <div className="bg-surface p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4">How are you feeling today?</h3>
            {todayLog ? (
                <div className="text-center">
                    <p>You've already logged your mood today:</p>
                    <p className={`text-4xl my-2 ${moodOptions.find(m => m.mood === todayLog.mood)?.color}`}>{moodOptions.find(m => m.mood === todayLog.mood)?.emoji}</p>
                    <p className="italic text-text-secondary">"{todayLog.notes}"</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-around">
                        {moodOptions.map(({ mood, emoji, color }) => (
                            <button key={mood} onClick={() => setSelectedMood(mood)} className={`text-4xl p-2 rounded-full transition-transform transform hover:scale-125 ${selectedMood === mood ? 'bg-primary/20 scale-125' : ''}`}>
                                {emoji}
                            </button>
                        ))}
                    </div>
                    {selectedMood && (
                        <>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any thoughts to add?"
                                className="w-full bg-background border border-gray-600 rounded-md px-3 py-2 h-24"
                            ></textarea>
                            <button onClick={handleSubmit} className="w-full bg-primary text-white py-2 rounded-md font-semibold">Log Mood</button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

const InspirationalContent: React.FC = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const result = await getInspirationalContent('quote');
                setContent(result);
            } catch (error) {
                setContent('Be the reason someone smiles today.');
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    return (
        <div className="bg-surface p-6 rounded-xl text-center">
             <h3 className="text-xl font-bold mb-4">A Moment of Zen</h3>
             {loading ? <p>Loading...</p> : <p className="text-lg italic text-text-primary">"{content}"</p>}
        </div>
    );
};

export const Wellbeing: React.FC = () => {
    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold">Wellbeing Hub</h1>
            <MoodTracker />
            <InspirationalContent />
        </div>
    );
};
