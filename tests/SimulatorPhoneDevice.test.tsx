import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, within } from '@testing-library/react';
import { getInitialSessionState } from '@signalsafe/simulator-react';
import SimulatorPhoneDevice from '../src/SimulatorPhoneDevice.js';
import {
    SIMULATOR_DEVICE_SCREEN_CLASS_NAMES,
    renderPhoneIncomingCallHistoryExtra,
} from '../src/index.js';
import { buildContactsScreenState, TEST_CONTACTS } from './support/contactFixtures.js';
import { buildIncomingCallState } from './support/incomingCallFixtures.js';

function minimalPhonePayload() {
    return getInitialSessionState({
        templateKey: 'fixture-minimal-phone',
        name: 'Minimal Phone World',
        channel: 'phone',
        templateId: null,
        runId: null,
        attemptId: null,
        topicTags: [],
        entryPoint: { app: 'phone', screen: 'incoming_call' },
        device: {
            mainMenuItems: [
                { id: 'phone', label: 'Phone' },
                { id: 'contacts', label: 'Contacts' },
            ],
            secondaryDefaults: {},
        },
        email: null,
        sms: null,
        browser: null,
        phone: {
            content: {
                transcript: 'Incoming call.',
                choices: [],
                caller_name: 'Alice Chen',
                phone_number: '+1 (555) 100-2000',
            },
            chosenIndex: null,
            callHistory: [],
        },
        contacts: TEST_CONTACTS,
        directory: null,
        home: null,
    }).payload;
}

function clickContactRow(container: HTMLElement, displayName: string): void {
    const row = within(container).getByRole('button', { name: new RegExp(displayName) });
    fireEvent.click(row);
}

