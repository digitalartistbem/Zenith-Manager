
import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { JournalEntry } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

const JournalEditor: React.FC<{ entry?: JournalEntry; onDone: () => void }> = ({ entry, onDone }) => {
    const { addJournalEntry, updateJournalEntry } = useAppData();
    const [title, setTitle] = useState(entry?.title || '');
    const [content, setContent] = useState(entry?.content || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title && content) {
            if (entry) {
                updateJournalEntry({ ...entry, title, content });
            } else {
                addJournalEntry({ title, content, date: new Date().toISOString() });
            }
            onDone();
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-xl space-y-4 w-full max-w-2xl">
                 <h3 className="text-2xl font-bold">{entry ? 'Edit Entry' : 'New Journal Entry'}</h3>
                <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-background border border-gray-600 rounded-md px-3 py-2" />
                <textarea placeholder="Write your thoughts..." value={content} onChange={e => setContent(e.target.value)} required className="w-full bg-background border border-gray-600 rounded-md px-3 py-2 h-64"></textarea>
                <div className="flex justify-end space-x-2">
                    <button type="button" onClick={onDone} className="px-4 py-2 rounded-md bg-background hover:bg-gray-700">Cancel</button>
                    <button type="submit" className="flex justify-center items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-pink-500 font-semibold">
                        {entry ? 'Save Changes' : 'Save Entry'}
                    </button>
                </div>
            </form>
        </div>
    );
};


export const Journals: React.FC = () => {
    const { data, deleteJournalEntry } = useAppData();
    const [editingEntry, setEditingEntry] = useState<JournalEntry | undefined>(undefined);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    
    const sortedEntries = [...data.journalEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const openEditor = (entry?: JournalEntry) => {
        setEditingEntry(entry);
        setIsEditorOpen(true);
    };

    const closeEditor = () => {
        setEditingEntry(undefined);
        setIsEditorOpen(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                 <h1 className="text-4xl font-bold">My Journal</h1>
                 <button onClick={() => openEditor()} className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-pink-500 transition-colors font-semibold">
                     <PlusIcon className="w-5 h-5 mr-2" /> New Entry
                 </button>
            </div>
            
            {isEditorOpen && <JournalEditor entry={editingEntry} onDone={closeEditor} />}
            
            <div className="space-y-4">
                {sortedEntries.map(entry => (
                    <div key={entry.id} className="bg-surface p-6 rounded-xl">
                        <div className="flex justify-between items-start">
                             <div>
                                <h3 className="text-xl font-bold">{entry.title}</h3>
                                <p className="text-sm text-text-secondary mb-2">{new Date(entry.date).toLocaleString()}</p>
                                <p className="whitespace-pre-wrap line-clamp-3">{entry.content}</p>
                            </div>
                            <div className="flex space-x-2 flex-shrink-0 ml-4">
                                <button onClick={() => openEditor(entry)} className="text-sm px-3 py-1 bg-background rounded-md">Edit</button>
                                <button onClick={() => deleteJournalEntry(entry.id)} className="text-text-secondary hover:text-secondary p-1"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    </div>
                ))}
                {sortedEntries.length === 0 && (
                    <p className="text-center text-text-secondary py-16">Your journal is a blank canvas. Start writing!</p>
                )}
            </div>
        </div>
    );
};