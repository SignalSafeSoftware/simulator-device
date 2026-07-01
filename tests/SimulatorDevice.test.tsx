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
