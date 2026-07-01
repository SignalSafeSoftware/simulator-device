import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';
import SimulatorDevice from '../src/SimulatorDevice.js';
import { buildContactsDeviceJson, buildDesktopDiscriminatedJson, buildHomeDeviceJson } from './support/deviceJsonFixtures.js';

const capturedPhoneDeviceProps = vi.hoisted(() => ({
    current: null as Record<string, unknown> | null,
}));

vi.mock('../src/SimulatorPhoneDevice.js', () => ({
    default: (props: Record<string, unknown>) => {
        capturedPhoneDeviceProps.current = props;
        return <div data-testid="mock-simulator-phone-device" />;
    },
}));

describe('SimulatorDevice', () => {
    it('renders SimulatorPhoneDevice for a valid full-device payload', async () => {
        capturedPhoneDeviceProps.current = null;

        const { getByTestId } = render(<SimulatorDevice value={buildHomeDeviceJson()} />);

        await waitFor(() => expect(getByTestId('mock-simulator-phone-device')).toBeTruthy());
        expect(capturedPhoneDeviceProps.current).not.toBeNull();
    });

    it('creates initial session from value.entry_point', async () => {
        capturedPhoneDeviceProps.current = null;

        render(<SimulatorDevice value={buildHomeDeviceJson()} />);

        await waitFor(() => expect(capturedPhoneDeviceProps.current).not.toBeNull());

        expect(
            (capturedPhoneDeviceProps.current?.state as { view?: { activeApp?: string } })?.view?.activeApp,
        ).toBe('home');
    });

    it('updates internal session state when dispatch is invoked', async () => {
        capturedPhoneDeviceProps.current = null;

        render(<SimulatorDevice value={buildHomeDeviceJson()} />);

        await waitFor(() => expect(capturedPhoneDeviceProps.current).not.toBeNull());

        (capturedPhoneDeviceProps.current?.dispatch as (action: unknown) => void)({
            type: 'SWITCH_APP',
            app: 'email',
        });

        await waitFor(() =>
            expect(
                (capturedPhoneDeviceProps.current?.state as { view?: { activeApp?: string } })?.view?.activeApp,
            ).toBe('email'),
        );
    });

    it('passes phone.contactDetail through to SimulatorPhoneDevice', async () => {
        capturedPhoneDeviceProps.current = null;
        const contactDetail = { mode: 'editable' as const, onSave: vi.fn() };

        render(
            <SimulatorDevice
                value={buildContactsDeviceJson()}
                phone={{ contactDetail }}
            />,
        );

        await waitFor(() => expect(capturedPhoneDeviceProps.current).not.toBeNull());
        expect(capturedPhoneDeviceProps.current?.contactDetail).toMatchObject({ mode: 'editable' });
        expect(capturedPhoneDeviceProps.current?.contactDetail).toHaveProperty('onSave');
    });

    it('contact save patches value.contacts and calls onChange before host onSave', async () => {
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

        const wrappedOnSave = (
            capturedPhoneDeviceProps.current?.contactDetail as { onSave?: (contact: unknown) => void }
        )?.onSave;

        wrappedOnSave?.({
            id: 'c1',
            displayName: 'Updated Helpdesk',
            number: '+1999',
            email: 'help@example.com',
        });

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0]?.[0]?.contacts?.[0]?.display_name).toBe('Updated Helpdesk');
        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onChange.mock.invocationCallOrder[0]).toBeLessThan(onSave.mock.invocationCallOrder[0]!);
    });

    it('contact delete removes contact and calls onChange before host onDelete', async () => {
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

        const wrappedOnDelete = (
            capturedPhoneDeviceProps.current?.contactDetail as { onDelete?: (contact: unknown) => void }
        )?.onDelete;

        wrappedOnDelete?.({
            id: 'c1',
            displayName: 'IT Helpdesk',
            number: '+15550001111',
        });

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0]?.[0]?.contacts).toHaveLength(1);
        expect(onChange.mock.calls[0]?.[0]?.contacts?.[0]?.id).toBe('c2');
        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(onChange.mock.invocationCallOrder[0]).toBeLessThan(onDelete.mock.invocationCallOrder[0]!);
    });

    it('passes phone.renderContactDetail through to SimulatorPhoneDevice', async () => {
        capturedPhoneDeviceProps.current = null;
        const renderContactDetail = vi.fn(() => <div data-testid="host-contact-detail" />);

        render(
            <SimulatorDevice
                value={buildContactsDeviceJson()}
                phone={{ renderContactDetail }}
            />,
        );

        await waitFor(() => expect(capturedPhoneDeviceProps.current).not.toBeNull());
        expect(capturedPhoneDeviceProps.current?.renderContactDetail).toBe(renderContactDetail);
    });

    it('passes phone.renderIncomingCallExtra through to SimulatorPhoneDevice', async () => {
        capturedPhoneDeviceProps.current = null;
        const renderIncomingCallExtra = vi.fn(() => <div data-testid="host-incoming-extra" />);

        render(
            <SimulatorDevice
                value={buildHomeDeviceJson()}
                phone={{ renderIncomingCallExtra }}
            />,
        );

        await waitFor(() => expect(capturedPhoneDeviceProps.current).not.toBeNull());
        expect(capturedPhoneDeviceProps.current?.renderIncomingCallExtra).toBe(renderIncomingCallExtra);
    });

    it('renders renderUnsupported for unsupported future shapes', () => {
        const { getByTestId, queryByTestId } = render(
            <SimulatorDevice
                value={buildDesktopDiscriminatedJson() as never}
                renderUnsupported={() => <div data-testid="custom-unsupported">Desktop later</div>}
            />,
        );

        expect(getByTestId('custom-unsupported')).toBeTruthy();
        expect(queryByTestId('mock-simulator-phone-device')).toBeNull();
    });

    it('renders safe fallback when unsupported and renderUnsupported is omitted', () => {
        const { getByTestId, queryByTestId } = render(
            <SimulatorDevice value={buildDesktopDiscriminatedJson() as never} />,
        );

        expect(getByTestId('simulator-device-unsupported')).toBeTruthy();
        expect(queryByTestId('mock-simulator-phone-device')).toBeNull();
    });
});
