import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { Layout } from './components/Layout';
import { SkillTypesView } from './components/SkillTypesView';
import { SkillsView } from './components/SkillsView';
import { EventsView } from './components/EventsView';
import { StaffView } from './components/StaffView';
import { AssignmentsView } from './components/AssignmentsView';
import { SurveyRequestModal } from './components/SurveyRequestModal';
import { SurveyForm } from './components/SurveyForm';
import { supabase } from './lib/supabase';

function AppContent() {
    const { user, loading } = useAuth();
    const [currentView, setCurrentView] = useState('events');
    const [showSurveyModal, setShowSurveyModal] = useState(false);

    const pathParts = window.location.pathname.split('/');
    const isSurveyRoute = pathParts[1] === 'survey' && pathParts[2];
    const surveyToken = isSurveyRoute ? pathParts[2] : null;

    if (surveyToken) {
        return <SurveyForm token={surveyToken} />;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p>Lädt...</p>
            </div>
        );
    }

    if (!user) {
        return <LoginForm />;
    }

    const handleSendSurveys = async (
        staffIds: string[],
        eventIds: string[]
    ) => {
        try {
            for (const staffId of staffIds) {
                const { data: staff } = await supabase
                    .from('staff')
                    .select('name, email')
                    .eq('id', staffId)
                    .single();

                if (!staff) continue;

                const { data: surveyRequest } = await supabase
                    .from('survey_requests')
                    .insert({
                        staff_id: staffId,
                        sent_at: new Date().toISOString(),
                    })
                    .select()
                    .single();

                if (!surveyRequest) continue;

                for (const eventId of eventIds) {
                    await supabase.from('survey_request_events').insert({
                        survey_request_id: surveyRequest.id,
                        event_id: eventId,
                    });
                }

                const { data: events } = await supabase
                    .from('events')
                    .select('title, date')
                    .in('id', eventIds);

                const apiUrl = `${
                    import.meta.env.VITE_SUPABASE_URL
                }/functions/v1/send-survey-email`;
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${
                            import.meta.env.VITE_SUPABASE_ANON_KEY
                        }`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        staffEmail: staff.email,
                        staffName: staff.name,
                        token: surveyRequest.token,
                        events: events || [],
                    }),
                });

                if (!response.ok) {
                    console.error('Fehler beim Versenden der E-Mail');
                }
            }

            alert('Anfragen wurden erfolgreich versendet!');
            setShowSurveyModal(false);
        } catch (error) {
            console.error('Fehler:', error);
            alert('Fehler beim Versenden der Anfragen');
        }
    };

    return (
        <Layout currentView={currentView} onViewChange={setCurrentView}>
            {currentView === 'events' && <EventsView />}
            {currentView === 'staff' && (
                <StaffView onSendSurveys={() => setShowSurveyModal(true)} />
            )}
            {currentView === 'skills' && (
                <div className="space-y-8">
                    <SkillTypesView />
                    <SkillsView />
                </div>
            )}
            {currentView === 'assignments' && <AssignmentsView />}

            {showSurveyModal && (
                <SurveyRequestModal
                    onClose={() => setShowSurveyModal(false)}
                    onSend={handleSendSurveys}
                />
            )}
        </Layout>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
