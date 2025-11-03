import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Crown } from 'lucide-react';

interface Event {
    id: string;
    title: string;
    date: string;
}

interface Staff {
    id: string;
    name: string;
    is_leader: boolean;
    skills: {
        skill_types: {
            color: string;
        };
    };
}

interface Availability {
    [staffId: string]: {
        [eventId: string]: boolean;
    };
}

interface Assignment {
    [eventId: string]: Set<string>;
}

export function AssignmentsView() {
    const [events, setEvents] = useState<Event[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [availability, setAvailability] = useState<Availability>({});
    const [assignments, setAssignments] = useState<Assignment>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [
            eventsResult,
            staffResult,
            availabilityResult,
            assignmentsResult,
        ] = await Promise.all([
            supabase
                .from('events')
                .select('*')
                .order('date', { ascending: true }),
            supabase
                .from('staff')
                .select('id, name, is_leader, skills(skill_types(color))')
                .order('name'),
            supabase.from('staff_availability').select(`
          event_id,
          is_available,
          survey_requests!inner(staff_id)
        `),
            supabase.from('event_assignments').select('event_id, staff_id'),
        ]);

        if (!eventsResult.error && eventsResult.data) {
            setEvents(eventsResult.data);
        }

        if (!staffResult.error && staffResult.data) {
            setStaff(staffResult.data as Staff[]);
        }

        if (!availabilityResult.error && availabilityResult.data) {
            const availabilityMap: Availability = {};
            availabilityResult.data.forEach((item: any) => {
                const staffId = item.survey_requests.staff_id;
                if (!availabilityMap[staffId]) {
                    availabilityMap[staffId] = {};
                }
                availabilityMap[staffId][item.event_id] = item.is_available;
            });
            setAvailability(availabilityMap);
        }

        if (!assignmentsResult.error && assignmentsResult.data) {
            const assignmentsMap: Assignment = {};
            assignmentsResult.data.forEach((item: any) => {
                if (!assignmentsMap[item.event_id]) {
                    assignmentsMap[item.event_id] = new Set();
                }
                assignmentsMap[item.event_id].add(item.staff_id);
            });
            setAssignments(assignmentsMap);
        }

        setLoading(false);
    };

    const toggleAssignment = async (eventId: string, staffId: string) => {
        const isCurrentlyAssigned = assignments[eventId]?.has(staffId) || false;

        if (isCurrentlyAssigned) {
            await supabase
                .from('event_assignments')
                .delete()
                .eq('event_id', eventId)
                .eq('staff_id', staffId);

            setAssignments((prev) => {
                const newAssignments = { ...prev };
                if (newAssignments[eventId]) {
                    newAssignments[eventId] = new Set(newAssignments[eventId]);
                    newAssignments[eventId].delete(staffId);
                }
                return newAssignments;
            });
        } else {
            const { data: session } = await supabase.auth.getSession();
            await supabase.from('event_assignments').insert({
                event_id: eventId,
                staff_id: staffId,
                assigned_by: session.session?.user.id || null,
            });

            setAssignments((prev) => {
                const newAssignments = { ...prev };
                if (!newAssignments[eventId]) {
                    newAssignments[eventId] = new Set();
                } else {
                    newAssignments[eventId] = new Set(newAssignments[eventId]);
                }
                newAssignments[eventId].add(staffId);
                return newAssignments;
            });
        }
    };

    const isAvailable = (staffId: string, eventId: string) => {
        return availability[staffId]?.[eventId] || false;
    };

    const isAssigned = (staffId: string, eventId: string) => {
        return assignments[eventId]?.has(staffId) || false;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
        });
    };

    if (loading) {
        return <div className="text-center py-8">Lädt...</div>;
    }

    if (events.length === 0 || staff.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                <p className="text-slate-500">
                    Bitte erstellen Sie zuerst Events und Staff-Mitglieder.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                    Einteilung
                </h2>
                <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-slate-100 border-2 border-slate-300 rounded"></div>
                        <span className="text-slate-600">Nicht verfügbar</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 border-2 border-green-500 rounded"></div>
                        <span className="text-slate-600">Verfügbar</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-green-500 rounded"></div>
                        <span className="text-slate-600">Eingeteilt</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Crown className="w-4 h-4 text-amber-500" />
                        <span className="text-slate-600">Worship-Leiter</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 sticky left-0 bg-slate-50 z-10 min-w-[200px]">
                                Staff
                            </th>
                            {events.map((event) => (
                                <th
                                    key={event.id}
                                    className="px-4 py-3 text-center text-sm font-semibold text-slate-900 min-w-[120px]"
                                >
                                    <div>{event.title}</div>
                                    <div className="text-xs font-normal text-slate-500 mt-1">
                                        {formatDate(event.date)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map((staffMember) => {
                            const skillTypeColor =
                                staffMember.skills.skill_types.color;

                            return (
                                <tr
                                    key={staffMember.id}
                                    className="border-b border-slate-100 hover:bg-slate-50"
                                >
                                    <td className="px-4 py-3 sticky left-0 bg-white z-10">
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-3 h-3 rounded"
                                                style={{
                                                    backgroundColor:
                                                        skillTypeColor,
                                                }}
                                            />
                                            <span className="font-medium text-slate-900">
                                                {staffMember.name}
                                            </span>
                                            {staffMember.is_leader && (
                                                <Crown className="w-4 h-4 text-amber-500" />
                                            )}
                                        </div>
                                    </td>

                                    {events.map((event) => {
                                        const available = isAvailable(
                                            staffMember.id,
                                            event.id
                                        );
                                        const assigned = isAssigned(
                                            staffMember.id,
                                            event.id
                                        );

                                        return (
                                            <td
                                                key={event.id}
                                                className="px-4 py-3 text-center"
                                            >
                                                <button
                                                    onClick={() =>
                                                        toggleAssignment(
                                                            event.id,
                                                            staffMember.id
                                                        )
                                                    }
                                                    disabled={!available}
                                                    className={`w-8 h-8 rounded transition inline-flex items-center justify-center ${
                                                        available
                                                            ? 'border-2'
                                                            : 'bg-slate-100 border-2 border-slate-300 cursor-not-allowed'
                                                    }`}
                                                    style={{
                                                        backgroundColor:
                                                            assigned
                                                                ? skillTypeColor
                                                                : '',
                                                        borderColor: available
                                                            ? skillTypeColor
                                                            : '',
                                                    }}
                                                    title={
                                                        assigned
                                                            ? 'Eingeteilt (Klick zum Entfernen)'
                                                            : available
                                                            ? 'Verfügbar (Klick zum Einteilen)'
                                                            : 'Nicht verfügbar'
                                                    }
                                                >
                                                    {staffMember.is_leader && (
                                                        <Crown
                                                            className={`w-4 h-4 ${
                                                                available
                                                                    ? 'text-amber-500'
                                                                    : 'text-slate-300'
                                                            }`}
                                                        />
                                                    )}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
