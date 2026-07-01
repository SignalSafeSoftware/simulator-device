import type { SimulatorDevicePayload } from '../src/types/simulatorDevicePayload.js';
import { TEST_CONTACTS } from './contactFixtures.js';

export function buildHomeDeviceJson(): SimulatorDevicePayload {
    return {
        entry_point: { app: 'home', screen: 'home' },
        device: {
            main_menu_items: [
                { id: 'home', label: 'Home', app: 'home' },
                { id: 'email', label: 'Email', app: 'email' },
                { id: 'phone', label: 'Phone', app: 'phone' },
            ],
        },
        contacts: TEST_CONTACTS.map((contact) => ({
            id: contact.id,
            display_name: contact.displayName,
            number: contact.number,
        })),
        home: {
            widgets: [{ id: 'clock', type: 'clock', title: 'Clock' }],
        },
    };
}

export function buildContactsDeviceJson(): SimulatorDevicePayload {
    return {
        entry_point: { app: 'phone', screen: 'contacts' },
        device: {
            main_menu_items: [
                { id: 'phone', label: 'Phone', app: 'phone' },
                { id: 'contacts', label: 'Contacts', app: 'phone' },
            ],
        },
        contacts: TEST_CONTACTS.map((contact) => ({
            id: contact.id,
            display_name: contact.displayName,
            number: contact.number,
        })),
        phone: {
            call_history: [],
        },
    };
}

export function buildDesktopDiscriminatedJson(): Record<string, unknown> {
    return {
        type: 'desktop',
        entry_point: { app: 'home', screen: 'home' },
    };
}
