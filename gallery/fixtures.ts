import { emptySimulatorStore, emptyMetadata } from '@signalsafe/simulator-core/apps/contracts';
import { newMail } from '@signalsafe/simulator-core/apps/mail';
import { summarizeDevice } from '@signalsafe/simulator-core/apps/deviceData';
import type { DeviceStore } from '@signalsafe/simulator-core/apps/store';
import type { DeviceCollection, DeviceRecords } from '@signalsafe/simulator-core/apps/deviceData';
import { getInitialSessionState } from '@signalsafe/simulator-react/state/simulatorSessionInitialState';
import type { SimulatorSessionState } from '@signalsafe/simulator-react/types/session';
export type GalleryState = 'populated' | 'empty' | 'loading' | 'disabled' | 'error';
export function fixture(mode: GalleryState) {
    const empty = mode === 'empty' || mode === 'loading';
    const payload: SimulatorSessionState['payload'] = {
        templateKey: 'synthetic-gallery',
        name: 'Synthetic UI gallery',
        channel: 'phone',
        templateId: null,
        runId: null,
        attemptId: null,
        topicTags: [],
        entryPoint: { app: 'phone', screen: 'dial' },
        device: null,
        browser: {
            defaultPageId: 'landing',
            pages: [
                {
                    id: 'landing',
                    url: 'https://example.test',
                    title: 'Synthetic browser',
                    layout: 'content',
                    content: 'A preview page. No external website is contacted.',
                },
            ],
        },
        directory: [
            {
                id: 'support',
                label: 'Synthetic support',
                number: '+12025550199',
                description: 'Preview directory entry',
            },
        ],
        home: {
            widgets: [],
            featuredApps: [{ id: 'synthetic-app', name: 'Synthetic app' }],
            settingsSections: [{ id: 'privacy', title: 'Privacy' }],
        },
        contacts: empty
            ? []
            : [
                  {
                      id: 'synthetic-contact',
                      displayName: 'Taylor Example',
                      number: '+12025550123',
                      phoneNumbers: [
                          { label: 'Mobile', value: '+12025550123', number: '+12025550123' },
                          { label: 'Work', value: '+442083661177', number: '+442083661177' },
                      ],
                      emailAddresses: [{ label: 'Work', value: 'taylor@example.test' }],
                      postalAddresses: [
                          { label: 'Home', value: '10 Example Street\nExample City' },
                      ],
                  },
              ],
        phone: empty
            ? null
            : {
                  content: {
                      caller_name: 'Taylor Example',
                      phone_number: '+12025550123',
                      transcript: 'Synthetic call',
                      choices: [],
                  },
                  chosenIndex: null,
                  voicemailTranscript: 'Synthetic voicemail transcript.',
                  voicemailCallerName: 'Taylor Example',
                  callHistory: empty
                      ? []
                      : [
                            {
                                id: 'call-1',
                                name: 'Taylor Example',
                                number: '+12025550123',
                                numberLabel: 'Mobile',
                                kind: 'incoming',
                                timestamp: 'Sep 16, 2026',
                                durationSeconds: 0,
                            },
                            {
                                id: 'call-2',
                                number: '+442083661177',
                                kind: 'missed',
                                timestamp: 'Sep 15, 2026',
                            },
                        ],
              },
        email: {
            inbox: empty
                ? []
                : [
                      {
                          id: 'email-1',
                          from: 'taylor@example.test',
                          subject: 'Synthetic preview',
                          snippet: 'No external email is sent.',
                      },
                  ],
            selectedMessage: empty
                ? null
                : {
                      from: 'taylor@example.test',
                      subject: 'Synthetic preview',
                      body: 'No external email is sent.',
                  },
            selectedMessageId: empty ? null : 'email-1',
        },
        sms: {
            thread: {
                sender_number: '+12025550123',
                messages: empty
                    ? []
                    : [
                          {
                              from: 'them',
                              text: 'Synthetic message. No external service is connected.',
                          },
                      ],
            },
            visibleMessageCount: 1,
            loadingMessage: mode === 'loading' ? 'Loading synthetic messages…' : undefined,
        },
    };
    return getInitialSessionState(payload);
}

/** Read-only synthetic records exercise device pages without browser storage or host APIs. */
export function createGalleryStore(mode: GalleryState): DeviceStore {
    const data = emptySimulatorStore();
    data.lock = { salt: 'a'.repeat(32), digest: 'b'.repeat(64) };
    const stamp = '2026-10-02T12:00:00.000Z';
    const records: { [K in DeviceCollection]: DeviceRecords[K][] } = {
        photos: [
            {
                id: 'gallery-photo',
                title: 'Synthetic photo',
                caption: 'Synthetic gallery image',
                asset: {
                    name: 'pixel.png',
                    mime: 'image/png',
                    data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1sAAAAASUVORK5CYII=',
                },
                metadata: emptyMetadata,
                original: emptyMetadata,
                createdAt: stamp,
                updatedAt: stamp,
            },
        ],
        secrets: [
            {
                id: 'gallery-note',
                title: 'Synthetic note',
                type: 'note',
                folder: 'Unfiled',
                username: '',
                value: 'Preview content only',
                site: '',
                notes: '',
                createdAt: stamp,
                updatedAt: stamp,
            },
        ],
        mail: [
            {
                ...newMail('gallery@example.test'),
                id: 'gallery-mail',
                threadId: 'gallery-thread',
                folder: 'inbox',
                from: 'sender@example.test',
                to: 'gallery@example.test',
                subject: 'Synthetic email',
                body: 'Preview content only.',
                createdAt: stamp,
                updatedAt: stamp,
            },
        ],
    };
    if (mode === 'empty' || mode === 'loading') {
        records.photos = [];
        records.secrets = [];
        records.mail = [];
    }
    const snapshot = { ...data, ...records };
    const summary = summarizeDevice(snapshot);
    return {
        data: summary.metadata,
        counts: summary.counts,
        error: '',
        busy: mode === 'disabled',
        reload: () => Promise.resolve(),
        get: (collection, id) =>
            Promise.resolve(records[collection].find((item) => item.id === id) ?? null),
        page: async (collection, query) => {
            if (mode === 'error')
                throw new Error('Synthetic page load failed. Retry is available.');
            if (mode === 'loading') return new Promise(() => {});
            const matching = records[collection].filter(
                (item) =>
                    (!query.folder || ('folder' in item && item.folder === query.folder)) &&
                    (!query.threadId || ('threadId' in item && item.threadId === query.threadId)) &&
                    (!query.search ||
                        JSON.stringify(item).toLowerCase().includes(query.search.toLowerCase())),
            );
            const offset = query.offset ?? 0;
            return {
                records: matching.slice(offset, offset + (query.limit ?? 20)),
                total: matching.length,
                revision: data.revision,
            };
        },
        save: () => Promise.resolve(false),
        put: () => Promise.resolve(false),
        remove: () => Promise.resolve(false),
        folder: () => Promise.resolve(false),
        restore: () => Promise.resolve(false),
        exportBackup: () => Promise.resolve(snapshot),
    };
}
