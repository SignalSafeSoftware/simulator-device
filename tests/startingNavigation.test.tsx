import { act, renderHook, waitFor, render, fireEvent } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import {
    emptySimulatorStore,
    secretSchema,
    photoSchema,
} from '@signalsafe/simulator-core/apps/contracts';
import type { DeviceCollection, DeviceRecords } from '@signalsafe/simulator-core/apps/deviceData';
import type { DeviceStore } from '@signalsafe/simulator-core/apps/store';
import { useSimulatorStartingNavigation } from '../src/apps/useSimulatorStartingNavigation';
import { useSimulatorPhoneDeviceContactHost } from '../src/phone/useSimulatorPhoneDeviceContactHost';
import { SimulatorDeviceMailbox } from '../src/apps/SimulatorDeviceMailbox';
import { SimulatorDeviceApps } from '../src/apps/SimulatorDeviceApps';
import {
    BROWSER_ACTION_TYPE,
    BROWSER_ACTION_VERSION,
} from '@signalsafe/simulator-core/apps/browserProtocol';
import { buildState } from './support/sessionFixtures';
const instant = '2026-11-11T12:00:00Z';
const secret = secretSchema.parse({
    id: 'secret',
    title: 'Example',
    value: 'fictional',
    username: '',
    site: '',
    notes: '',
    createdAt: instant,
    updatedAt: instant,
});
const photo = photoSchema.parse({
    id: 'photo',
    title: 'Example',
    caption: '',
    original: { capturedAt: '', timeZone: '', latitude: null, longitude: null },
    asset: { name: 'Example', mime: 'image/png', data: 'data:image/png;base64,AA==' },
    metadata: { capturedAt: '', timeZone: '', latitude: null, longitude: null },
    createdAt: instant,
    updatedAt: instant,
});
function store(found = true): DeviceStore {
    const records: { [K in DeviceCollection]: DeviceRecords[K][] } = {
        mail: [],
        secrets: found ? [secret] : [],
        photos: found ? [photo] : [],
    };
    return {
        data: emptySimulatorStore(),
        error: '',
        busy: false,
        reload: async () => {},
        get: async (collection, id) => records[collection].find((item) => item.id === id) ?? null,
        page: async () => ({ records: [], total: 0, revision: 0 }),
        save: async () => true,
        put: async () => true,
        remove: async () => true,
        folder: async () => true,
        restore: async () => true,
        exportBackup: async () => emptySimulatorStore(),
    };
}
it('loads record-based starting targets and returns to Home through the shared navigation owner', async () => {
    const dispatch = vi.fn();
    const changed = vi.fn();
    const data = store();
    const vault = renderHook(() =>
        useSimulatorStartingNavigation(
            data,
            { kind: 'vault-entry', id: 'secret' },
            undefined,
            changed,
            dispatch,
        ),
    );
    expect(vault.result.current.page).toBe('vault');
    await waitFor(() =>
        expect(vault.result.current.initialVaultNavigation?.secret).toEqual(secret),
    );
    act(() => vault.result.current.home());
    expect(changed).toHaveBeenCalledWith(null);
    expect(dispatch).toHaveBeenCalledWith({ type: 'SWITCH_APP', app: 'home' });
    const photos = renderHook(() =>
        useSimulatorStartingNavigation(
            data,
            { kind: 'photo', id: 'photo' },
            undefined,
            undefined,
            dispatch,
        ),
    );
    expect(photos.result.current.page).toBe('photos');
    await waitFor(() => expect(photos.result.current.initialPhotoNavigation?.photo).toEqual(photo));
    act(() => photos.result.current.setPage(null));
    expect(photos.result.current.page).toBeNull();
    const missing = renderHook(() =>
        useSimulatorStartingNavigation(
            store(false),
            { kind: 'vault-entry', id: 'missing' },
            null,
            undefined,
            dispatch,
        ),
    );
    expect(missing.result.current.initialVaultNavigation).toBeUndefined();
    const folder = renderHook(() =>
        useSimulatorStartingNavigation(
            data,
            { kind: 'vault-folder', folder: 'Examples' },
            undefined,
            undefined,
            dispatch,
        ),
    );
    expect(folder.result.current.initialVaultNavigation).toEqual({
        revision: 0,
        folder: 'Examples',
    });
});
it('opens an authored contact starting target without requiring a preceding row click', () => {
    const state = buildState({
        activeApp: 'phone',
        phone: { screen: 'contacts', stack: [], chosenIndex: null },
    });
    state.payload.entryPoint = {
        app: 'phone',
        screen: 'contacts',
        target: { kind: 'contact', id: 'example' },
    };
    state.payload.contacts = [{ id: 'example', displayName: 'Example', number: '+12025550110' }];
    const hook = renderHook(() => useSimulatorPhoneDeviceContactHost(state, true));
    expect(hook.result.current.contact?.id).toBe('example');
});
it.each([
    undefined,
    { kind: 'contact', id: 'other' } as const,
    { kind: 'email', id: 'message' } as const,
])(
    'handles email detail with target %j without selecting another kind of record',
    async (target) => {
        const view = render(
            <SimulatorDeviceMailbox
                store={store(false)}
                onBack={() => {}}
                screen='detail'
                target={target}
            />,
        );
        expect(view.getByRole('heading', { name: 'Email' })).toBeTruthy();
        await waitFor(() => expect(view.queryByText('Loading…')).toBeNull());
    },
);
it('lets an explicit email selection override its authored starting target', () => {
    const get = vi.fn(async () => null);
    const data = { ...store(false), get };
    render(
        <SimulatorDeviceMailbox
            store={data}
            onBack={() => {}}
            screen='detail'
            selectedEmailId='selected'
            target={{ kind: 'email', id: 'authored' }}
        />,
    );
    expect(get).toHaveBeenCalledWith('mail', 'selected');
});

