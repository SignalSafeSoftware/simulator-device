import { describe, expect, it, vi } from 'vitest';
import type { SimulatorSessionState, SimulatorViewState } from '@signalsafe/simulator-react';
import { switchChannelAction } from '@signalsafe/simulator-react';
import {
    dispatchSimulatorPhoneNavItem,
    resolveSimulatorPhoneNav,
    shouldHideHostPhoneNav,
    SIMULATOR_PRIMARY_NAV_ITEMS,
} from '../src/simulatorPhoneNavMapper.js';

function buildView(overrides: Partial<SimulatorViewState> = {}): SimulatorViewState {
    return {
        activeApp: 'home',
        showPrimaryMenu: true,
        phone: { screen: 'history', stack: [], chosenIndex: null },
        email: { screen: 'list', stack: [], selectedMessageId: null },
        messages: { screen: 'threads', stack: [], visibleCount: 0 },
        internet: { screen: 'landing', stack: [] },
        home: { screen: 'home' },
        contactsPanelOpen: false,
        contactsSearchQuery: '',
        actionHistory: [],
        ...overrides,
    };
}

function buildState(view: Partial<SimulatorViewState> = {}): SimulatorSessionState {
    return {
        payload: {
            templateKey: 'test',
            name: 'Test',
            channel: 'home',
            templateId: null,
            runId: null,
            attemptId: null,
            topicTags: [],
            entryPoint: { app: 'home', screen: 'home' },
            device: null,
            email: null,
            sms: null,
            browser: null,
            phone: null,
            contacts: null,
            directory: null,
            home: null,
        },
        view: buildView(view),
    };
}

describe('resolveSimulatorPhoneNav', () => {
    it('returns primary nav for home-level screens', () => {
        const model = resolveSimulatorPhoneNav(buildState({ activeApp: 'home', showPrimaryMenu: true }));

        expect(model.mode).toBe('primary');
        if (model.mode !== 'primary') {
            return;
        }

        expect(model.activeChannel).toBe('home');
        expect(model.items.map((item) => item.label)).toEqual(
            SIMULATOR_PRIMARY_NAV_ITEMS.map((item) => item.label),
        );
    });

    it('returns phone secondary nav for phone screens', () => {
        const model = resolveSimulatorPhoneNav(
            buildState({
                activeApp: 'phone',
                showPrimaryMenu: false,
                phone: { screen: 'history', stack: [], chosenIndex: null },
            }),
        );

        expect(model.mode).toBe('secondary');
        if (model.mode !== 'secondary') {
            return;
        }

        expect(model.app).toBe('phone');
        expect(model.activeId).toBe('history');
        expect(model.items.map((item) => item.label)).toEqual(['History', 'Contacts', 'Dial', 'Back']);
    });

    it('returns email secondary nav for email screens', () => {
        const model = resolveSimulatorPhoneNav(
            buildState({
                activeApp: 'email',
                showPrimaryMenu: false,
                email: { screen: 'list', stack: [], selectedMessageId: null },
            }),
        );

        expect(model.mode).toBe('secondary');
        if (model.mode !== 'secondary') {
            return;
        }

        expect(model.app).toBe('email');
        expect(model.activeId).toBe('list');
        expect(model.items.map((item) => item.label)).toEqual(['Inbox', 'Outbox', 'Trash', 'Back']);
    });
});

describe('shouldHideHostPhoneNav', () => {
    it('hides nav on detail screens where appropriate', () => {
        expect(
            shouldHideHostPhoneNav(
                buildState({
                    activeApp: 'messages',
                    messages: { screen: 'thread_detail', stack: [], visibleCount: 0 },
                }),
            ),
        ).toBe(false);

        expect(
            shouldHideHostPhoneNav(
                buildState({
                    activeApp: 'email',
                    email: { screen: 'detail', stack: ['list'], selectedMessageId: 'm1' },
                }),
            ),
        ).toBe(false);
    });
});

