import { useCallback, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import {
    SimulatorWithSession,
    type SimulatorDispatchAction,
    type SimulatorPhoneIncomingCallExtraRenderProps,
    type SimulatorSessionContact,
    type SimulatorSessionState,
    type SimulatorWithSessionProps,
} from '@signalsafe/simulator-react';
import { renderPackageContactDetail } from './contact/renderPackageContactDetail.js';
import type { SimulatorPhoneDeviceContactDetailOptions } from './contact/contactDetailTypes.js';
import SimulatorPhoneNav from './SimulatorPhoneNav.js';
import SimulatorPhoneShell from './SimulatorPhoneShell.js';
import { renderPhoneIncomingCallHistoryExtra } from './incomingCall/renderPhoneIncomingCallHistoryExtra.js';
import { shouldHideHostPhoneNav } from './simulatorPhoneNavMapper.js';
import { resolveSimulatorPhoneShellScreenClasses } from './simulatorPhoneShellScreenMapper.js';
import { useSimulatorPhoneDeviceContactHost } from './useSimulatorPhoneDeviceContactHost.js';

export type {
    SimulatorPhoneContactDetailContext,
    SimulatorPhoneContactDetailFormProps,
    SimulatorPhoneContactDetailValues,
    SimulatorPhoneDeviceContactDetailOptions,
} from './contact/contactDetailTypes.js';

export interface SimulatorPhoneDeviceContactDetailRenderProps {
    contactId: string;
    contact: SimulatorSessionContact;
    onBack: () => void;
    state: SimulatorSessionState;
    dispatch: (action: SimulatorDispatchAction) => void;
}

type ManagedSimulatorWithSessionProps =
    | 'renderIncomingCallExtra'
    | 'hostOwnsPhoneContactDetail'
    | 'onPhoneContactOpen';

export interface SimulatorPhoneDeviceProps
    extends Omit<SimulatorWithSessionProps, ManagedSimulatorWithSessionProps> {
    /**
     * Lower-level escape hatch for fully custom contact detail UI.
     * Takes precedence over {@link contactDetail} when both are set.
     */
    renderContactDetail?: (props: SimulatorPhoneDeviceContactDetailRenderProps) => ReactNode;
    /** Package generic contact detail form options; omitted uses simulator-react built-in detail. */
    contactDetail?: SimulatorPhoneDeviceContactDetailOptions;
    /** Incoming-call slot below Answer/Ignore; defaults to caller history from this package. */
    renderIncomingCallExtra?: (
        props: SimulatorPhoneIncomingCallExtraRenderProps,
    ) => ReactNode;
    /** Optional wrapper class around the device shell. */
    className?: string;
    /** Extra shell screen modifier classes appended after session-derived classes. */
    screenClassNames?: string[];
}

function shouldClearHostContactSelection(action: SimulatorDispatchAction): boolean {
    return (
        (action.type === 'NAV_LOCAL' && action.app === 'phone') ||
        action.type === 'BACK_TO_PRIMARY'
    );
}

/** Full reusable phone device UI: shell, nav, runtime, and default incoming-call history. */
export default function SimulatorPhoneDevice({
    state,
    dispatch,
    renderContactDetail,
    contactDetail,
    renderIncomingCallExtra = renderPhoneIncomingCallHistoryExtra,
    className,
    screenClassNames: extraScreenClassNames = [],
    ...sessionProps
}: Readonly<SimulatorPhoneDeviceProps>) {
    const screenRef = useRef<HTMLDivElement>(null);
    const hostContactEnabled = renderContactDetail != null || contactDetail != null;
    const { hostMode, contact, clearSelection, onPhoneContactOpen } =
        useSimulatorPhoneDeviceContactHost(state, hostContactEnabled);
    const hideNav = shouldHideHostPhoneNav(state);

    const dispatchWithHostClear = useCallback(
        (action: SimulatorDispatchAction) => {
            if (hostContactEnabled && shouldClearHostContactSelection(action)) {
                clearSelection();
            }
            dispatch(action);
        },
        [dispatch, clearSelection, hostContactEnabled],
    );

    const screenClassNames = [
        ...resolveSimulatorPhoneShellScreenClasses(state, hostMode),
        ...extraScreenClassNames,
    ];

    const showHostContactDetail =
        hostContactEnabled && hostMode.kind === 'phone-contact-edit' && contact != null;

    const resolvedRenderContactDetail = useMemo(() => {
        if (renderContactDetail != null) {
            return renderContactDetail;
        }
        if (contactDetail == null) {
            return undefined;
        }
        return (props: SimulatorPhoneDeviceContactDetailRenderProps) =>
            renderPackageContactDetail({
                ...props,
                contactDetail,
            });
    }, [renderContactDetail, contactDetail]);

    const runtime = (
        <SimulatorWithSession
            {...sessionProps}
            state={state}
            dispatch={dispatchWithHostClear}
            renderIncomingCallExtra={renderIncomingCallExtra}
            hostOwnsPhoneContactDetail={hostContactEnabled ? true : undefined}
            onPhoneContactOpen={hostContactEnabled ? onPhoneContactOpen : undefined}
        />
    );

    const screenContent =
        showHostContactDetail && resolvedRenderContactDetail != null
            ? resolvedRenderContactDetail({
                  contactId: contact.id,
                  contact,
                  onBack: clearSelection,
                  state,
                  dispatch: dispatchWithHostClear,
              })
            : runtime;

    const shell = (
        <SimulatorPhoneShell
            useHostNav
            screenClassNames={screenClassNames}
            screenRef={screenRef}
            nav={
                hideNav ? undefined : (
                    <SimulatorPhoneNav state={state} dispatch={dispatchWithHostClear} />
                )
            }
        >
            {screenContent}
        </SimulatorPhoneShell>
    );

    if (className) {
        return <div className={className}>{shell}</div>;
    }

    return shell;
}