it('preserves authored browser navigation and action forwarding through device composition', () => {
    const state = buildState({ activeApp: 'internet', internet: { screen: 'one', stack: [] } });
    state.payload.browser = {
        defaultPageId: 'one',
        pages: [
            {
                id: 'one',
                url: 'https://example.test/one',
                title: 'First',
                layout: 'content',
                buttons: [{ label: 'Second', href: 'https://example.test/two' }],
            },
            { id: 'two', url: 'https://example.test/two', title: 'Second', layout: 'content' },
        ],
    };
    const dispatch = vi.fn();
    const view = render(
        <SimulatorDeviceApps
            store={store()}
            state={state}
            dispatch={dispatch}
            unlocked
            onUnlock={() => {}}
            onLock={() => {}}
            openSettings={() => {}}
        >
            Host
        </SimulatorDeviceApps>,
    );
    const frame = view.getByTitle('First');
    if (!(frame instanceof HTMLIFrameElement)) throw new Error('Missing sandbox');
    const session = /"session":"([^"]+)"/.exec(frame.getAttribute('srcdoc') ?? '')?.[1];
    act(() =>
        window.dispatchEvent(
            new MessageEvent('message', {
                origin: 'null',
                source: frame.contentWindow,
                data: {
                    type: BROWSER_ACTION_TYPE,
                    version: BROWSER_ACTION_VERSION,
                    pageId: 'one',
                    session,
                    action: 'scenario-button:0',
                    event: 'click',
                    values: {},
                },
            }),
        ),
    );
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'SIMULATOR_ACTION' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'NAV_LOCAL', app: 'internet', screen: 'two' });
    const address = view.getByRole('searchbox', { name: 'Search or enter address' });
    fireEvent.change(address, { target: { value: 'https://example.test/one' } });
    const form = address.closest('form');
    if (!form) throw new Error('Missing address form');
    fireEvent.submit(form);
});
