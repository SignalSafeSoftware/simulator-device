import { describe, expect, it } from 'vitest';
import { contactSnapshotFromSessionContact } from '../src/contact/contactSnapshotFromSessionContact.js';

describe('contactSnapshotFromSessionContact', () => {
    it('converts SimulatorSessionContact to contact detail values', () => {
        expect(
            contactSnapshotFromSessionContact({
                id: 'alice',
                displayName: 'Alice Chen',
                number: '+1-555-100-2000',
                email: 'alice@example.com',
            }),
        ).toEqual({
            id: 'alice',
            displayName: 'Alice Chen',
            number: '+1-555-100-2000',
            email: 'alice@example.com',
        });
    });
});
