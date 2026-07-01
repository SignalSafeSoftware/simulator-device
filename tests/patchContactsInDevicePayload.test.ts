import { describe, expect, it } from 'vitest';
import {
    patchContactInDevicePayload,
    removeContactFromDevicePayload,
} from '../src/contact/patchContactsInDevicePayload.js';
import { buildHomeDeviceJson } from './support/deviceJsonFixtures.js';

describe('patchContactsInDevicePayload', () => {
    it('patches an existing contact immutably', () => {
        const value = buildHomeDeviceJson();
        const next = patchContactInDevicePayload(value, {
            id: 'c1',
            displayName: 'Updated Helpdesk',
            number: '+1999',
            email: 'help@example.com',
        });

        expect(value.contacts?.[0]?.display_name).toBe('IT Helpdesk');
        expect(next.contacts?.[0]?.display_name).toBe('Updated Helpdesk');
        expect(next.contacts?.[0]?.number).toBe('+1999');
    });

    it('removes a contact immutably', () => {
        const value = buildHomeDeviceJson();
        const next = removeContactFromDevicePayload(value, 'c1');

        expect(value.contacts).toHaveLength(2);
        expect(next.contacts).toHaveLength(1);
        expect(next.contacts?.[0]?.id).toBe('c2');
    });
});