describe('SimulatorPhoneDevice', () => {
    it('renders SimulatorPhoneShell and SimulatorPhoneNav', () => {
        const state = buildContactsScreenState();
        const dispatch = vi.fn();

        const { getByTestId } = render(
            <SimulatorPhoneDevice state={state} dispatch={dispatch} />,
        );

        expect(getByTestId('simulator-device-shell')).toBeTruthy();
        expect(getByTestId('simulator-device-nav')).toBeTruthy();
    });

    it('renders SimulatorWithSession runtime content by default', () => {
        const state = buildContactsScreenState();
        const dispatch = vi.fn();

        const { container } = render(
            <SimulatorPhoneDevice state={state} dispatch={dispatch} />,
        );

        expect(container.querySelector('[data-simulator-app]')).toBeTruthy();
        expect(within(container).getByText('IT Helpdesk')).toBeTruthy();
    });

    it('wires renderPhoneIncomingCallHistoryExtra as the default incoming-call history slot', () => {
        const state = buildIncomingCallState({
            callHistory: [
                {
                    id: 'ph1',
                    number: '+1-555-100-2000',
                    name: 'Alice Chen',
                    kind: 'incoming',
                    timestamp: 'Today 9:15 AM',
                    duration: '0:32',
                },
            ],
        });
        const dispatch = vi.fn();

        const { getByText } = render(
            <SimulatorPhoneDevice state={state} dispatch={dispatch} />,
        );

        expect(getByText('Previous calls')).toBeTruthy();
        expect(getByText('Today 9:15 AM')).toBeTruthy();
    });

    it('allows overriding renderIncomingCallExtra', () => {
        const state = buildIncomingCallState();
        const dispatch = vi.fn();
        const customExtra = vi.fn(() => <div data-testid="custom-incoming-extra">Custom</div>);

        const { getByTestId } = render(
            <SimulatorPhoneDevice
                state={state}
                dispatch={dispatch}
                renderIncomingCallExtra={customExtra}
            />,
        );

        expect(customExtra).toHaveBeenCalled();
        expect(getByTestId('custom-incoming-extra')).toBeTruthy();
    });

    it('without renderContactDetail, package/default contact detail behavior remains active', () => {
        const state = buildContactsScreenState();
        const dispatch = vi.fn();

        const { container } = render(
            <SimulatorPhoneDevice state={state} dispatch={dispatch} />,
        );

        clickContactRow(container, 'IT Helpdesk');

        expect(container.querySelector('.simulator-phone__contact-detail')).toBeTruthy();
    });

    it('with renderContactDetail, clicking a contact row renders custom contact detail content', () => {
        const state = buildContactsScreenState();
        const dispatch = vi.fn();

        const { container, getByTestId } = render(
            <SimulatorPhoneDevice
                state={state}
                dispatch={dispatch}
                renderContactDetail={({ contact, onBack }) => (
                    <div data-testid="host-contact-detail">
                        <span>{contact.displayName}</span>
                        <button type="button" onClick={onBack}>
                            Back
                        </button>
                    </div>
                )}
            />,
        );

        clickContactRow(container, 'HR');

        expect(getByTestId('host-contact-detail')).toBeTruthy();
        expect(within(getByTestId('host-contact-detail')).getByText('HR')).toBeTruthy();
    });

    it('with renderContactDetail, package .simulator-phone__contact-detail is not rendered', () => {
        const state = buildContactsScreenState();
        const dispatch = vi.fn();

        const { container } = render(
            <SimulatorPhoneDevice
                state={state}
                dispatch={dispatch}
                renderContactDetail={({ contact }) => (
                    <div data-testid="host-contact-detail">{contact.displayName}</div>
                )}
            />,
        );

        clickContactRow(container, 'HR');

        expect(container.querySelector('.simulator-phone__contact-detail')).toBeNull();
        expect(container.querySelector('[data-simulator-app]')).toBeNull();
    });

    it('secondary Back closes contact details without leaving Contacts', () => {
        const dispatch = vi.fn();
        const state = buildContactsScreenState();
        state.view.showPrimaryMenu = false;
        const { container, getAllByRole, queryByTestId } = render(
            <SimulatorPhoneDevice state={state} dispatch={dispatch} contactDetail={{ mode: 'read-only' }} />,
        );
        clickContactRow(container, 'IT Helpdesk');
        dispatch.mockClear();
        const back = getAllByRole('button', { name: 'Back', exact: true }).at(-1)!;
        fireEvent.click(back);
        expect(queryByTestId('simulator-phone-contact-detail')).toBeNull();
        expect(container.querySelector('[data-simulator-app]')).toBeTruthy();
        expect(dispatch).not.toHaveBeenCalled();
    });

    it('onBack clears selected contact and returns to runtime', () => {
        const state = buildContactsScreenState();
        const dispatch = vi.fn();

        const { container, getByRole, getByTestId } = render(
            <SimulatorPhoneDevice
                state={state}
                dispatch={dispatch}
                renderContactDetail={({ contact, onBack }) => (
                    <div data-testid="host-contact-detail">
                        <span>{contact.displayName}</span>
                        <button type="button" onClick={onBack}>
                            Back
                        </button>
                    </div>
                )}
            />,
        );

        clickContactRow(container, 'IT Helpdesk');
        expect(getByTestId('host-contact-detail')).toBeTruthy();

        fireEvent.click(getByRole('button', { name: 'Back' }));

        expect(container.querySelector('[data-testid="host-contact-detail"]')).toBeNull();
        expect(container.querySelector('[data-simulator-app]')).toBeTruthy();
    });

    it('screenClassNames include simulator-phone-shell--screen-phone-contact-detail while custom contact detail is active', () => {
        const state = buildContactsScreenState();
        const dispatch = vi.fn();

        const { container, getByTestId } = render(
            <SimulatorPhoneDevice
                state={state}
                dispatch={dispatch}
                renderContactDetail={({ contact }) => (
                    <div data-testid="host-contact-detail">{contact.displayName}</div>
                )}
            />,
        );

        clickContactRow(container, 'IT Helpdesk');

        expect(getByTestId('simulator-device-shell').className).toContain(
            SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.phoneContactDetail,
        );
        expect(getByTestId('simulator-device-shell').className).toContain(
            'simulator-phone-shell--screen-phone-contact-detail',
        );
    });

    it('appends optional screenClassNames and className escape hatches', () => {
        const state = buildContactsScreenState();
        const dispatch = vi.fn();

        const { getByTestId } = render(
            <SimulatorPhoneDevice
                state={state}
                dispatch={dispatch}
                className="host-simulator-root"
                screenClassNames={['host-simulator-root--preview']}
            />,
        );

        expect(getByTestId('simulator-device-shell').className).toContain('host-simulator-root--preview');
        expect(getByTestId('simulator-device-shell').closest('.host-simulator-root')).toBeTruthy();
    });

    it('exposes renderPhoneIncomingCallHistoryExtra for custom incoming-call slots', () => {
        expect(renderPhoneIncomingCallHistoryExtra).toBeTypeOf('function');
    });

    it('with contactDetail, clicking a contact row renders package contact detail form', () => {
        const state = buildContactsScreenState();
        const dispatch = vi.fn();

        const { container, getByTestId } = render(
            <SimulatorPhoneDevice
                state={state}
                dispatch={dispatch}
                contactDetail={{ mode: 'editable', onSave: vi.fn() }}
            />,
        );

        clickContactRow(container, 'IT Helpdesk');

        expect(getByTestId('simulator-phone-contact-detail')).toBeTruthy();
        expect(container.querySelector('.simulator-phone__contact-detail')).toBeNull();
    });

    it('renderContactDetail takes precedence over contactDetail', () => {
        const state = buildContactsScreenState();
        const dispatch = vi.fn();

        const { container, getByTestId, queryByTestId } = render(
            <SimulatorPhoneDevice
                state={state}
                dispatch={dispatch}
                contactDetail={{ mode: 'editable', onSave: vi.fn() }}
                renderContactDetail={({ contact }) => (
                    <div data-testid="host-contact-detail">{contact.displayName}</div>
                )}
            />,
        );

        clickContactRow(container, 'HR');

        expect(getByTestId('host-contact-detail')).toBeTruthy();
        expect(queryByTestId('simulator-phone-contact-detail')).toBeNull();
    });

    it('works with a minimal phone payload from simulator-react initial state', () => {
        const state = getInitialSessionState(minimalPhonePayload());
        state.view.activeApp = 'phone';
        state.view.phone.screen = 'history';
        state.view.showPrimaryMenu = true;
        const dispatch = vi.fn();

        const { getByTestId } = render(
            <SimulatorPhoneDevice state={state} dispatch={dispatch} />,
        );

        expect(getByTestId('simulator-device-shell')).toBeTruthy();
    });
});

