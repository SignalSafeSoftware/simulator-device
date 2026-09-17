import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import {
    SimulatorWithSession,
    EmailComposeContext,
    MessageComposeContext,
    PhoneDialDraftContext,
    SimulatorCapabilitiesContext,
    useEmailComposeOptions,
    useMessageComposeOptions,
    usePhoneDialDraft,
    useSimulatorCapabilities,
    type MessageComposeOptions,
    type PhoneDialDraft,
    type SimulatorActionCapabilities,
    type EmailComposeOptions,
    simulatorDatasourceToPayload,
    updateSimulatorPayload,
    type SimulatorDatasource,
    createSimulatorNavigationDispatch,
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
    datasource?: SimulatorDatasource;
    emailCompose?: EmailComposeOptions;
    messageCompose?: MessageComposeOptions;
    dialDraft?: PhoneDialDraft;
    capabilities?: Partial<SimulatorActionCapabilities>;
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
    state: hostState,
    datasource,
    emailCompose,
    messageCompose,
    dialDraft,
    capabilities,
    dispatch: rawDispatch,
    onNavigation,
    onNavigationEvent,
    renderContactDetail,
    contactDetail,
    renderIncomingCallExtra = renderPhoneIncomingCallHistoryExtra,
    className,
    screenClassNames: extraScreenClassNames = [],
    ...sessionProps
}: Readonly<SimulatorPhoneDeviceProps>) {
    const inheritedEmail = useEmailComposeOptions();
    const returnContactId = useRef<string | null>(null);
    const inheritedMessages = useMessageComposeOptions();
    const inheritedDial = usePhoneDialDraft();
    const inheritedCapabilities = useSimulatorCapabilities();
    const resolvedCapabilities = useMemo(() => ({ ...inheritedCapabilities, ...capabilities }), [inheritedCapabilities, capabilities]);
    const payload = useMemo(() => datasource ? simulatorDatasourceToPayload(datasource) : null, [datasource]);
    const state = useMemo(() => payload ? updateSimulatorPayload(hostState, payload) : hostState, [hostState, payload]);
    const screenRef = useRef<HTMLDivElement>(null);
    const stateRef = useRef(state);
    stateRef.current = state;
    const hostContactEnabled = renderContactDetail != null || contactDetail != null;
    const { hostMode, contact, clearSelection, onPhoneContactOpen } =
        useSimulatorPhoneDeviceContactHost(state, hostContactEnabled);
    const hideNav = shouldHideHostPhoneNav(state);

    const dispatchAndClear = useCallback(
        (action: SimulatorDispatchAction) => {
            if (action.type === 'BACK' && contact) {
                clearSelection();
                return;
            }
            if (hostContactEnabled && shouldClearHostContactSelection(action)) {
                clearSelection();
            }
            rawDispatch(action);
        },
        [rawDispatch, clearSelection, hostContactEnabled, contact],
    );

    const dispatchWithHostClear = useMemo(() => createSimulatorNavigationDispatch({
        getState: () => stateRef.current, dispatch: dispatchAndClear, onNavigation, onNavigationEvent,
    }), [dispatchAndClear, onNavigation, onNavigationEvent]);

    const screenClassNames = [
        ...resolveSimulatorPhoneShellScreenClasses(state, hostMode),
        ...extraScreenClassNames,
    ];

    const showHostContactDetail =
        hostContactEnabled && hostMode.kind === 'phone-contact-edit' && contact != null;

    useLayoutEffect(() => {
        if (showHostContactDetail && contact) {
            returnContactId.current = contact.id;
            screenRef.current?.querySelector<HTMLElement>('input:not([type="hidden"]), [tabindex="-1"], button')?.focus();
        } else if (returnContactId.current) {
            if (state.view.activeApp === 'phone' && state.view.phone.screen === 'contacts') {
                const rows = Array.from(screenRef.current?.querySelectorAll<HTMLElement>('[data-simulator-contact-id]') ?? []);
                const row = rows.find(item => item.dataset.simulatorContactId === returnContactId.current);
                const button = row?.matches('button') ? row : row?.querySelector<HTMLButtonElement>('button');
                (button ?? screenRef.current?.querySelector<HTMLInputElement>('input[type="search"]'))?.focus();
            }
            returnContactId.current = null;
        }
    }, [showHostContactDetail, contact?.id, state.view.activeApp, state.view.phone.screen]);

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
        <SimulatorCapabilitiesContext.Provider value={resolvedCapabilities}>
        <PhoneDialDraftContext.Provider value={dialDraft ?? inheritedDial}>
        <MessageComposeContext.Provider value={messageCompose ?? inheritedMessages}>
        <EmailComposeContext.Provider value={emailCompose ?? inheritedEmail}>
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
        </EmailComposeContext.Provider>
        </MessageComposeContext.Provider>
        </PhoneDialDraftContext.Provider>
        </SimulatorCapabilitiesContext.Provider>
    );

    if (className) {
        return <div className={className}>{shell}</div>;
    }

    return shell;
}
