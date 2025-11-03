import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle2 } from 'lucide-react';

interface Event {
    id: string;
    title: string;
    date: string;
}

interface SurveyData {
    staff_name: string;
    events: Event[];
}

export function SurveyForm({ token }: { token: string }) {
    const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
    const [availability, setAvailability] = useState<Record<string, boolean>>(
        {}
    );
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadSurveyData();
    }, [token]);

    const loadSurveyData = async () => {
        const { data: surveyRequest, error: surveyError } = await supabase
            .from('survey_requests')
            .select(
                `
        id,
        completed_at,
        staff:staff_id (
          name
        )
      `
            )
            .eq('token', token)
            .maybeSingle();

        if (surveyError || !surveyRequest) {
            setError('Umfrage nicht gefunden');
            setLoading(false);
            return;
        }

        if (surveyRequest.completed_at) {
            setSubmitted(true);
            setLoading(false);
            return;
        }

        const { data: requestEvents, error: eventsError } = await supabase
            .from('survey_request_events')
            .select(
                `
        event_id,
        events (
          id,
          title,
          date
        )
      `
            )
            .eq('survey_request_id', surveyRequest.id);

        if (eventsError || !requestEvents) {
            setError('Fehler beim Laden der Events');
            setLoading(false);
            return;
        }

        const events = requestEvents
            .map((re: any) => re.events)
            .filter(Boolean);

        setSurveyData({
            staff_name: (surveyRequest.staff as any).name,
            events,
        });

        const { data: existingAvailability } = await supabase
            .from('staff_availability')
            .select('event_id, is_available')
            .eq('survey_request_id', surveyRequest.id);

        if (existingAvailability) {
            const availabilityMap: Record<string, boolean> = {};
            existingAvailability.forEach((a: any) => {
                availabilityMap[a.event_id] = a.is_available;
            });
            setAvailability(availabilityMap);
        }

        setLoading(false);
    };

    const toggleAvailability = (eventId: string) => {
        setAvailability((prev) => ({
            ...prev,
            [eventId]: !prev[eventId],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const { data: surveyRequest } = await supabase
            .from('survey_requests')
            .select('id')
            .eq('token', token)
            .maybeSingle();

        if (!surveyRequest) {
            setError('Umfrage nicht gefunden');
            setSubmitting(false);
            return;
        }

        for (const event of surveyData!.events) {
            const isAvailable = availability[event.id] || false;

            await supabase.from('staff_availability').upsert(
                {
                    survey_request_id: surveyRequest.id,
                    event_id: event.id,
                    is_available: isAvailable,
                },
                {
                    onConflict: 'survey_request_id,event_id',
                }
            );
        }

        await supabase
            .from('survey_requests')
            .update({ completed_at: new Date().toISOString() })
            .eq('id', surveyRequest.id);

        setSubmitted(true);
        setSubmitting(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <p>Lädt...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <p className="text-red-600 text-center">{error}</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle2 className="w-16 h-16 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        Vielen Dank!
                    </h2>
                    <p className="text-slate-600">
                        Deine Rückmeldung wurde erfolgreich gespeichert.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        Verfügbarkeits-Umfrage
                    </h1>
                    <p className="text-slate-600 mb-8">
                        Hallo {surveyData?.staff_name}, bitte teile uns mit, an
                        welchen Events du verfügbar bist.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {surveyData?.events.map((event) => (
                            <label
                                key={event.id}
                                className="flex items-start p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition"
                            >
                                <input
                                    type="checkbox"
                                    checked={availability[event.id] || false}
                                    onChange={() =>
                                        toggleAvailability(event.id)
                                    }
                                    className="mt-1 w-5 h-5 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                                />
                                <div className="ml-4 flex-1">
                                    <div className="font-medium text-slate-900">
                                        {event.title}
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">
                                        {formatDate(event.date)}
                                    </div>
                                </div>
                            </label>
                        ))}

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting
                                    ? 'Wird gespeichert...'
                                    : 'Absenden'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
