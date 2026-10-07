import type { SimulatorPhoneApp } from '@signalsafe/simulator-core/devicePayload';
import { DEMO_CONTACTS } from './demoContacts';

/** Fictional call history with repeat callers and known, zero and unavailable durations. */
export function createDemoPhone(): SimulatorPhoneApp {
    const { Taylor, Morgan, Avery, Jordan, Casey, Northstar } = DEMO_CONTACTS;
    return {
        contacts: Object.values(DEMO_CONTACTS).map((contact) => contact.id),
        history: [
            {
                id: 'demo-call',
                name: Taylor.name,
                number: Taylor.number,
                direction: 'in',
                timestamp: '2026-10-05T12:00:00.000Z',
                duration_seconds: 184,
            },
            {
                id: 'demo-call-morgan-return',
                name: Morgan.name,
                number: Morgan.number,
                direction: 'out',
                timestamp: '2026-10-05T11:20:00.000Z',
                duration_seconds: 312,
            },
            {
                id: 'demo-call-avery-missed',
                name: Avery.name,
                number: Avery.number,
                direction: 'missed',
                timestamp: '2026-10-05T10:10:00.000Z',
                duration_seconds: 0,
            },
            {
                id: 'demo-call-northstar',
                name: Northstar.name,
                number: Northstar.number,
                direction: 'in',
                timestamp: '2026-10-04T18:05:00.000Z',
                duration_seconds: 95,
            },
            {
                id: 'demo-call-taylor-out',
                name: Taylor.name,
                number: Taylor.number,
                direction: 'out',
                timestamp: '2026-10-04T16:40:00.000Z',
                duration_seconds: 427,
            },
            {
                id: 'demo-call-casey-missed',
                name: Casey.name,
                number: Casey.number,
                direction: 'missed',
                timestamp: '2026-10-04T09:15:00.000Z',
            },
            {
                id: 'demo-call-jordan-out',
                name: Jordan.name,
                number: Jordan.number,
                direction: 'out',
                timestamp: '2026-10-03T20:15:00.000Z',
                duration_seconds: 61,
            },
            {
                id: 'demo-call-morgan-in',
                name: Morgan.name,
                number: Morgan.number,
                direction: 'in',
                timestamp: '2026-10-03T14:10:00.000Z',
                duration_seconds: 205,
            },
            {
                id: 'demo-call-taylor-missed',
                name: Taylor.name,
                number: Taylor.number,
                direction: 'missed',
                timestamp: '2026-10-02T21:50:00.000Z',
                duration_seconds: 0,
            },
            {
                id: 'demo-call-morgan-voicemail',
                name: Morgan.name,
                number: Morgan.number,
                direction: 'voicemail',
                timestamp: '2026-10-02T17:35:00.000Z',
            },
        ],
        incoming_call: {
            caller_name: Taylor.name,
            phone_number: Taylor.number,
            caller_title: 'Weekend plans',
            transcript:
                'Hi! I found a trail for our Saturday walk. Morgan can meet us by the park entrance at ten. I will send the route in a message so we can plan together.',
        },
        voicemail: {
            caller_name: Morgan.name,
            timestamp: '2026-10-02T17:35:00.000Z',
            transcript:
                'Hey, it is Morgan. The Northstar open studio starts at two on Sunday, and Casey is bringing the project sketches. Call me back when you have a moment so we can arrange a time to meet.',
        },
    };
}
