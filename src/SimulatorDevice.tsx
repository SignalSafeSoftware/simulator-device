import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
    getInitialSessionState,
    simulatorSessionReducerWithLogging,
    type SimulatorDispatchAction,
    type SimulatorSessionState,
} from '@signalsafe/simulator-react';
import {
    patchContactInDevicePayload,
    removeContactFromDevicePayload,
} from './contact/patchContactsInDevicePayload.js';
import type {
    SimulatorPhoneContactDetailContext,
    SimulatorPhoneContactDetailValues,
    SimulatorPhoneDeviceContactDetailOptions,
} from './contact/contactDetailTypes.js';
import type { SimulatorDevicePayload } from './types/simulatorDevicePayload.js';
import SimulatorPhoneDevice from './SimulatorPhoneDevice.js';
import type { SimulatorPhoneDeviceProps } from './SimulatorPhoneDevice.js';
import SimulatorDeviceFallback from './SimulatorDeviceFallback.js';
import { resolveSimulatorDeviceKind } from './resolveSimulatorDeviceKind.js';
import { simulatorDeviceValueToSessionPayload } from './simulatorDeviceValueToSessionPayload.js';

export interface SimulatorDevicePhoneOptions {
    renderContactDetail?: SimulatorPhoneDeviceProps['renderContactDetail'];
    contactDetail?: SimulatorPhoneDeviceProps['contactDetail'];
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
    /**
     * Called when package contact save/delete updates `value.contacts`.
     * Host callbacks from `phone.contactDetail` run after `onChange`.
     */
    onChange?: (nextValue: SimulatorDevicePayload) => void;
    phone?: SimulatorDevicePhoneOptions;
    renderUnsupported?: (props: SimulatorDeviceUnsupportedRenderProps) => ReactNode;
}

function wrapContactDetailForDevice(
    value: SimulatorDevicePayload,
    onChange: SimulatorDeviceProps['onChange'],
    contactDetail: SimulatorPhoneDeviceContactDetailOptions | undefined,
): SimulatorPhoneDeviceContactDetailOptions | undefined {
    if (contactDetail == null) {
        return undefined;
    }

    const invokeHostSave = (
        updated: SimulatorPhoneContactDetailValues,
        context: SimulatorPhoneContactDetailContext,
    ) => {
        if (onChange != null) {
            onChange(patchContactInDevicePayload(value, updated));
        }
        contactDetail.onSave?.(updated, context);
    };

    const invokeHostDelete = (
        current: SimulatorPhoneContactDetailValues,
        context: SimulatorPhoneContactDetailContext,
    ) => {
        if (onChange != null) {
            onChange(removeContactFromDevicePayload(value, current.id));
        }
        contactDetail.onDelete?.(current, context);
    };

    const shouldWireSave = onChange != null || contactDetail.onSave != null;
    const shouldWireDelete = onChange != null || contactDetail.onDelete != null;

    return {
        ...contactDetail,
        onSave: shouldWireSave ? invokeHostSave : undefined,
        onDelete: shouldWireDelete ? invokeHostDelete : undefined,
    };
}

/**
 * JSON-driven simulator entry point: accepts stored simulator JSON and owns session creation.
 * Renders {@link SimulatorPhoneDevice} for the current full-device payload shape.
 */
export default function SimulatorDevice({
    value,
    onChange,
    phone,
    renderUnsupported,
}: Readonly<SimulatorDeviceProps>) {
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

    const deviceContactDetail = useMemo(
        () => wrapContactDetailForDevice(value, onChange, phone?.contactDetail),
        [value, onChange, phone?.contactDetail],
    );

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
            contactDetail={deviceContactDetail}
            renderIncomingCallExtra={phone?.renderIncomingCallExtra}
            className={phone?.className}
            screenClassNames={phone?.screenClassNames}
        />
    );
}
