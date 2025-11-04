
import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Contact, Category } from '../types';
import { PlusIcon, PencilIcon, TrashIcon } from './Icons';

// Category Manager Component
const CategoryManager: React.FC<{type: 'contact'}> = ({ type }) => {
    const { data, dispatch } = useAppData();
    const [name, setName] = useState('');
    const categories = useMemo(() => data.categories.filter(c => c.type === type), [data.categories, type]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(name.trim()) {
            dispatch({ type: 'ADD_CATEGORY', payload: { name, type }});
            setName('');
        }
    };

    return (
        <div className="mb-4">
            <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="New Category Name"
                    className="flex-grow bg-background border border-gray-600 rounded-md px-3 py-1 text-sm"
                />
                <button type="submit" className="bg-primary text-white px-3 py-1 rounded-md text-sm">Add</button>
            </form>
            <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                    <div key={cat.id} className="bg-surface px-2 py-1 rounded-full text-xs flex items-center gap-2">
                        <span>{cat.name}</span>
                        <button onClick={() => dispatch({type: 'DELETE_CATEGORY', payload: cat.id})} className="hover:text-secondary">
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Contact Modal
const ContactModal: React.FC<{ contact?: Contact; onClose: () => void }> = ({ contact, onClose }) => {
    const { data, dispatch } = useAppData();
    const [name, setName] = useState(contact?.name || '');
    const [email, setEmail] = useState(contact?.email || '');
    const [phone, setPhone] = useState(contact?.phone || '');
    const [imageUrl, setImageUrl] = useState(contact?.imageUrl || '');
    const [categoryId, setCategoryId] = useState(contact?.categoryId || '');
    const [notes, setNotes] = useState(contact?.notes || '');
    
    const contactCategories = useMemo(() => data.categories.filter(c => c.type === 'contact'), [data.categories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const contactData = { name, email, phone, imageUrl, categoryId, notes };
        if (contact) {
            dispatch({ type: 'UPDATE_CONTACT', payload: { ...contact, ...contactData } });
        } else {
            dispatch({ type: 'ADD_CONTACT', payload: contactData });
        }
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-xl space-y-4 w-full max-w-lg">
                <h3 className="text-2xl font-bold">{contact ? 'Edit Contact' : 'New Contact'}</h3>
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-background border border-gray-600 rounded-md px-3 py-2" />
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-background border border-gray-600 rounded-md px-3 py-2" />
                <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-background border border-gray-600 rounded-md px-3 py-2" />
                <input type="url" placeholder="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full bg-background border border-gray-600 rounded-md px-3 py-2" />
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-background border border-gray-600 rounded-md px-3 py-2">
                    <option value="">No Category</option>
                    {contactCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <textarea placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-background border border-gray-600 rounded-md px-3 py-2 h-24"></textarea>
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-background hover:bg-gray-700">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white font-semibold">Save Contact</button>
                </div>
            </form>
        </div>
    );
};

// Contact Detail View
const ContactDetailView: React.FC<{ contact: Contact; onClose: () => void }> = ({ contact, onClose }) => {
    const { data } = useAppData();

    const { clientProjects, totalValue } = useMemo(() => {
        const clientProjects = data.projects.filter(p => p.clientId === contact.id);
        const totalValue = clientProjects.reduce((sum, p) => sum + (p.value || 0), 0);
        return { clientProjects, totalValue };
    }, [data.projects, contact.id]);

    return (
        <div className="fixed inset-0 bg-background/95 flex flex-col p-4 md:p-8 z-40 overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <img src={contact.imageUrl || `https://ui-avatars.com/api/?name=${contact.name}&background=DB2777&color=fff`} alt={contact.name} className="w-24 h-24 rounded-full object-cover border-2 border-primary" />
                    <div>
                        <h2 className="text-3xl font-bold">{contact.name}</h2>
                        <p className="text-text-secondary">{contact.email}</p>
                        <p className="text-text-secondary">{contact.phone}</p>
                    </div>
                </div>
                <button onClick={onClose} className="px-4 py-2 rounded-md bg-surface">Close</button>
            </div>
            <div className="bg-surface p-6 rounded-xl flex-grow">
                <h3 className="text-xl font-bold mb-4">Client Report</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-background p-4 rounded-lg text-center">
                        <p className="text-sm text-text-secondary">Associated Projects</p>
                        <p className="text-2xl font-bold">{clientProjects.length}</p>
                    </div>
                     <div className="bg-background p-4 rounded-lg text-center">
                        <p className="text-sm text-text-secondary">Total Project Value</p>
                        <p className="text-2xl font-bold">₱{totalValue.toFixed(2)}</p>
                    </div>
                </div>
                 <h4 className="font-semibold mb-2">Projects</h4>
                 <ul className="space-y-2">
                    {clientProjects.map(p => (
                        <li key={p.id} className="bg-background p-3 rounded-md flex justify-between">
                            <span>{p.name}</span>
                            <span className="text-sm text-text-secondary">₱{(p.value || 0).toFixed(2)}</span>
                        </li>
                    ))}
                    {clientProjects.length === 0 && <p className="text-sm text-text-secondary">No projects linked to this contact.</p>}
                 </ul>
            </div>
        </div>
    );
};

// Main Contacts Component
export const Contacts: React.FC = () => {
    const { data, dispatch } = useAppData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [activeContact, setActiveContact] = useState<Contact | null>(null);

    const openModal = (contact?: Contact) => {
        setEditingContact(contact);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setEditingContact(undefined);
        setIsModalOpen(false);
    };

    const contactCategories = useMemo(() => data.categories.filter(c => c.type === 'contact'), [data.categories]);
    
    const filteredContacts = useMemo(() => {
        if (selectedCategory === 'all') return data.contacts;
        return data.contacts.filter(c => c.categoryId === selectedCategory);
    }, [data.contacts, selectedCategory]);

    if (activeContact) {
        return <ContactDetailView contact={activeContact} onClose={() => setActiveContact(null)} />;
    }

    return (
        <div className="space-y-8">
            {isModalOpen && <ContactModal contact={editingContact} onClose={closeModal} />}
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold">Contacts</h1>
                <button onClick={() => openModal()} className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-pink-500 font-semibold">
                    <PlusIcon className="w-5 h-5 mr-2" /> New Contact
                </button>
            </div>

            <div className="bg-surface p-6 rounded-xl">
                 <h3 className="text-xl font-bold mb-4">Categories</h3>
                 <CategoryManager type="contact" />
                 <hr className="border-gray-600 my-4" />
                 <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="bg-background border border-gray-600 rounded-md px-3 py-2 mb-4">
                    <option value="all">All Categories</option>
                    {contactCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredContacts.map(contact => (
                        <div key={contact.id} className="bg-background p-4 rounded-lg text-center">
                            <img
                                src={contact.imageUrl || `https://ui-avatars.com/api/?name=${contact.name.replace(/\s/g, '+')}&background=1F2937&color=F9FAFB`}
                                alt={contact.name}
                                className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-surface"
                                onClick={() => setActiveContact(contact)}
                            />
                            <h4 className="font-bold cursor-pointer" onClick={() => setActiveContact(contact)}>{contact.name}</h4>
                            <p className="text-sm text-text-secondary">{contact.email}</p>
                            <div className="mt-4 flex justify-center gap-2">
                                <button onClick={() => openModal(contact)} className="p-2 text-text-secondary hover:text-primary"><PencilIcon className="w-4 h-4"/></button>
                                <button onClick={() => dispatch({type: 'DELETE_CONTACT', payload: contact.id})} className="p-2 text-text-secondary hover:text-secondary"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};