import type {
    SimulatorCallHistoryEntry,
    SimulatorSessionState,
} from '@signalsafe/simulator-react/types/session';

export function buildIncomingCallState(
    overrides: {
        callHistory?: SimulatorCallHistoryEntry[];
        callerName?: string;
        callerNumber?: string;
        contacts?: Array<{ id: string; displayName: string; number?: string }>;
    } = {},
): SimulatorSessionState {
    return {
        payload: {
            templateKey: 'test',
            name: 'Test',
            channel: 'phone',
            templateId: null,
            runId: null,
            attemptId: null,
            topicTags: [],
            entryPoint: { app: 'phone', screen: 'incoming_call' },
            device: null,
            email: null,
            sms: null,
            browser: null,
            phone: {
                content: {
                    transcript: 'Incoming call.',
                    choices: [],
                    caller_name: overrides.callerName ?? 'Alice Chen',
                    phone_number: overrides.callerNumber ?? '+1 (555) 100-2000',
                },
                chosenIndex: null,
                callHistory: overrides.callHistory,
            },
            contacts: overrides.contacts ?? [
                { id: 'alice', displayName: 'Alice Chen', number: '+1-555-100-2000' },
            ],
            directory: null,
            home: null,
        },
        view: {
            activeApp: 'phone',
            showPrimaryMenu: false,
            phone: { screen: 'incoming_call', stack: [], chosenIndex: null },
            email: { screen: 'list', stack: [], selectedMessageId: null },
            messages: { screen: 'threads', stack: [], visibleCount: 0 },
            internet: { screen: 'landing', stack: [] },
            home: { screen: 'home' },
            contactsPanelOpen: false,
            contactsSearchQuery: '',
            actionHistory: [],
        },
    };
}
