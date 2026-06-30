import type { SimulatorSessionContact, SimulatorSessionState } from '@signalsafe/simulator-react';
import { buildState } from './sessionFixtures.js';

export const TEST_CONTACTS: SimulatorSessionContact[] = [
    { id: 'c1', displayName: 'IT Helpdesk', number: '+15550001111' },
    { id: 'c2', displayName: 'HR', number: '+15550002222' },
];

export function buildContactsScreenState(
    overrides: {
        contacts?: SimulatorSessionContact[];
        contactsSearchQuery?: string;
    } = {},
): SimulatorSessionState {
    const contacts = overrides.contacts ?? TEST_CONTACTS;

    return {
        ...buildState({
            activeApp: 'phone',
            showPrimaryMenu: true,
            phone: { screen: 'contacts', stack: ['history'], chosenIndex: null },
            contactsSearchQuery: overrides.contactsSearchQuery ?? '',
        }),
        payload: {
            ...buildState().payload,
            channel: 'phone',
            entryPoint: { app: 'phone', screen: 'contacts' },
            contacts,
            phone: {
                content: {
                    transcript: 'Phone contacts.',
                    choices: [],
                },
                chosenIndex: null,
                callHistory: [],
            },
            device: {
                mainMenuItems: [
                    { id: 'phone', label: 'Phone' },
                    { id: 'contacts', label: 'Contacts' },
                ],
                secondaryDefaults: {},
            },
        },
    };
}
