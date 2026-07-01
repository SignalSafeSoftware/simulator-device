import type { SimulatorSessionContact } from '@signalsafe/simulator-react';
import type { SimulatorPhoneContactDetailValues } from './contactDetailTypes.js';

export function contactSnapshotFromSessionContact(
    contact: SimulatorSessionContact,
): SimulatorPhoneContactDetailValues {
    return {
        id: contact.id,
        displayName: contact.displayName,
        number: contact.number ?? '',
        email: contact.email ?? '',
    };
}