describe('dispatchSimulatorPhoneNavItem', () => {
    it('dispatches switchChannelAction for primary Email tab', () => {
        const dispatch = vi.fn();
        const model = resolveSimulatorPhoneNav(buildState());
        if (model.mode !== 'primary') {
            throw new Error('expected primary nav');
        }

        const emailItem = model.items.find((item) => item.label === 'Email');
        expect(emailItem).toBeDefined();
        dispatchSimulatorPhoneNavItem(dispatch, model, emailItem!);

        expect(dispatch).toHaveBeenCalledWith(switchChannelAction('email'));
    });

    it('dispatches NAV_LOCAL for secondary outbox tab', () => {
        const dispatch = vi.fn();
        const model = resolveSimulatorPhoneNav(
            buildState({ activeApp: 'email', showPrimaryMenu: false }),
        );
        if (model.mode !== 'secondary') {
            throw new Error('expected secondary nav');
        }

        const outbox = model.items.find((item) => item.id === 'outbox')!;
        dispatchSimulatorPhoneNavItem(dispatch, model, outbox);
        expect(dispatch).toHaveBeenCalledWith({ type: 'NAV_LOCAL', app: 'email', screen: 'outbox' });
    });
});

it('uses Send and Back for email compose, with sending unavailable', () => {
    const model = resolveSimulatorPhoneNav(buildState({ activeApp: 'email', showPrimaryMenu: false, email: { screen: 'compose', stack: ['list'], selectedMessageId: null } }));
    expect(model.mode).toBe('tertiary');
    if (model.mode !== 'tertiary') throw new Error('Expected compose menu');
    expect(model.items.map(item => item.label)).toEqual(['Send', 'Back']);
    expect(model.items[0]?.disabled).toBe(true);
});

it.each(['add_contact', 'directory', 'incoming_call', 'voicemail'] as const)('maps the %s phone screen to its parent tab', (screen) => {
    expect(resolveSimulatorPhoneNav(buildState({ activeApp: 'phone', showPrimaryMenu: false, phone: { screen, stack: [], chosenIndex: null } }))).toMatchObject({
        mode: 'secondary', activeId: ['add_contact', 'directory'].includes(screen) ? 'contacts' : 'history',
    });
});

it.each(['outbox', 'trash'] as const)('selects the %s email tab', (screen) => {
    expect(resolveSimulatorPhoneNav(buildState({ activeApp: 'email', showPrimaryMenu: false, email: { screen, stack: [], selectedMessageId: null } }))).toMatchObject({ mode: 'secondary', activeId: screen });
});

it('hides navigation when no app is selected', () => {
    const state = buildState({ activeApp: null });
    expect(shouldHideHostPhoneNav(state)).toBe(true);
    expect(resolveSimulatorPhoneNav(state)).toEqual({ mode: 'hidden' });
});

it('uses the internet primary menu', () => {
    expect(resolveSimulatorPhoneNav(buildState({ activeApp: 'internet' }))).toMatchObject({ mode: 'primary', activeChannel: 'browser' });
});

it.each(['thread_detail', 'new_thread'] as const)('provides message actions for %s', screen => {
    expect(resolveSimulatorPhoneNav(buildState({ activeApp: 'messages', messages: { screen, stack: [], visibleCount: 0 } }))).toMatchObject({ mode: 'secondary', app: 'messages', items: [{ id: 'send', disabled: screen === 'new_thread' }, { id: 'back' }] });
});

it('ignores a local action outside the secondary menu', () => {
    const dispatch = vi.fn();
    dispatchSimulatorPhoneNavItem(dispatch, { mode: 'primary', activeChannel: 'home', items: [] }, { id: 'settings', label: 'Settings', action: 'local' });
    expect(dispatch).not.toHaveBeenCalled();
});

it('defensively hides navigation for missing or unknown runtime view data', () => {
    const missing = Object.assign(buildState(), { view: null });
    expect(shouldHideHostPhoneNav(missing)).toBe(true);
    expect(resolveSimulatorPhoneNav(missing)).toEqual({ mode: 'hidden' });
    const unknown = buildState();
    Object.assign(unknown.view, { activeApp: 'future-app' });
    expect(resolveSimulatorPhoneNav(unknown)).toEqual({ mode: 'hidden' });
    for (const app of ['phone', 'email', 'messages', 'internet', 'home'] as const) {
        const state = buildState({ activeApp: app });
        Object.assign(state.view, { [app]: undefined });
        expect(resolveSimulatorPhoneNav(state)).toEqual({ mode: 'hidden' });
    }
});

it.each([{ stack: [] }, { stack: ['outbox'] }])('falls back to the email stack for an unknown screen: %j', ({ stack }) => {
    const state = buildState({ activeApp: 'email', showPrimaryMenu: false });
    Object.assign(state.view.email, { screen: 'future-screen', stack });
    expect(resolveSimulatorPhoneNav(state)).toMatchObject({ mode: 'secondary', activeId: stack.at(-1) ?? 'list' });
});
