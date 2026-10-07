import type {
    SimulatorContact,
    SimulatorContactValue,
} from '@signalsafe/simulator-core/devicePayload';
import type {
    ContactFormDetails,
    ContactFormSource,
    ContactFormValue,
} from '@signalsafe/simulator-react/views/contacts/contactFormModel';
import type { SimulatorSessionContact } from '@signalsafe/simulator-react/types/session';

interface DemoContactIdentity {
    id: string;
    name: string;
    number: string;
    email: string;
}

/** Fictional identities shared by the demo's contacts, calls, messages and mail. */
export const DEMO_CONTACTS = {
    Taylor: {
        id: 'taylor-example',
        name: 'Taylor Example',
        number: '+12025550123',
        email: 'taylor@example.test',
    },
    Morgan: {
        id: 'morgan-chen',
        name: 'Morgan Chen',
        number: '+14155550148',
        email: 'morgan@example.test',
    },
    Avery: {
        id: 'avery-patel',
        name: 'Avery Patel',
        number: '+13035550176',
        email: 'avery@example.test',
    },
    Jordan: {
        id: 'jordan-rivera',
        name: 'Jordan Rivera',
        number: '+12025550164',
        email: 'jordan@example.test',
    },
    Casey: {
        id: 'casey-brooks',
        name: 'Casey Brooks',
        number: '+12125550139',
        email: 'casey@example.test',
    },
    Northstar: {
        id: 'northstar-studio',
        name: 'Northstar Studio',
        number: '+12025550188',
        email: 'hello@northstar.example.test',
    },
} as const satisfies Record<string, DemoContactIdentity>;

/** Return fresh arrays so editing one demo session never changes the starting data. */
export function createDemoContacts(): SimulatorContact[] {
    const { Taylor, Morgan, Avery, Jordan, Casey, Northstar } = DEMO_CONTACTS;
    return [
        {
            id: Taylor.id,
            display_name: Taylor.name,
            number: Taylor.number,
            email: Taylor.email,
            phone_numbers: [
                { label: 'Mobile', value: Taylor.number },
                { label: 'Home', value: '+12025550124' },
            ],
            email_addresses: [
                { label: 'Work', value: Taylor.email },
                { label: 'Personal', value: 'taylor.home@example.test' },
            ],
        },
        {
            id: Morgan.id,
            display_name: Morgan.name,
            number: Morgan.number,
            email: Morgan.email,
            phone_numbers: [
                { label: 'Mobile', value: Morgan.number },
                { label: 'Work', value: '+14155550149' },
            ],
            email_addresses: [
                { label: 'Work', value: Morgan.email },
                { label: 'Personal', value: 'morgan.home@example.test' },
            ],
        },
        {
            id: Avery.id,
            display_name: Avery.name,
            number: Avery.number,
            email: Avery.email,
            phone_numbers: [
                { label: 'Mobile', value: Avery.number },
                { label: 'Travel', value: '+442079460018' },
            ],
            email_addresses: [{ label: 'Personal', value: Avery.email }],
        },
        {
            id: Jordan.id,
            display_name: Jordan.name,
            number: Jordan.number,
            email: Jordan.email,
            phone_numbers: [{ label: 'Mobile', value: Jordan.number }],
            email_addresses: [{ label: 'Personal', value: Jordan.email }],
        },
        {
            id: Casey.id,
            display_name: Casey.name,
            number: Casey.number,
            email: Casey.email,
            phone_numbers: [{ label: 'Mobile', value: Casey.number }],
            email_addresses: [{ label: 'Work', value: Casey.email }],
        },
        {
            id: Northstar.id,
            display_name: Northstar.name,
            number: Northstar.number,
            email: Northstar.email,
            phone_numbers: [
                { label: 'Studio', value: Northstar.number },
                { label: 'Events', value: '+12025550189' },
            ],
            email_addresses: [
                { label: 'General', value: Northstar.email },
                { label: 'Events', value: 'events@northstar.example.test' },
            ],
        },
    ];
}

/** A demo contact as the shared editor sees it; the session projects it into screen data. */
export interface DemoContact {
    id: string;
    name: string;
    details: ContactFormDetails;
}

const withIds = (id: string, kind: string, values: readonly SimulatorContactValue[] = []) =>
    values.map((item, index) => ({
        id: `${id}-${kind}-${index}`,
        label: item.label,
        value: item.value,
    }));

export function createDemoContactRecords(): DemoContact[] {
    return createDemoContacts().map((contact) => {
        const phones = withIds(contact.id, 'phone', contact.phone_numbers);
        const emails = withIds(contact.id, 'email', contact.email_addresses);
        return {
            id: contact.id,
            name: contact.display_name,
            details: {
                phones,
                emails,
                addresses: [],
                preferredPhone: phones[0]?.id ?? null,
                preferredEmail: emails[0]?.id ?? null,
                preferredAddress: null,
            },
        };
    });
}

export function contactFormSource(contact: DemoContact | undefined): ContactFormSource | undefined {
    return contact && { name: contact.name, details: contact.details };
}

const preferredValue = (values: ContactFormValue[], preferredId: string | null) =>
    (values.find((value) => value.id === preferredId) ?? values[0])?.value;

export function toSessionContact({ id, name, details }: DemoContact): SimulatorSessionContact {
    const values = (items: ContactFormValue[]) =>
        items.map(({ label, value }) => ({ label, value }));
    return {
        id,
        displayName: name,
        phoneNumbers: values(details.phones),
        emailAddresses: values(details.emails),
        postalAddresses: values(details.addresses),
        number: preferredValue(details.phones, details.preferredPhone),
        email: preferredValue(details.emails, details.preferredEmail),
    };
}
