import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
    getInitialSessionState,
    simulatorSessionReducerWithLogging,
    type SimulatorDispatchAction,
    type SimulatorSessionState,
} from '@signalsafe/simulator-react';
import type { SimulatorDevicePayload } from './types/simulatorDevicePayload.js';
import SimulatorPhoneDevice from './SimulatorPhoneDevice.js';
import type { SimulatorPhoneDeviceProps } from './SimulatorPhoneDevice.js';
import SimulatorDeviceFallback from './SimulatorDeviceFallback.js';
import { resolveSimulatorDeviceKind } from './resolveSimulatorDeviceKind.js';
import { simulatorDeviceValueToSessionPayload } from './simulatorDeviceValueToSessionPayload.js';

export interface SimulatorDevicePhoneOptions {
    renderContactDetail?: SimulatorPhoneDeviceProps['renderContactDetail'];
    renderIncomingCallExtra?: SimulatorPhoneDeviceProps['renderIncomingCallExtra'];
    className?: SimulatorPhoneDeviceProps['className'];
    screenClassNames?: SimulatorPhoneDeviceProps['screenClassNames'];
}

export interface SimulatorDeviceUnsupportedRenderProps {
    value: unknown;
}

export interface SimulatorDeviceProps {
    /** Full-device simulator JSON (database/API `simulator_json` shape). */
    value: SimulatorDevicePayload;
    /** Reserved for future JSON editing; not invoked in read-only rendering yet. */
    onChange?: (nextValue: SimulatorDevicePayload) => void;
    phone?: SimulatorDevicePhoneOptions;
    renderUnsupported?: (props: SimulatorDeviceUnsupportedRenderProps) => ReactNode;
}

/**
 * JSON-driven simulator entry point: accepts stored simulator JSON and owns session creation.
 * Renders {@link SimulatorPhoneDevice} for the current full-device payload shape.
 */
export default function SimulatorDevice({
    value,
    onChange: _onChange,
    phone,
    renderUnsupported,
}: Readonly<SimulatorDeviceProps>) {
    void _onChange;

    const kind = resolveSimulatorDeviceKind(value);

    const sessionPayload = useMemo(() => {
        if (kind !== 'phone-full-device') {
            return null;
        }
        return simulatorDeviceValueToSessionPayload(value);
    }, [kind, value]);

    const [state, setState] = useState<SimulatorSessionState | null>(() =>
        sessionPayload == null ? null : getInitialSessionState(sessionPayload),
    );

    useEffect(() => {
        if (sessionPayload == null) {
            setState(null);
            return;
        }
        setState(getInitialSessionState(sessionPayload));
    }, [sessionPayload]);

    const dispatch = useCallback((action: SimulatorDispatchAction) => {
        setState((prev) => (prev == null ? prev : simulatorSessionReducerWithLogging(prev, action)));
    }, []);

    if (kind === 'unsupported') {
        if (renderUnsupported) {
            return <>{renderUnsupported({ value })}</>;
        }
        return <SimulatorDeviceFallback />;
    }

    if (state == null) {
        return <SimulatorDeviceFallback />;
    }

    return (
        <SimulatorPhoneDevice
            state={state}
            dispatch={dispatch}
            renderContactDetail={phone?.renderContactDetail}
            renderIncomingCallExtra={phone?.renderIncomingCallExtra}
            className={phone?.className}
            screenClassNames={phone?.screenClassNames}
        />
    );
}