it('passes the original contact context to package delete handlers', () => {
    const state = buildContactsScreenState();
    const dispatch = vi.fn();
    const onDelete = vi.fn();
    const { container, getByRole } = render(<SimulatorPhoneDevice state={state} dispatch={dispatch} contactDetail={{ mode: 'editable', onDelete }} />);
    clickContactRow(container, 'HR');
    fireEvent.click(getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ displayName: 'HR' }), { state, dispatch: expect.any(Function), originalContact: expect.objectContaining({ displayName: 'HR' }) });
});

it('closes host contact details when switching phone tabs', () => {
    const dispatch = vi.fn();
    const state = buildContactsScreenState();
    state.view.showPrimaryMenu = false;
    const { container, getByRole, queryByTestId } = render(<SimulatorPhoneDevice state={state} dispatch={dispatch} contactDetail={{}} />);
    clickContactRow(container, 'HR');
    fireEvent.click(getByRole('button', { name: 'History', exact: true }));
    expect(queryByTestId('simulator-phone-contact-detail')).toBeNull();
    expect(dispatch).toHaveBeenCalledWith({ type: 'NAV_LOCAL', app: 'phone', screen: 'history' });
});

it('hides navigation when there is no active app', () => {
    const state = buildContactsScreenState();
    state.view.activeApp = null;
    const view = render(<SimulatorPhoneDevice state={state} dispatch={vi.fn()} />);
    expect(view.queryByRole('navigation')).toBeNull();
});

it('returns focus to search when the previously selected contact is removed', () => {
    const state = buildContactsScreenState();
    const dispatch = vi.fn();
    const view = render(<SimulatorPhoneDevice state={state} dispatch={dispatch} contactDetail={{}} />);
    clickContactRow(view.container, 'HR');
    const changed = { ...state, payload: { ...state.payload, contacts: [] } };
    view.rerender(<SimulatorPhoneDevice state={changed} dispatch={dispatch} contactDetail={{}} />);
    expect(view.queryByTestId('simulator-phone-contact-detail')).toBeNull();
    expect(document.activeElement).toBe(view.getByRole('searchbox'));
});

it('closes details when the host changes the active phone screen', () => {
    const state = buildContactsScreenState();
    const dispatch = vi.fn();
    const view = render(<SimulatorPhoneDevice state={state} dispatch={dispatch} contactDetail={{}} />);
    clickContactRow(view.container, 'HR');
    view.rerender(<SimulatorPhoneDevice state={{ ...state, view: { ...state.view, phone: { ...state.view.phone, screen: 'dial' } } }} dispatch={dispatch} contactDetail={{}} />);
    expect(view.queryByTestId('simulator-phone-contact-detail')).toBeNull();
});
