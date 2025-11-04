import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData.tsx';
import { Project, Task } from '../types.ts';

type CalendarViewMode = 'month' | 'week' | 'day';

interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    type: 'project' | 'task';
    fullDay: boolean;
}

const CalendarHeader: React.FC<{
    currentDate: Date;
    view: CalendarViewMode;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
    onViewChange: (view: CalendarViewMode) => void;
}> = ({ currentDate, view, onPrev, onNext, onToday, onViewChange }) => {
    
    const formatHeader = () => {
        switch(view) {
            case 'month':
                return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            case 'week':
                const startOfWeek = new Date(currentDate);
                startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(endOfWeek.getDate() + 6);
                return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            case 'day':
                return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        }
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <button onClick={onPrev} className="p-2 rounded-md bg-surface">&lt;</button>
                <button onClick={onToday} className="px-4 py-2 rounded-md bg-surface">Today</button>
                <button onClick={onNext} className="p-2 rounded-md bg-surface">&gt;</button>
                 <h2 className="text-xl md:text-2xl font-bold ml-4">{formatHeader()}</h2>
            </div>
            <div className="flex space-x-1 bg-surface p-1 rounded-md">
                {(['month', 'week', 'day'] as CalendarViewMode[]).map(v => (
                    <button key={v} onClick={() => onViewChange(v)} className={`px-3 py-1 text-sm rounded-md capitalize ${view === v ? 'bg-primary text-white' : ''}`}>
                        {v}
                    </button>
                ))}
            </div>
        </div>
    );
};

const MonthView: React.FC<{ date: Date; events: CalendarEvent[]; onDayClick: (date: Date) => void }> = ({ date, events, onDayClick }) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const calendarDays: Date[] = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        calendarDays.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const isToday = (d: Date) => d.toDateString() === new Date().toDateString();

    return (
        <div className="grid grid-cols-7 gap-px bg-gray-700 border border-gray-700">
            {days.map(day => <div key={day} className="text-center font-semibold py-2 bg-surface text-sm">{day}</div>)}
            {calendarDays.map((day, i) => {
                 const dayEvents = events.filter(e => e.date.toDateString() === day.toDateString());
                 return (
                    <div key={i} onClick={() => onDayClick(day)} className={`p-2 h-28 md:h-36 bg-surface overflow-y-auto cursor-pointer ${day.getMonth() !== date.getMonth() ? 'text-text-secondary/50' : ''}`}>
                        <span className={`flex items-center justify-center w-7 h-7 rounded-full ${isToday(day) ? 'bg-primary text-white' : ''}`}>{day.getDate()}</span>
                         <div className="mt-1">
                            {dayEvents.map(e => (
                                <div key={e.id} className={`text-xs px-1 rounded truncate ${e.type === 'project' ? 'bg-rose-500/50' : 'bg-sky-500/50'}`}>{e.title}</div>
                            ))}
                        </div>
                    </div>
                 )
            })}
        </div>
    );
};

const AgendaView: React.FC<{ date: Date; events: CalendarEvent[] }> = ({ date, events }) => {
    const dayEvents = events.filter(e => e.date.toDateString() === date.toDateString());
    return (
        <div className="bg-surface p-6 rounded-xl">
             <h3 className="text-xl font-bold mb-4">Agenda for {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
             {dayEvents.length > 0 ? (
                 <ul className="space-y-3">
                    {dayEvents.map(event => (
                        <li key={event.id} className="flex items-center gap-3 bg-background p-3 rounded-md">
                            <span className={`w-3 h-3 rounded-full ${event.type === 'project' ? 'bg-rose-500' : 'bg-sky-500'}`}></span>
                            <div>
                                <p>{event.title}</p>
                                <p className="text-xs capitalize text-text-secondary">{event.type} Deadline</p>
                            </div>
                        </li>
                    ))}
                 </ul>
             ) : (
                <p className="text-text-secondary">No deadlines or events scheduled for this day.</p>
             )}
        </div>
    );
};

export const CalendarView: React.FC = () => {
    const { data } = useAppData();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarViewMode>('month');

    const events = useMemo<CalendarEvent[]>(() => {
        const projectEvents = data.projects
            .filter(p => !p.isCompleted)
            .map(p => ({
                id: p.id,
                title: p.name,
                date: new Date(p.deadline),
                type: 'project' as 'project',
                fullDay: true
            }));
        
        const taskEvents = data.projects.flatMap(p =>
            p.tasks
                .filter(t => t.deadline && t.status !== 'done')
                .map(t => ({
                    id: t.id,
                    title: t.text,
                    date: new Date(t.deadline!),
                    type: 'task' as 'task',
                    fullDay: true
                }))
        );

        return [...projectEvents, ...taskEvents];
    }, [data.projects]);

    const handlePrev = () => {
        const newDate = new Date(currentDate);
        if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
        if (view === 'week') newDate.setDate(newDate.getDate() - 7);
        if (view === 'day') newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
    };
    
    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
        if (view === 'week') newDate.setDate(newDate.getDate() + 7);
        if (view === 'day') newDate.setDate(newDate.getDate() + 1);
        setCurrentDate(newDate);
    };
    
    const handleToday = () => setCurrentDate(new Date());

    const handleDayClick = (date: Date) => {
        setCurrentDate(date);
        setView('day');
    };

    const renderView = () => {
        switch (view) {
            case 'month':
                return <MonthView date={currentDate} events={events} onDayClick={handleDayClick} />;
            case 'week': // Simple week as agenda list for now
            case 'day':
                return <AgendaView date={currentDate} events={events} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold">Calendar</h1>
            <div className="bg-surface p-4 md:p-6 rounded-xl">
                 <CalendarHeader
                    currentDate={currentDate}
                    view={view}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    onToday={handleToday}
                    onViewChange={setView}
                 />
                 {renderView()}
            </div>
        </div>
    );
};
