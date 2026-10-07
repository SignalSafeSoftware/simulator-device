import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, within } from '@testing-library/react';
import { getInitialSessionState } from '@signalsafe/simulator-react/state/simulatorSessionInitialState';
import SimulatorPhoneDevice from '../src/phone/SimulatorPhoneDevice.js';
import { SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES } from '../src/phone/simulatorPhoneShellScreenMapper.js';
import { renderPhoneIncomingCallHistoryExtra } from '../src/incomingCall/renderPhoneIncomingCallHistoryExtra.js';
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

        const { getByTestId } = render(<SimulatorPhoneDevice state={state} dispatch={dispatch} />);

        expect(getByTestId('simulator-device-shell')).toBeInstanceOf(HTMLElement);
        expect(getByTestId('simulator-device-nav')).toBeInstanceOf(HTMLElement);
    });

    it('renders SimulatorWithSession runtime content by default', () => {
        const state = buildContactsScreenState();
        const dispatch = vi.fn();

        const { container } = render(<SimulatorPhoneDevice state={state} dispatch={dispatch} />);

        expect(container.querySelector('[data-simulator-app]')).not.toBeNull();
        expect(within(container).getByText('IT Helpdesk')).toBeInstanceOf(HTMLElement);
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
                    durationSeconds: 32,
                },
            ],
        });
        const dispatch = vi.fn();

        const { getByText } = render(<SimulatorPhoneDevice state={state} dispatch={dispatch} />);

        expect(getByText('Previous calls')).toBeInstanceOf(HTMLElement);
        expect(getByText('Today 9:15 AM')).toBeInstanceOf(HTMLElement);
    });

    it('allows overriding renderIncomingCallExtra', () => {
        const state = buildIncomingCallState();
        const dispatch = vi.fn();
        const customExtra = vi.fn(() => <div data-testid='custom-incoming-extra'>Custom</div>);

        const { getByTestId } = render(
            <SimulatorPhoneDevice
                state={state}
                dispatch={dispatch}
                renderIncomingCallExtra={customExtra}
            />,
        );

        expect(customExtra).toHaveBeenCalled();
        expect(getByTestId('custom-incoming-extra')).toBeInstanceOf(HTMLElement);
    });

    it('without renderContactDetail, package/default contact detail behavior remains active', () => {
        const state = buildContactsScreenState();
        const dispatch = vi.fn();

        const { container } = render(<SimulatorPhoneDevice state={state} dispatch={dispatch} />);

        clickContactRow(container, 'IT Helpdesk');

        expect(container.querySelector('.simulator-phone__contact-detail')).not.toBeNull();
    });

    it('with renderContactDetail, clicking a contact row renders custom contact detail content', () => {
        const state = buildContactsScreenState();
        const dispatch = vi.fn();

        const { container, getByTestId } = render(
            <SimulatorPhoneDevice
                state={state}
                dispatch={dispatch}
                renderContactDetail={({ contact, onBack }) => (
                    <div data-testid='host-contact-detail'>
                        <span>{contact.displayName}</span>
                        <button type='button' onClick={onBack}>
                            Back
                        </button>
                    </div>
                )}
            />,
        );

        clickContactRow(container, 'HR');

        expect(getByTestId('host-contact-detail')).toBeInstanceOf(HTMLElement);
        expect(within(getByTestId('host-contact-detail')).getByText('HR')).toBeInstanceOf(
            HTMLElement,
        );
    });

    it('with renderContactDetail, package .simulator-phone__contact-detail is not rendered', () => {
        const state = buildContactsScreenState();
        const dispatch = vi.fn();

        const { container } = render(
            <SimulatorPhoneDevice
                state={state}
                dispatch={dispatch}
                renderContactDetail={({ contact }) => (
                    <div data-testid='host-contact-detail'>{contact.displayName}</div>
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
            <SimulatorPhoneDevice
                state={state}
                dispatch={dispatch}
                contactDetail={{ mode: 'read-only' }}
            />,
        );
        clickContactRow(container, 'IT Helpdesk');
        dispatch.mockClear();
        const back = getAllByRole('button', { name: 'Back' }).at(-1)!;
        fireEvent.click(back);
        expect(queryByTestId('simulator-phone-contact-detail')).toBeNull();
        expect(container.querySelector('[data-simulator-app]')).not.toBeNull();
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
                    <div data-testid='host-contact-detail'>
                        <span>{contact.displayName}</span>
                        <button type='button' onClick={onBack}>
                            Back
                        </button>
                    </div>
                )}
            />,
        );

        clickContactRow(container, 'IT Helpdesk');
        expect(getByTestId('host-contact-detail')).toBeInstanceOf(HTMLElement);

        fireEvent.click(getByRole('button', { name: 'Back' }));

        expect(container.querySelector('[data-testid="host-contact-detail"]')).toBeNull();
        expect(container.querySelector('[data-simulator-app]')).not.toBeNull();
    });

    it('screenClassNames include simulator-device-shell--screen-phone-contact-detail while custom contact detail is active', () => {
        const state = buildContactsScreenState();
        const dispatch = vi.fn();

        const { container, getByTestId } = render(
            <SimulatorPhoneDevice
                state={state}
                dispatch={dispatch}
                renderContactDetail={({ contact }) => (
                    <div data-testid='host-contact-detail'>{contact.displayName}</div>
                )}
            />,
        );

        clickContactRow(container, 'IT Helpdesk');

        expect(getByTestId('simulator-device-shell').className).toContain(
            SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.phoneContactDetail,
        );
        expect(getByTestId('simulator-device-shell').className).toContain(
            'simulator-device-shell--screen-phone-contact-detail',
        );
    });

    it('appends optional screenClassNames and className escape hatches', () => {
        const state = buildContactsScreenState();
        const dispatch = vi.fn();

        const { getByTestId } = render(
            <SimulatorPhoneDevice
                state={state}
                dispatch={dispatch}
                className='host-simulator-root'
                screenClassNames={['host-simulator-root--preview']}
            />,
        );

        expect(getByTestId('simulator-device-shell').className).toContain(
            'host-simulator-root--preview',
        );
        expect(
            getByTestId('simulator-device-shell').closest('.host-simulator-root'),
        ).not.toBeNull();
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

        expect(getByTestId('simulator-phone-contact-detail')).toBeInstanceOf(HTMLElement);
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
                    <div data-testid='host-contact-detail'>{contact.displayName}</div>
                )}
            />,
        );

        clickContactRow(container, 'HR');

        expect(getByTestId('host-contact-detail')).toBeInstanceOf(HTMLElement);
        expect(queryByTestId('simulator-phone-contact-detail')).toBeNull();
    });

    it('works with a minimal phone payload from simulator-react initial state', () => {
        const state = getInitialSessionState(minimalPhonePayload());
        state.view.activeApp = 'phone';
        state.view.phone.screen = 'history';
        state.view.showPrimaryMenu = true;
        const dispatch = vi.fn();

        const { getByTestId } = render(<SimulatorPhoneDevice state={state} dispatch={dispatch} />);

        expect(getByTestId('simulator-device-shell')).toBeInstanceOf(HTMLElement);
    });
});

