import type { SimulatorSessionContact } from '@signalsafe/simulator-react';
import type { SimulatorPhoneContactDetailValues } from './contactDetailTypes.js';

export function contactSnapshotFromSessionContact(
    contact: SimulatorSessionContact,
): SimulatorPhoneContactDetailValues {
    return {
        id: contact.id,
        phoneNumbers: contact.phoneNumbers?.map((item) => ({ ...item })),
        emailAddresses: contact.emailAddresses?.map((item) => ({ ...item })),
        displayName: contact.displayName,
        number: contact.number ?? '',
        email: contact.email ?? '',
    };
}
