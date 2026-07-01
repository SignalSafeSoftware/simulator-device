import type { SimulatorDevicePayload } from '../types/simulatorDevicePayload.js';
import type { SimulatorPhoneContactDetailValues } from './contactDetailTypes.js';

function toDeviceContact(contact: SimulatorPhoneContactDetailValues) {
    return {
        id: contact.id,
        display_name: contact.displayName,
        ...(contact.number != null && contact.number !== '' ? { number: contact.number } : {}),
        ...(contact.email != null && contact.email !== '' ? { email: contact.email } : {}),
    };
}

/** Returns a new payload with one contact updated in `contacts`. */
export function patchContactInDevicePayload(
    value: SimulatorDevicePayload,
    contact: SimulatorPhoneContactDetailValues,
): SimulatorDevicePayload {
    const contacts = value.contacts ?? [];
    const nextContact = toDeviceContact(contact);
    const index = contacts.findIndex((entry) => entry.id === contact.id);

    if (index === -1) {
        return {
            ...value,
            contacts: [...contacts, nextContact],
        };
    }

    const nextContacts = contacts.map((entry, i) => (i === index ? { ...entry, ...nextContact } : entry));
    return {
        ...value,
        contacts: nextContacts,
    };
}

/** Returns a new payload with one contact removed from `contacts`. */
export function removeContactFromDevicePayload(
    value: SimulatorDevicePayload,
    contactId: string,
): SimulatorDevicePayload {
    const contacts = value.contacts ?? [];
    return {
        ...value,
        contacts: contacts.filter((entry) => entry.id !== contactId),
    };
}
