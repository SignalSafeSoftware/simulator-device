import { createRef } from 'react';
import { render, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import type { SimulatorPhoneDeviceProps } from '../src/SimulatorPhoneDevice.js';
import SimulatorDevice from '../src/SimulatorDevice.js';
import { buildHomeDeviceJson } from './support/deviceJsonFixtures.js';

const captured = vi.hoisted(() => ({ props: undefined as SimulatorPhoneDeviceProps | undefined }));
vi.mock('../src/SimulatorPhoneDevice.js', () => ({
    default: (props: SimulatorPhoneDeviceProps) => {
        captured.props = props;
        return null;
    },
}));

it('forwards supported top-level callbacks and refs and gives nested options precedence', async () => {
    const screenRef = createRef<HTMLDivElement>();
    const onEmailAction = vi.fn();
    const value = buildHomeDeviceJson();
    const { rerender } = render(
        <SimulatorDevice value={value} screenRef={screenRef} onEmailAction={onEmailAction} />,
    );
    await waitFor(() => expect(captured.props?.screenRef).toBe(screenRef));
    expect(captured.props?.onEmailAction).toBe(onEmailAction);
    const nestedRef = createRef<HTMLDivElement>();
    const nestedAction = vi.fn();
    rerender(
        <SimulatorDevice
            value={value}
            screenRef={screenRef}
            onEmailAction={onEmailAction}
            phone={{ screenRef: nestedRef, onEmailAction: nestedAction }}
        />,
    );
    await waitFor(() => expect(captured.props?.screenRef).toBe(nestedRef));
    expect(captured.props?.onEmailAction).toBe(nestedAction);
});
