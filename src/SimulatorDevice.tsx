import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getInitialSessionState } from '@signalsafe/simulator-react/state/simulatorSessionInitialState';
import {
    simulatorDatasourceToPayload,
    updateSimulatorPayload,
    type SimulatorDatasource,
} from '@signalsafe/simulator-react/datasource/datasource';
import { simulatorSessionReducerWithLogging } from '@signalsafe/simulator-react/state/simulatorSessionReducer';
import type { SimulatorDispatchAction } from '@signalsafe/simulator-react/state/simulatorDispatchActions';
import type { SimulatorSessionState } from '@signalsafe/simulator-react/types/session';
import {
    patchContactInDevicePayload,
    removeContactFromDevicePayload,
} from './contact/patchContactsInDevicePayload.js';
import type {
    SimulatorPhoneContactDetailContext,
    SimulatorPhoneContactDetailValues,
    SimulatorPhoneDeviceContactDetailOptions,
} from './contact/contactDetailTypes.js';
import type { SimulatorDeviceRuntimePassthroughProps } from './runtime/simulatorDeviceRuntimeProps.js';
import type { SimulatorDevicePayload } from '@signalsafe/simulator-core/devicePayload';
import SimulatorPhoneDevice, {
    type SimulatorPhoneDeviceProps,
} from './phone/SimulatorPhoneDevice.js';
import SimulatorDeviceFallback from './runtime/SimulatorDeviceFallback.js';
import {
    SimulatorDeviceKind,
    resolveSimulatorDeviceKind,
} from './runtime/resolveSimulatorDeviceKind.js';
import { fullDeviceToPayload } from '@signalsafe/simulator-react/adapters/deviceToSession';

export interface SimulatorDevicePhoneOptions {
    onEmailAction?: NonNullable<SimulatorPhoneDeviceProps['onEmailAction']>;
    screenRef?: NonNullable<SimulatorPhoneDeviceProps['screenRef']>;
    renderContactDetail?: NonNullable<SimulatorPhoneDeviceProps['renderContactDetail']>;
    contactDetail?: NonNullable<SimulatorPhoneDeviceProps['contactDetail']>;
    renderIncomingCallExtra?: NonNullable<SimulatorPhoneDeviceProps['renderIncomingCallExtra']>;
    className?: NonNullable<SimulatorPhoneDeviceProps['className']>;
    screenClassNames?: NonNullable<SimulatorPhoneDeviceProps['screenClassNames']>;
}

export interface SimulatorDeviceUnsupportedRenderProps {
    value: unknown;
}

interface SimulatorDeviceOptions extends SimulatorDeviceRuntimePassthroughProps {
    /** Full-device simulator JSON (database/API `simulator_json` shape). */
    /**
     * Called when package contact save/delete updates `value.contacts`.
     * Host callbacks from `phone.contactDetail` run after `onChange`.
     */
    onChange?: (nextValue: SimulatorDevicePayload) => void;
    phone?: SimulatorDevicePhoneOptions;
    renderUnsupported?: (props: SimulatorDeviceUnsupportedRenderProps) => ReactNode;
}

export type SimulatorDeviceProps = SimulatorDeviceOptions &
    (
        | { value: SimulatorDevicePayload; datasource?: never }
        | { value?: never; datasource: SimulatorDatasource }
    );

function wrapContactDetailForDevice(
    value: SimulatorDevicePayload | undefined,
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
        const apply = () => {
            if (onChange != null && value != null)
                onChange(patchContactInDevicePayload(value, updated));
        };
        const result = contactDetail.onSave?.(updated, context);
        if (result) return Promise.resolve(result).then(apply);
        apply();
    };

    const invokeHostDelete = (
        current: SimulatorPhoneContactDetailValues,
        context: SimulatorPhoneContactDetailContext,
    ) => {
        const apply = () => {
            if (onChange != null && value != null)
                onChange(removeContactFromDevicePayload(value, current.id));
        };
        const result = contactDetail.onDelete?.(current, context);
        if (result) return Promise.resolve(result).then(apply);
        apply();
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
 *
 * Top-level props (except `value`, `onChange`, `phone`, `renderUnsupported`) are runtime
 * passthrough to `SimulatorWithSession` — e.g. `onSimulatorEvent`, `developerTools`,
 * `initialContactsSearch`, exit chrome, and render slots.
 */
export default function SimulatorDevice({
    value,
    datasource,
    onChange,
    phone,
    renderUnsupported,
    ...runtimeProps
}: Readonly<SimulatorDeviceProps>) {
    if (value !== undefined && datasource !== undefined)
        throw new Error('Supply either value or datasource, not both.');
    const kind = datasource
        ? SimulatorDeviceKind.PhoneFullDevice
        : resolveSimulatorDeviceKind(value);

    const sessionPayload = useMemo(() => {
        if (datasource) return simulatorDatasourceToPayload(datasource);
        if (kind !== SimulatorDeviceKind.PhoneFullDevice || value === undefined) {
            return null;
        }
        return fullDeviceToPayload(value);
    }, [kind, value, datasource]);

    const [state, setState] = useState<SimulatorSessionState | null>(() =>
        sessionPayload == null ? null : getInitialSessionState(sessionPayload),
    );

    useEffect(() => {
        if (sessionPayload == null) {
            setState(null);
            return;
        }
        setState((previous) =>
            datasource && previous
                ? updateSimulatorPayload(previous, sessionPayload)
                : getInitialSessionState(sessionPayload),
        );
    }, [sessionPayload, datasource]);

    const dispatch = useCallback((action: SimulatorDispatchAction) => {
        setState((prev) =>
            prev == null ? prev : simulatorSessionReducerWithLogging(prev, action),
        );
    }, []);

    const deviceContactDetail = useMemo(
        () => wrapContactDetailForDevice(value, onChange, phone?.contactDetail),
        [value, onChange, phone?.contactDetail],
    );

    if (kind === SimulatorDeviceKind.Unsupported) {
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
            {...runtimeProps}
            state={state}
            dispatch={dispatch}
            renderContactDetail={phone?.renderContactDetail}
            contactDetail={deviceContactDetail}
            renderIncomingCallExtra={phone?.renderIncomingCallExtra}
            className={phone?.className}
            screenClassNames={phone?.screenClassNames}
            screenRef={phone?.screenRef ?? runtimeProps.screenRef}
            onEmailAction={phone?.onEmailAction ?? runtimeProps.onEmailAction}
        />
    );
}
