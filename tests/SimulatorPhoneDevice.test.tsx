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
