import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData.tsx';
import { Project, Task, TaskStatus, Category } from '../types.ts';
import { PlusIcon, TrashIcon, PencilIcon } from './Icons.tsx';

// Category Manager Component
const CategoryManager: React.FC<{type: 'project'}> = ({ type }) => {
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

// Project Modal
const ProjectModal: React.FC<{ project?: Project; onClose: () => void }> = ({ project, onClose }) => {
    const { data, dispatch } = useAppData();
    const [name, setName] = useState(project?.name || '');
    const [deadline, setDeadline] = useState(project?.deadline.split('T')[0] || '');
    const [categoryId, setCategoryId] = useState(project?.categoryId || '');
    const [clientId, setClientId] = useState(project?.clientId || '');
    const [value, setValue] = useState(project?.value?.toString() || '');
    const [notes, setNotes] = useState(project?.notes || '');
    
    const projectCategories = useMemo(() => data.categories.filter(c => c.type === 'project'), [data.categories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const projectData = {
            name,
            deadline: new Date(deadline).toISOString(),
            isCompleted: project?.isCompleted || false,
            categoryId: categoryId || undefined,
            clientId: clientId || undefined,
            value: value ? parseFloat(value) : undefined,
            notes,
            tasks: project?.tasks || []
        };
        if (project) {
            dispatch({ type: 'UPDATE_PROJECT', payload: { ...project, ...projectData } });
        } else {
            dispatch({ type: 'ADD_PROJECT', payload: projectData });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-xl space-y-4 w-full max-w-lg">
                <h3 className="text-2xl font-bold">{project ? 'Edit Project' : 'New Project'}</h3>
                <input type="text" placeholder="Project Name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-background border border-gray-600 rounded-md px-3 py-2" />
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required className="w-full bg-background border border-gray-600 rounded-md px-3 py-2" />
                <input type="number" placeholder="Project Value (₱)" value={value} onChange={e => setValue(e.target.value)} className="w-full bg-background border border-gray-600 rounded-md px-3 py-2" />
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-background border border-gray-600 rounded-md px-3 py-2">
                    <option value="">No Category</option>
                    {projectCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full bg-background border border-gray-600 rounded-md px-3 py-2">
                    <option value="">No Client</option>
                    {data.contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <textarea placeholder="Project Notes" value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-background border border-gray-600 rounded-md px-3 py-2 h-24"></textarea>
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-background hover:bg-gray-700">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white font-semibold">Save Project</button>
                </div>
            </form>
        </div>
    );
};

// Task Component
const TaskCard: React.FC<{ task: Task; projectId: string }> = ({ task, projectId }) => {
    const { dispatch } = useAppData();
    // Simple edit/delete for now
    return (
        <div className="bg-background p-3 rounded-md mb-2">
            <p>{task.text}</p>
            {task.deadline && <p className="text-xs text-text-secondary mt-1">Due: {new Date(task.deadline).toLocaleDateString()}</p>}
             <button onClick={() => dispatch({type: 'DELETE_TASK', payload: {projectId, taskId: task.id}})} className="text-xs text-secondary mt-1">Delete</button>
        </div>
    );
};

// Project Details (Kanban)
const ProjectDetailView: React.FC<{ project: Project; onClose: () => void }> = ({ project, onClose }) => {
    const { dispatch } = useAppData();
    const [taskText, setTaskText] = useState('');
    const [taskDeadline, setTaskDeadline] = useState('');
    
    const tasksByStatus = useMemo(() => {
        return project.tasks.reduce((acc, task) => {
            acc[task.status].push(task);
            return acc;
        }, { todo: [], inprogress: [], done: [] } as Record<TaskStatus, Task[]>);
    }, [project.tasks]);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if(taskText.trim()){
            dispatch({ type: 'ADD_TASK', payload: { projectId: project.id, task: { text: taskText, status: 'todo', deadline: taskDeadline || undefined } }});
            setTaskText('');
            setTaskDeadline('');
        }
    }

    return (
        <div className="fixed inset-0 bg-background/95 flex flex-col p-4 md:p-8 z-40 overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold">{project.name}</h2>
                    <p className="text-text-secondary">Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
                </div>
                <button onClick={onClose} className="px-4 py-2 rounded-md bg-surface">Close</button>
             </div>

             <form onSubmit={handleAddTask} className="flex gap-2 mb-6 items-end bg-surface p-4 rounded-xl">
                <input type="text" value={taskText} onChange={e => setTaskText(e.target.value)} placeholder="New task description" required className="flex-grow bg-background border border-gray-600 rounded-md px-3 py-2" />
                <input type="date" value={taskDeadline} onChange={e => setTaskDeadline(e.target.value)} className="bg-background border border-gray-600 rounded-md px-3 py-2" />
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md font-semibold">Add Task</button>
             </form>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
                {(['todo', 'inprogress', 'done'] as TaskStatus[]).map(status => (
                    <div key={status} className="bg-surface rounded-xl p-4 flex flex-col">
                        <h3 className="font-bold text-lg mb-4 capitalize">{status === 'inprogress' ? 'In Progress' : status}</h3>
                        <div className="flex-grow">
                        {tasksByStatus[status].map(task => (
                            <div key={task.id} className="bg-background p-3 rounded-md mb-2">
                                <p>{task.text}</p>
                                {task.deadline && <p className="text-xs text-text-secondary mt-1">Due: {new Date(task.deadline).toLocaleDateString()}</p>}
                                <div className="text-xs mt-2 flex gap-2">
                                    {status !== 'todo' && <button onClick={() => dispatch({type: 'UPDATE_TASK_STATUS', payload: {projectId: project.id, taskId: task.id, status: 'todo'}})} className="hover:text-primary">To Do</button>}
                                    {status !== 'inprogress' && <button onClick={() => dispatch({type: 'UPDATE_TASK_STATUS', payload: {projectId: project.id, taskId: task.id, status: 'inprogress'}})} className="hover:text-primary">In Progress</button>}
                                    {status !== 'done' && <button onClick={() => dispatch({type: 'UPDATE_TASK_STATUS', payload: {projectId: project.id, taskId: task.id, status: 'done'}})} className="hover:text-primary">Done</button>}
                                     <button onClick={() => dispatch({type: 'DELETE_TASK', payload: {projectId: project.id, taskId: task.id}})} className="text-secondary ml-auto">Delete</button>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                ))}
            </div>
             <div className="mt-6 bg-surface p-4 rounded-xl">
                <h3 className="font-bold text-lg mb-2">Notes</h3>
                <p className="whitespace-pre-wrap text-text-secondary">{project.notes || 'No notes for this project.'}</p>
             </div>
        </div>
    );
};

// Main Projects Component
export const Projects: React.FC = () => {
    const { data } = useAppData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [activeProject, setActiveProject] = useState<Project | null>(null);

    const openModal = (project?: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setEditingProject(undefined);
        setIsModalOpen(false);
    };

    const projectCategories = useMemo(() => data.categories.filter(c => c.type === 'project'), [data.categories]);

    const filteredProjects = useMemo(() => {
        if (selectedCategory === 'all') return data.projects;
        return data.projects.filter(p => p.categoryId === selectedCategory);
    }, [data.projects, selectedCategory]);

    if (activeProject) {
        return <ProjectDetailView project={activeProject} onClose={() => setActiveProject(null)} />
    }

    return (
        <div className="space-y-8">
            {isModalOpen && <ProjectModal project={editingProject} onClose={closeModal} />}
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold">Projects</h1>
                <button onClick={() => openModal()} className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-pink-500 font-semibold">
                    <PlusIcon className="w-5 h-5 mr-2" /> New Project
                </button>
            </div>

            <div className="bg-surface p-6 rounded-xl">
                 <h3 className="text-xl font-bold mb-4">Categories</h3>
                 <CategoryManager type="project" />
                 <hr className="border-gray-600 my-4" />
                 <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="bg-background border border-gray-600 rounded-md px-3 py-2 mb-4">
                    <option value="all">All Categories</option>
                    {projectCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map(proj => (
                        <div key={proj.id} className="bg-background p-4 rounded-lg flex flex-col">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-lg cursor-pointer" onClick={() => setActiveProject(proj)}>{proj.name}</h4>
                                <div>
                                    <button onClick={() => openModal(proj)} className="p-1 text-text-secondary hover:text-primary"><PencilIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <p className="text-sm text-text-secondary">Due: {new Date(proj.deadline).toLocaleDateString()}</p>
                            <div className="mt-auto pt-4">
                                <div className="w-full bg-surface rounded-full h-2.5">
                                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(proj.tasks.filter(t=>t.status==='done').length / (proj.tasks.length||1)) * 100}%` }}></div>
                                </div>
                                <p className="text-xs text-right mt-1">{proj.tasks.filter(t=>t.status==='done').length}/{proj.tasks.length} tasks done</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
