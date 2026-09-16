import type { SimulatorDevicePayload } from '../types/simulatorDevicePayload.js';
import type { SimulatorPhoneContactDetailValues } from './contactDetailTypes.js';

function toDeviceContact(contact: SimulatorPhoneContactDetailValues) {
    const hasPhones = contact.phoneNumbers !== undefined;
    const hasNumber = Object.hasOwn(contact, 'number');
    const hasEmails = contact.emailAddresses !== undefined;
    const hasEmail = Object.hasOwn(contact, 'email');
    return {
        id: contact.id,
        display_name: contact.displayName,
        ...(hasPhones
            ? { phone_numbers: contact.phoneNumbers, number: contact.phoneNumbers?.[0]?.number }
            : hasNumber ? { phone_numbers: undefined, number: contact.number } : {}),
        ...(hasEmails
            ? { email_addresses: contact.emailAddresses, email: contact.emailAddresses?.[0]?.value }
            : hasEmail ? { email_addresses: undefined, email: contact.email } : {}),
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