it('passes the original contact context to package delete handlers', () => {
    const state = buildContactsScreenState();
    const dispatch = vi.fn();
    const onDelete = vi.fn();
    const { container, getByRole } = render(
        <SimulatorPhoneDevice
            state={state}
            dispatch={dispatch}
            contactDetail={{ mode: 'editable', onDelete }}
        />,
    );
    clickContactRow(container, 'HR');
    fireEvent.click(getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ displayName: 'HR' }), {
        state,
        dispatch: expect.any(Function),
        originalContact: expect.objectContaining({ displayName: 'HR' }),
    });
});

it('closes host contact details when switching phone tabs', () => {
    const dispatch = vi.fn();
    const state = buildContactsScreenState();
    state.view.showPrimaryMenu = false;
    const { container, getByRole, queryByTestId } = render(
        <SimulatorPhoneDevice state={state} dispatch={dispatch} contactDetail={{}} />,
    );
    clickContactRow(container, 'HR');
    fireEvent.click(getByRole('button', { name: 'History' }));
    expect(queryByTestId('simulator-phone-contact-detail')).toBeNull();
    expect(dispatch).toHaveBeenCalledWith({ type: 'NAV_LOCAL', app: 'phone', screen: 'history' });
});

it('hides navigation when there is no active app', () => {
    const state = buildContactsScreenState();
    // @ts-expect-error Exercise malformed state received from an untyped host.
    state.view.activeApp = null;
    const view = render(<SimulatorPhoneDevice state={state} dispatch={vi.fn()} />);
    expect(view.queryByRole('navigation')).toBeNull();
});

it('returns focus to search when the previously selected contact is removed', () => {
    const state = buildContactsScreenState();
    const dispatch = vi.fn();
    const view = render(
        <SimulatorPhoneDevice state={state} dispatch={dispatch} contactDetail={{}} />,
    );
    clickContactRow(view.container, 'HR');
    const changed = { ...state, payload: { ...state.payload, contacts: [] } };
    view.rerender(<SimulatorPhoneDevice state={changed} dispatch={dispatch} contactDetail={{}} />);
    expect(view.queryByTestId('simulator-phone-contact-detail')).toBeNull();
    expect(document.activeElement).toBe(view.getByRole('searchbox'));
});

