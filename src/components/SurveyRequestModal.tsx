import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Send } from 'lucide-react';

interface Staff {
    id: string;
    name: string;
    email: string;
    skills: {
        name: string;
    };
}

interface Event {
    id: string;
    title: string;
    date: string;
}

interface SurveyRequestModalProps {
    onClose: () => void;
    onSend: (staffIds: string[], eventIds: string[]) => void;
}

export function SurveyRequestModal({
    onClose,
    onSend,
}: SurveyRequestModalProps) {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<Set<string>>(new Set());
    const [selectedEvents, setSelectedEvents] = useState<Set<string>>(
        new Set()
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [staffResult, eventsResult] = await Promise.all([
            supabase
                .from('staff')
                .select('id, name, email, skills(name)')
                .order('name'),
            supabase
                .from('events')
                .select('*')
                .order('date', { ascending: true }),
        ]);

        if (!staffResult.error && staffResult.data) {
            setStaff(staffResult.data as Staff[]);
        }

        if (!eventsResult.error && eventsResult.data) {
            setEvents(eventsResult.data);
        }

        setLoading(false);
    };

    const toggleStaff = (id: string) => {
        const newSelected = new Set(selectedStaff);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedStaff(newSelected);
    };

    const toggleAllStaff = () => {
        if (selectedStaff.size === staff.length) {
            setSelectedStaff(new Set());
        } else {
            setSelectedStaff(new Set(staff.map((staff) => staff.id)));
        }
    };

    const toggleEvent = (id: string) => {
        const newSelected = new Set(selectedEvents);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedEvents(newSelected);
    };

    const toggleAllEvents = () => {
        if (selectedEvents.size === events.length) {
            setSelectedEvents(new Set());
        } else {
            setSelectedEvents(new Set(events.map((event) => event.id)));
        }
    };

    const handleSend = () => {
        onSend(Array.from(selectedStaff), Array.from(selectedEvents));
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const canSend = selectedStaff.size > 0 && selectedEvents.size > 0;

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-8">
                    <p>Lädt...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">
                        Anfragen versenden
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    Staff auswählen ({selectedStaff.size})
                                </h3>
                                <button
                                    onClick={toggleAllStaff}
                                    className="text-sm text-slate-600 hover:text-slate-900 underline"
                                >
                                    {selectedEvents.size === events.length
                                        ? 'Alle abwählen'
                                        : 'Alle auswählen'}
                                </button>
                            </div>

                            <div className="space-y-2">
                                {staff.map((staffMember) => (
                                    <label
                                        key={staffMember.id}
                                        className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedStaff.has(
                                                staffMember.id
                                            )}
                                            onChange={() =>
                                                toggleStaff(staffMember.id)
                                            }
                                            className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                                        />
                                        <div className="ml-3 flex-1">
                                            <div className="font-medium text-slate-900">
                                                {staffMember.name}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {staffMember.email}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Events auswählen ({selectedEvents.size})
                                </h3>
                                <button
                                    onClick={toggleAllEvents}
                                    className="text-sm text-slate-600 hover:text-slate-900 underline"
                                >
                                    {selectedEvents.size === events.length
                                        ? 'Alle abwählen'
                                        : 'Alle auswählen'}
                                </button>
                            </div>
                            <div className="space-y-2">
                                {events.map((event) => (
                                    <label
                                        key={event.id}
                                        className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedEvents.has(
                                                event.id
                                            )}
                                            onChange={() =>
                                                toggleEvent(event.id)
                                            }
                                            className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                                        />
                                        <div className="ml-3 flex-1">
                                            <div className="font-medium text-slate-900">
                                                {event.title}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {formatDate(event.date)}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">
                            {selectedStaff.size} Staff · {selectedEvents.size}{' '}
                            Events
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={!canSend}
                                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                                <span>Anfragen versenden</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
