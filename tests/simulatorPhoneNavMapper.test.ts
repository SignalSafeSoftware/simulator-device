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
        ).toBe(true);

        expect(
            shouldHideHostPhoneNav(
                buildState({
                    activeApp: 'email',
                    email: { screen: 'detail', stack: ['list'], selectedMessageId: 'm1' },
                }),
            ),
        ).toBe(true);
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
