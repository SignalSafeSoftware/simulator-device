import type {
    SimulatorMessagesApp,
    SmsThreadMessage,
} from '@signalsafe/simulator-core/devicePayload';
import { MessageSender } from '@signalsafe/simulator-react/types/session';
import { DEMO_CONTACTS } from './demoContacts';

export interface DemoConversation {
    id: string;
    name: string;
    number: string;
    unread: boolean;
    messages: SmsThreadMessage[];
}

type Contact = (typeof DEMO_CONTACTS)[keyof typeof DEMO_CONTACTS];
type Exchange = readonly [MessageSender, string];

function conversation(
    contact: Contact,
    date: string,
    exchanges: readonly Exchange[],
    unread = false,
): DemoConversation {
    const id = contact === DEMO_CONTACTS.Taylor ? 'demo-thread' : `thread-${contact.id}`;
    return {
        id,
        name: contact.name,
        number: contact.number,
        unread,
        messages: exchanges.map(([from, text], index) => ({
            id: `${id}-${index + 1}`,
            from,
            text,
            timestamp: new Date(Date.parse(date) + index * 120_000).toISOString(),
        })),
    };
}

/** Fictional conversations demonstrate both directions, unread threads and longer messages. */
export function createDemoConversations(): DemoConversation[] {
    const { Me, Them } = MessageSender;
    return [
        conversation(
            DEMO_CONTACTS.Taylor,
            '2026-10-05T16:00:00.000Z',
            [
                [Them, 'Ready to explore the simulator?'],
                [Me, 'Yes! I was just looking at the photos from our last walk.'],
                [
                    Them,
                    'The mountain illustration is my favorite. Shall we try the Riverside Loop this weekend?',
                ],
                [Me, 'Saturday works for me. Where should we meet?'],
                [
                    Them,
                    'At the park entrance at 10. Morgan is bringing a sketchbook, and I will pack a picnic.',
                ],
                [Me, 'Perfect. I will bring water and something to share.'],
                [
                    Them,
                    'Great! The route is about two miles, with a footbridge and a meadow. We can take our time.',
                ],
                [Me, 'See you Saturday!'],
            ],
            true,
        ),
        conversation(
            DEMO_CONTACTS.Morgan,
            '2026-10-05T15:00:00.000Z',
            [
                [Them, 'The new poster sketches are ready for a second look.'],
                [Me, 'Nice! Did you try the blue and green palette?'],
                [Them, 'I did. It works well with the larger title and simpler shapes.'],
                [Me, 'Could you bring a few prints to the studio?'],
                [Them, 'Of course. I also sent the design catch-up notes by email.'],
                [Me, 'Thanks. I will read it before we meet.'],
                [Them, 'No rush. We can compare everything at the open studio on Sunday.'],
            ],
            true,
        ),
        conversation(DEMO_CONTACTS.Avery, '2026-10-04T19:00:00.000Z', [
            [Them, 'My train arrives Friday afternoon.'],
            [Me, 'Wonderful! Do you have everything you need for the weekend?'],
            [Them, 'Almost. I am making a short packing checklist.'],
            [Me, 'Bring a light jacket. The evenings get cool by the river.'],
            [
                Them,
                'Good reminder. I saved a fictional travel reference in the vault to try the folders.',
            ],
            [Me, 'We should stop by the community market while you are here.'],
            [Them, 'That sounds like a good start. See you Friday!'],
        ]),
        conversation(DEMO_CONTACTS.Jordan, '2026-10-04T17:00:00.000Z', [
            [Them, 'Can you help arrange the displays at Northstar?'],
            [Me, 'Happy to. What needs to be done?'],
            [Them, 'We have six posters, a table of sketchbooks, and a small welcome sign.'],
            [Me, 'I can take care of the welcome table.'],
            [Them, 'Thank you! Leave a little room for Casey to demonstrate the printing process.'],
            [Me, 'Will do. I will be there at 1:30 on Sunday.'],
        ]),
        conversation(DEMO_CONTACTS.Casey, '2026-10-03T20:00:00.000Z', [
            [Me, 'How is the workshop preparation going?'],
            [Them, 'Nearly ready. I have paper, rollers, and a few sample designs.'],
            [Me, 'Should visitors bring anything?'],
            [
                Them,
                'Just an idea to sketch. We will keep the demonstration simple and give everyone time to try it.',
            ],
            [Me, 'Sounds great for beginners.'],
            [Them, 'Exactly. I will bring the materials to Northstar on Sunday.'],
        ]),
        conversation(DEMO_CONTACTS.Northstar, '2026-10-03T14:00:00.000Z', [
            [Them, 'Your fictional open studio reservation is confirmed for Sunday at 2 PM.'],
            [Me, 'Thank you. Is the workshop in the main room?'],
            [Them, 'Yes. Follow the welcome signs when you arrive.'],
            [Me, 'Can I bring a friend?'],
            [Them, 'Absolutely. The demo event has plenty of space.'],
            [Me, 'See you there!'],
        ]),
    ];
}

/** The canonical device contract holds one active conversation and a list of summaries. */
export function createDemoMessages(
    conversations: DemoConversation[],
    selectedId = 'demo-thread',
): SimulatorMessagesApp {
    const selected = conversations.find((item) => item.id === selectedId);
    return {
        threads: conversations.map((item) => ({
            id: item.id,
            contact_name: item.name,
            contact_number: item.number,
            snippet: item.messages.at(-1)?.text ?? '',
            last_at: item.messages.at(-1)?.timestamp,
            unread: item.unread,
        })),
        thread_detail: selected
            ? {
                  id: selected.id,
                  sender_display_name: selected.name,
                  sender_number: selected.number,
                  messages: selected.messages,
                  last_at: selected.messages.at(-1)?.timestamp,
                  unread: selected.unread,
              }
            : null,
    };
}
