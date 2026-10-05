import type { SimulatorPhoneDeviceProps } from '../src/phone/SimulatorPhoneDevice.js';
import { describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import SimulatorDevice from '../src/SimulatorDevice.js';
import {
    buildContactsDeviceJson,
    buildDesktopDiscriminatedJson,
    buildHomeDeviceJson,
} from './support/deviceJsonFixtures.js';

const capturedPhoneDeviceProps = vi.hoisted(() => ({
    current: null as SimulatorPhoneDeviceProps | null,
}));

vi.mock('../src/phone/SimulatorPhoneDevice.js', () => ({
    default: (props: SimulatorPhoneDeviceProps) => {
        capturedPhoneDeviceProps.current = props;
        return <div data-testid='mock-simulator-phone-device' />;
    },
}));

function phoneProps(): SimulatorPhoneDeviceProps {
    const props = capturedPhoneDeviceProps.current;
    if (!props) throw new Error('Expected SimulatorPhoneDevice to render.');
    return props;
}

function contactContext() {
    const { state, dispatch } = phoneProps();
    const originalContact = state.payload.contacts?.find((contact) => contact.id === 'c1');
    if (!originalContact) throw new Error('Expected the fixture contact.');
    return { state, dispatch, originalContact };
}

describe('SimulatorDevice', () => {
    it('renders SimulatorPhoneDevice for a valid full-device payload', async () => {
        capturedPhoneDeviceProps.current = null;

        const { getByTestId } = render(<SimulatorDevice value={buildHomeDeviceJson()} />);

        await waitFor(() =>
            expect(getByTestId('mock-simulator-phone-device')).toBeInstanceOf(HTMLElement),
        );
        expect(capturedPhoneDeviceProps.current).not.toBeNull();
    });

    it('creates initial session from value.entry_point', async () => {
        capturedPhoneDeviceProps.current = null;

        render(<SimulatorDevice value={buildHomeDeviceJson()} />);

        await waitFor(() => expect(capturedPhoneDeviceProps.current).not.toBeNull());

        expect(phoneProps().state.view.activeApp).toBe('home');
    });

    it('updates internal session state when dispatch is invoked', async () => {
        capturedPhoneDeviceProps.current = null;

        render(<SimulatorDevice value={buildHomeDeviceJson()} />);

        await waitFor(() => expect(capturedPhoneDeviceProps.current).not.toBeNull());

        phoneProps().dispatch({
            type: 'SWITCH_APP',
            app: 'email',
        });

        await waitFor(() => expect(phoneProps().state.view.activeApp).toBe('email'));
    });

    it('passes phone.contactDetail through to SimulatorPhoneDevice', async () => {
        capturedPhoneDeviceProps.current = null;
        const contactDetail = { mode: 'editable' as const, onSave: vi.fn() };

        render(<SimulatorDevice value={buildContactsDeviceJson()} phone={{ contactDetail }} />);

        await waitFor(() => expect(capturedPhoneDeviceProps.current).not.toBeNull());
        expect(phoneProps().contactDetail).toMatchObject({ mode: 'editable' });
        expect(phoneProps().contactDetail).toHaveProperty('onSave');
    });

    it('contact save patches value.contacts and calls onChange after host onSave succeeds', async () => {
        capturedPhoneDeviceProps.current = null;
        const onChange = vi.fn();
        const onSave = vi.fn();
        const value = buildContactsDeviceJson();

        render(
            <SimulatorDevice
                value={value}
                onChange={onChange}
                phone={{ contactDetail: { mode: 'editable', onSave } }}
            />,
        );

        await waitFor(() => expect(capturedPhoneDeviceProps.current).not.toBeNull());

        const wrappedOnSave = phoneProps().contactDetail?.onSave;

        wrappedOnSave?.(
            {
                id: 'c1',
                displayName: 'Updated Helpdesk',
                number: '+1999',
                email: 'help@example.com',
            },
            contactContext(),
        );

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0]?.[0]?.contacts?.[0]?.display_name).toBe('Updated Helpdesk');
        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onChange.mock.invocationCallOrder[0]).toBeGreaterThan(
            onSave.mock.invocationCallOrder[0]!,
        );
    });

    it('contact delete removes contact and calls onChange after host onDelete succeeds', async () => {
        capturedPhoneDeviceProps.current = null;
        const onChange = vi.fn();
        const onDelete = vi.fn();
        const value = buildContactsDeviceJson();

        render(
            <SimulatorDevice
                value={value}
                onChange={onChange}
                phone={{ contactDetail: { mode: 'editable', onDelete } }}
            />,
        );

        await waitFor(() => expect(capturedPhoneDeviceProps.current).not.toBeNull());

        const wrappedOnDelete = phoneProps().contactDetail?.onDelete;

        wrappedOnDelete?.(
            {
                id: 'c1',
                displayName: 'IT Helpdesk',
                number: '+15550001111',
            },
            contactContext(),
        );

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0]?.[0]?.contacts).toHaveLength(1);
        expect(onChange.mock.calls[0]?.[0]?.contacts?.[0]?.id).toBe('c2');
        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(onChange.mock.invocationCallOrder[0]).toBeGreaterThan(
            onDelete.mock.invocationCallOrder[0]!,
        );
    });

    it('passes phone.renderContactDetail through to SimulatorPhoneDevice', async () => {
        capturedPhoneDeviceProps.current = null;
        const renderContactDetail = vi.fn(() => <div data-testid='host-contact-detail' />);

        render(
            <SimulatorDevice value={buildContactsDeviceJson()} phone={{ renderContactDetail }} />,
        );

        await waitFor(() => expect(capturedPhoneDeviceProps.current).not.toBeNull());
        expect(phoneProps().renderContactDetail).toBe(renderContactDetail);
    });

    it('passes phone.renderIncomingCallExtra through to SimulatorPhoneDevice', async () => {
        capturedPhoneDeviceProps.current = null;
        const renderIncomingCallExtra = vi.fn(() => <div data-testid='host-incoming-extra' />);

        render(
            <SimulatorDevice value={buildHomeDeviceJson()} phone={{ renderIncomingCallExtra }} />,
        );

        await waitFor(() => expect(capturedPhoneDeviceProps.current).not.toBeNull());
        expect(phoneProps().renderIncomingCallExtra).toBe(renderIncomingCallExtra);
    });

    it('forwards runtime passthrough props to SimulatorPhoneDevice', async () => {
        capturedPhoneDeviceProps.current = null;
        const onSimulatorEvent = vi.fn();
        const developerTools = { enabled: true, sections: { timeline: true } };
        const developerToolsTimelineEntries = [
            { kind: 'session_started' as const, timestamp: 't', app: 'home', screen: 'home' },
        ];
        const developerToolsRuntimeIssues = [
            { id: 'w1', message: 'warn', severity: 'warning' as const },
        ];
        const renderChoice = vi.fn();
        const renderFeedback = vi.fn();
        const renderContactsOverlay = vi.fn();
        const exitLink = <span>Exit</span>;

        render(
            <SimulatorDevice
                value={buildHomeDeviceJson()}
                onSimulatorEvent={onSimulatorEvent}
                developerTools={developerTools}
                developerToolsTimelineEntries={developerToolsTimelineEntries}
                developerToolsRuntimeIssues={developerToolsRuntimeIssues}
                initialContactsSearch='alice'
                compact
                exitLink={exitLink}
                exitTo='/leave'
                exitLabel='Leave'
                renderChoice={renderChoice}
                renderFeedback={renderFeedback}
                renderContactsOverlay={renderContactsOverlay}
            />,
        );

        await waitFor(() => expect(capturedPhoneDeviceProps.current).not.toBeNull());

        expect(phoneProps().onSimulatorEvent).toBe(onSimulatorEvent);
        expect(phoneProps().developerTools).toBe(developerTools);
        expect(phoneProps().developerToolsTimelineEntries).toBe(developerToolsTimelineEntries);
        expect(phoneProps().developerToolsRuntimeIssues).toBe(developerToolsRuntimeIssues);
        expect(phoneProps().initialContactsSearch).toBe('alice');
        expect(phoneProps().compact).toBe(true);
        expect(phoneProps().exitLink).toBe(exitLink);
        expect(phoneProps().exitTo).toBe('/leave');
        expect(phoneProps().exitLabel).toBe('Leave');
        expect(phoneProps().renderChoice).toBe(renderChoice);
        expect(phoneProps().renderFeedback).toBe(renderFeedback);
        expect(phoneProps().renderContactsOverlay).toBe(renderContactsOverlay);
    });

    it('does not expose state or dispatch on SimulatorDevice public props surface', async () => {
        capturedPhoneDeviceProps.current = null;

        render(<SimulatorDevice value={buildHomeDeviceJson()} onSimulatorEvent={vi.fn()} />);

        await waitFor(() => expect(capturedPhoneDeviceProps.current).not.toBeNull());
        expect(phoneProps().state).toHaveProperty('view');
        expect(phoneProps().dispatch).toBeTypeOf('function');
    });

    it('renders renderUnsupported for unsupported future shapes', () => {
        const { getByTestId, queryByTestId } = render(
            <SimulatorDevice
                value={buildDesktopDiscriminatedJson() as never}
                renderUnsupported={() => <div data-testid='custom-unsupported'>Desktop later</div>}
            />,
        );

        expect(getByTestId('custom-unsupported')).toBeInstanceOf(HTMLElement);
        expect(queryByTestId('mock-simulator-phone-device')).toBeNull();
    });

    it('renders safe fallback when unsupported and renderUnsupported is omitted', () => {
        const { getByTestId, queryByTestId } = render(
            <SimulatorDevice value={buildDesktopDiscriminatedJson() as never} />,
        );

        expect(getByTestId('simulator-device-unsupported')).toBeInstanceOf(HTMLElement);
        expect(queryByTestId('mock-simulator-phone-device')).toBeNull();
    });
});

it('initializes a device when an unsupported value is replaced', async () => {
    const { rerender, queryByTestId, getByTestId } = render(
        <SimulatorDevice value={Object.assign(buildHomeDeviceJson(), { type: 'desktop' })} />,
    );
    expect(queryByTestId('mock-simulator-phone-device')).toBeNull();
    rerender(<SimulatorDevice value={buildHomeDeviceJson()} />);
    await waitFor(() =>
        expect(getByTestId('mock-simulator-phone-device')).toBeInstanceOf(HTMLElement),
    );
});
