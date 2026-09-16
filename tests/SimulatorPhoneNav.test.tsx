import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import type { SimulatorSessionState, SimulatorViewState } from '@signalsafe/simulator-react';
import { switchChannelAction } from '@signalsafe/simulator-react';
import SimulatorPhoneNav from '../src/SimulatorPhoneNav.js';

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

describe('SimulatorPhoneNav', () => {
    it('renders buttons with active state on the current primary channel', () => {
        const dispatch = vi.fn();
        const { getByRole } = render(<SimulatorPhoneNav state={buildState()} dispatch={dispatch} />);

        expect(getByRole('button', { name: 'Home' }).getAttribute('aria-current')).toBe('page');
        expect(getByRole('button', { name: 'Email' }).getAttribute('aria-current')).toBeNull();
    });

    it('clicking a nav button dispatches the expected simulator action', () => {
        const dispatch = vi.fn();
        const { getByRole } = render(<SimulatorPhoneNav state={buildState()} dispatch={dispatch} />);

        fireEvent.click(getByRole('button', { name: 'Email' }));
        expect(dispatch).toHaveBeenCalledWith(switchChannelAction('email'));
    });

    it('renders email tertiary actions and dispatches Back', () => {
        const dispatch = vi.fn();
        const { queryByTestId, getByRole, queryByRole } = render(
            <SimulatorPhoneNav
                state={buildState({
                    activeApp: 'email',
                    showPrimaryMenu: false,
                    email: { screen: 'detail', stack: ['list'], selectedMessageId: 'm1' },
                })}
                dispatch={dispatch}
            />,
        );

        expect(queryByTestId('simulator-device-nav')?.getAttribute('data-nav-mode')).toBe('tertiary');
        expect(queryByRole('button', { name: 'Cancel' })).toBeNull();
        fireEvent.click(getByRole('button', { name: 'Reply' }));
        expect(dispatch).toHaveBeenLastCalledWith({ type: 'SIMULATOR_ACTION', action: { type: 'send_reply' } });
        fireEvent.click(getByRole('button', { name: 'Back' }));
        expect(dispatch).toHaveBeenLastCalledWith({ type: 'BACK' });
    });
});

it('uses provider menu labels without changing navigation actions', async () => {
    const { SimulatorLocaleProvider } = await import('@signalsafe/simulator-react');
    const dispatch = vi.fn();
    const { getByRole } = render(
        <SimulatorLocaleProvider messages={{ 'nav.phone': 'Calls and contacts', 'nav.simulatorChannels': 'Choose an app' }}>
            <SimulatorPhoneNav state={buildState()} dispatch={dispatch} />
        </SimulatorLocaleProvider>,
    );
    expect(getByRole('navigation', { name: 'Choose an app' })).toBeTruthy();
    fireEvent.click(getByRole('button', { name: 'Calls and contacts' }));
    expect(dispatch).toHaveBeenCalledWith(switchChannelAction('contacts'));
});