it('closes details when the host changes the active phone screen', () => {
    const state = buildContactsScreenState();
    const dispatch = vi.fn();
    const view = render(
        <SimulatorPhoneDevice state={state} dispatch={dispatch} contactDetail={{}} />,
    );
    clickContactRow(view.container, 'HR');
    view.rerender(
        <SimulatorPhoneDevice
            state={{
                ...state,
                view: { ...state.view, phone: { ...state.view.phone, screen: 'dial' } },
            }}
            dispatch={dispatch}
            contactDetail={{}}
        />,
    );
    expect(view.queryByTestId('simulator-phone-contact-detail')).toBeNull();
});

it('exposes isolated scroll roots and releases host refs on unmount', () => {
    const first = vi.fn();
    const second = vi.fn();
    const state = getInitialSessionState(minimalPhonePayload());
    const a = render(<SimulatorPhoneDevice state={state} dispatch={() => {}} screenRef={first} />);
    const b = render(<SimulatorPhoneDevice state={state} dispatch={() => {}} screenRef={second} />);
    const firstRoot = first.mock.calls[0]?.[0];
    const secondRoot = second.mock.calls[0]?.[0];
    expect(firstRoot).toBeInstanceOf(HTMLDivElement);
    expect(a.container.contains(firstRoot)).toBe(true);
    expect(b.container.contains(secondRoot)).toBe(true);
    expect(firstRoot).not.toBe(secondRoot);
    a.unmount();
    expect(first).toHaveBeenLastCalledWith(null);
    expect(second).not.toHaveBeenLastCalledWith(null);
    b.unmount();
    expect(second).toHaveBeenLastCalledWith(null);
});

it('sets and releases a mutable host screen ref', () => {
    const screenRef: { current: HTMLDivElement | null } = { current: null };
    const view = render(
        <SimulatorPhoneDevice
            state={getInitialSessionState(minimalPhonePayload())}
            dispatch={() => {}}
            screenRef={screenRef}
        />,
    );
    expect(screenRef.current).toBeInstanceOf(HTMLDivElement);
    view.unmount();
    expect(screenRef.current).toBeNull();
});

it.each([
    { name: 'default', contactDetail: undefined },
    { name: 'configured read-only', contactDetail: {} },
])(
    '$name contact Back restores the list and focus without leaving Contacts',
    ({ contactDetail }) => {
        const state = buildContactsScreenState();
        state.view.showPrimaryMenu = false;
        const dispatch = vi.fn();
        const onNavigation = vi.fn();
        const onNavigationEvent = vi.fn();
        const view = render(
            <SimulatorPhoneDevice
                state={state}
                dispatch={dispatch}
                contactDetail={contactDetail}
                onNavigation={onNavigation}
                onNavigationEvent={onNavigationEvent}
            />,
        );
        clickContactRow(view.container, 'HR');
        expect(view.getByTestId('simulator-phone-contact-detail')).toBeInstanceOf(HTMLElement);
        expect(document.activeElement).toBe(
            view.container.querySelector('.simulator-phone-contact-detail__title'),
        );
        expect(view.queryByRole('button', { name: 'Back to list' })).toBeNull();
        expect(view.queryByRole('button', { name: 'Back to contacts list' })).toBeNull();
        expect(view.queryByRole('textbox')).toBeNull();
        dispatch.mockClear();
        onNavigation.mockClear();
        onNavigationEvent.mockClear();

        fireEvent.click(view.getByRole('button', { name: 'Back' }));

        expect(view.queryByTestId('simulator-phone-contact-detail')).toBeNull();
        expect(document.activeElement).toBe(view.getByRole('button', { name: /HR/ }));
        expect(view.getByRole('button', { name: /IT Helpdesk/ })).toBeInstanceOf(HTMLElement);
        expect(dispatch).not.toHaveBeenCalled();
        const location = { app: 'phone', screen: 'contacts', primaryMenu: false };
        expect(onNavigation).toHaveBeenCalledWith({ kind: 'back', from: location, to: location });
        expect(onNavigationEvent).toHaveBeenCalledWith({
            kind: 'back',
            from: location,
            to: location,
            disposition: 'delegated',
        });
    },
);

it('keeps default contact details open when the host handles Back', () => {
    const state = buildContactsScreenState();
    state.view.showPrimaryMenu = false;
    const dispatch = vi.fn();
    const onNavigation = vi.fn(() => 'handled' as const);
    const onNavigationEvent = vi.fn();
    const view = render(
        <SimulatorPhoneDevice
            state={state}
            dispatch={dispatch}
            onNavigation={onNavigation}
            onNavigationEvent={onNavigationEvent}
        />,
    );
    clickContactRow(view.container, 'HR');
    dispatch.mockClear();
    fireEvent.click(view.getByRole('button', { name: 'Back' }));
    expect(view.getByTestId('simulator-phone-contact-detail')).toBeInstanceOf(HTMLElement);
    expect(dispatch).not.toHaveBeenCalled();
    expect(onNavigationEvent).toHaveBeenLastCalledWith(
        expect.objectContaining({
            disposition: 'handled',
            to: { app: 'phone', screen: 'contacts', primaryMenu: false },
        }),
    );
});
