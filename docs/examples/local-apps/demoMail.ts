import { mailFolderSchema, type Mail } from '@signalsafe/simulator-core/apps/contracts';
import { newMail } from '@signalsafe/simulator-core/apps/mail';
import { DEMO_CONTACTS } from './demoContacts';

const folders = mailFolderSchema.enum;
type DemoMailInput = Pick<Mail, 'id' | 'subject' | 'body' | 'createdAt'> & Partial<Mail>;

function sampleMail(identity: string, input: DemoMailInput): Mail {
    return {
        ...newMail(identity),
        threadId: input.id,
        folder: folders.inbox,
        previousFolder: folders.inbox,
        from: DEMO_CONTACTS.Taylor.email,
        to: identity,
        read: false,
        updatedAt: input.createdAt,
        ...input,
    };
}

/** Fictional messages and a local attachment; sending never contacts these example addresses. */
export function createDemoMail(identity: string): Mail[] {
    const checklist = [
        'SIMULATOR DEMO CHECKLIST',
        '',
        '1. Open a contact and inspect its call history.',
        '2. Reply to a message or save an email draft.',
        '3. Edit a photo caption and capture time.',
        '4. Add a fictional vault entry.',
        '5. Reset the demo to restore the starting records.',
    ].join('\n');
    return [
        sampleMail(identity, {
            id: 'demo-mail',
            threadId: 'demo-mail-thread',
            subject: 'Your simulator demo is ready',
            body: 'Try replying, saving a draft, or composing a new message. Send updates this demo only.',
            createdAt: '2026-10-05T12:00:00.000Z',
        }),
        sampleMail(identity, {
            id: 'demo-mail-checklist',
            subject: 'A checklist for your first look',
            body: 'The attached text file has a few things to try. Morgan is copied so you can also explore Reply all. Every address and task in this message is fictional.',
            cc: DEMO_CONTACTS.Morgan.email,
            attachments: [
                {
                    name: 'demo-checklist.txt',
                    mime: 'text/plain',
                    data: `data:text/plain;base64,${btoa(checklist)}`,
                },
            ],
            createdAt: '2026-10-04T16:30:00.000Z',
        }),
        sampleMail(identity, {
            id: 'demo-mail-weekend',
            threadId: 'demo-weekend-thread',
            from: DEMO_CONTACTS.Morgan.email,
            subject: 'Weekend trail ideas',
            body: 'How about a short walk and a picnic? There is a fictional packing list in the Travel vault folder. Pick a time that works for you.',
            read: true,
            createdAt: '2026-10-03T18:10:00.000Z',
        }),
        sampleMail(identity, {
            id: 'demo-mail-library',
            from: 'library@example.test',
            subject: 'Your book club reminder',
            body: 'The example book club meets Thursday at 6 PM. Bring a favorite story to share. This is a sample invitation, not a real reservation.',
            read: true,
            createdAt: '2026-10-02T14:00:00.000Z',
        }),
        sampleMail(identity, {
            id: 'demo-mail-design',
            from: DEMO_CONTACTS.Morgan.email,
            subject: 'Notes from the design catch-up',
            body: 'We discussed readable labels, comfortable touch targets and consistent navigation. Try the simulator at different text sizes and send me a fictional reply with your observations.',
            cc: `${DEMO_CONTACTS.Taylor.email}, ${DEMO_CONTACTS.Avery.email}`,
            createdAt: '2026-10-01T09:15:00.000Z',
        }),
        sampleMail(identity, {
            id: 'demo-mail-draft-weekend',
            threadId: 'demo-weekend-thread',
            folder: folders.drafts,
            previousFolder: folders.drafts,
            from: identity,
            to: DEMO_CONTACTS.Morgan.email,
            subject: 'Re: Weekend trail ideas',
            body: 'A picnic sounds good. I can bring the sandwiches. Shall we meet at ',
            read: true,
            createdAt: '2026-10-03T19:00:00.000Z',
        }),
        sampleMail(identity, {
            id: 'demo-mail-draft-question',
            folder: folders.drafts,
            previousFolder: folders.drafts,
            from: identity,
            to: DEMO_CONTACTS.Taylor.email,
            subject: 'A question about the demo',
            body: 'I have been exploring the simulator and would like to try ',
            read: true,
            createdAt: '2026-10-05T12:20:00.000Z',
        }),
        sampleMail(identity, {
            id: 'demo-mail-sent-welcome',
            threadId: 'demo-mail-thread',
            folder: folders.sent,
            previousFolder: folders.sent,
            from: identity,
            to: DEMO_CONTACTS.Taylor.email,
            subject: 'Re: Your simulator demo is ready',
            body: 'Thanks! I have opened the contacts and tried the photo gallery. This sample reply stays inside the simulator.',
            read: true,
            createdAt: '2026-10-05T12:10:00.000Z',
        }),
        sampleMail(identity, {
            id: 'demo-mail-sent-design',
            folder: folders.sent,
            previousFolder: folders.sent,
            from: identity,
            to: DEMO_CONTACTS.Morgan.email,
            cc: DEMO_CONTACTS.Taylor.email,
            subject: 'Re: Notes from the design catch-up',
            body: 'I will take a look at the phone layout and share some sample feedback after lunch.',
            read: true,
            createdAt: '2026-10-01T10:00:00.000Z',
        }),
        sampleMail(identity, {
            id: 'demo-mail-trash',
            folder: folders.trash,
            previousFolder: folders.inbox,
            from: 'events@example.test',
            subject: "Last month's sample event",
            body: 'This older fictional invitation is in Trash. You can restore it to the inbox or delete it from this demo.',
            read: true,
            createdAt: '2026-09-15T08:00:00.000Z',
        }),
    ];
}
