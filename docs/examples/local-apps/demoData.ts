import {
    emptySimulatorStore,
    type SimulatorStore,
} from '@signalsafe/simulator-core/apps/contracts';
import { SimulatorApp } from '@signalsafe/simulator-core/simulatorApp';
import {
    SimulatorHomeScreenId,
    type SimulatorDevicePayload,
} from '@signalsafe/simulator-core/devicePayload';
import { createDemoContacts } from './demoContacts';
import { createDemoPhone } from './demoPhone';
import { createDemoConversations, createDemoMessages } from './demoMessages';
import { createDemoMail } from './demoMail';
import { createDemoPhotos } from './demoPhotos';
import { createDemoSecrets, createDemoVaultFolders } from './demoVault';

/** Fictional host data; the packages own every screen and navigation control. */
export function createDemoDevice(): SimulatorDevicePayload {
    return {
        entry_point: { app: SimulatorApp.Home, screen: SimulatorHomeScreenId.Home },
        contacts: createDemoContacts(),
        phone: createDemoPhone(),
        messages: createDemoMessages(createDemoConversations()),
        internet: {
            pages: [
                {
                    id: 'welcome',
                    url: 'https://welcome.example.test',
                    title: 'Demo welcome page',
                    layout: 'content',
                    content:
                        'This is a simulated website. Use the browser controls to explore this fictional page.',
                },
            ],
        },
        home: {},
    };
}

/** A fresh copy per session; no saved device data or browser persistence is read. */
export function createDemoStore(): SimulatorStore {
    const store = emptySimulatorStore();
    store.secrets = createDemoSecrets();
    store.vaultFolders = createDemoVaultFolders();
    store.photos = createDemoPhotos();
    store.mail = createDemoMail(store.identity);
    return store;
}
