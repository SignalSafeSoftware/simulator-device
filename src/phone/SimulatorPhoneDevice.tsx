import { SimulatorPhoneScreenId } from '@signalsafe/simulator-core/devicePayload';
import {
    SimulatorDispatchActionType,
    type SimulatorDispatchAction,
} from '@signalsafe/simulator-react/state/simulatorDispatchActions';
import { SimulatorApp } from '@signalsafe/simulator-core/simulatorApp';
import {
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
    type RefCallback,
    type MutableRefObject,
} from 'react';
import SimulatorWithSession, {
    type SimulatorWithSessionProps,
} from '@signalsafe/simulator-react/SimulatorWithSession';
import {
    ComposerStateContext,
    type ComposerState,
} from '@signalsafe/simulator-react/contract/composerState';
import {
    EmailComposeContext,
    useEmailComposeOptions,
    type EmailComposeOptions,
} from '@signalsafe/simulator-react/contract/emailComposeContract';
import {
    MessageComposeContext,
    useMessageComposeOptions,
    type MessageComposeOptions,
} from '@signalsafe/simulator-react/contract/messageComposeContract';
import {
    PhoneDialDraftContext,
    usePhoneDialDraft,
    type PhoneDialDraft,
} from '@signalsafe/simulator-react/contract/phoneDialContract';
import {
    SimulatorCapabilitiesContext,
    useSimulatorCapabilities,
    type SimulatorActionCapabilities,
} from '@signalsafe/simulator-react/contract/capabilities';
import {
    simulatorDatasourceToPayload,
    updateSimulatorPayload,
    type SimulatorDatasource,
} from '@signalsafe/simulator-react/datasource/datasource';
import { createSimulatorNavigationDispatch } from '@signalsafe/simulator-react/contract/navigation';
import type { SimulatorPhoneIncomingCallExtraRenderProps } from '@signalsafe/simulator-react/ui/renderSlots';
import type {
    SimulatorSessionContact,
    SimulatorSessionState,
} from '@signalsafe/simulator-react/types/session';
import { renderPackageContactDetail } from '../contact/renderPackageContactDetail.js';
import type { SimulatorPhoneDeviceContactDetailOptions } from '../contact/contactDetailTypes.js';
import SimulatorPhoneNav, { type SimulatorPhoneNavProps } from './SimulatorPhoneNav.js';
import SimulatorPhoneShell from './SimulatorPhoneShell.js';
import { renderPhoneIncomingCallHistoryExtra } from '../incomingCall/renderPhoneIncomingCallHistoryExtra.js';
import { shouldHideHostPhoneNav } from './simulatorPhoneNavMapper.js';
import {
    SimulatorPhoneShellHostKind,
    resolveSimulatorPhoneShellScreenClasses,
} from './simulatorPhoneShellScreenMapper.js';
import { useSimulatorPhoneDeviceContactHost } from './useSimulatorPhoneDeviceContactHost.js';

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

/** Writes an element to a host-supplied callback or object ref. */
function assignElementRef(
    ref: RefCallback<HTMLDivElement> | MutableRefObject<HTMLDivElement | null> | undefined,
    element: HTMLDivElement | null,
): void {
    if (typeof ref === 'function') ref(element);
    else if (ref) ref.current = element;
}

export interface SimulatorPhoneDeviceProps extends Omit<
    SimulatorWithSessionProps,
    ManagedSimulatorWithSessionProps
> {
    /** Ref to this device’s actual scrollable screen; internal focus handling is preserved. */
    screenRef?: RefCallback<HTMLDivElement> | MutableRefObject<HTMLDivElement | null>;
    onEmailAction?: NonNullable<SimulatorPhoneNavProps['onEmailAction']>;
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
    renderIncomingCallExtra?: (props: SimulatorPhoneIncomingCallExtraRenderProps) => ReactNode;
    /** Optional wrapper class around the device shell. */
    className?: string;
    /** Extra shell screen modifier classes appended after session-derived classes. */
    screenClassNames?: string[];
}

function shouldClearHostContactSelection(action: SimulatorDispatchAction): boolean {
    return (
        (action.type === SimulatorDispatchActionType.NavLocal &&
            action.app === SimulatorApp.Phone) ||
        action.type === SimulatorDispatchActionType.BackToPrimary
    );
}

/** Full reusable phone device UI: shell, nav, runtime, and default incoming-call history. */
export default function SimulatorPhoneDevice({
    state: hostState,
    screenRef: hostScreenRef,
    datasource,
    onEmailAction,
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
    const [composerState, setComposerState] = useState<ComposerState | null>(null);
    const composerContext = useMemo(
        () => ({ state: composerState, update: setComposerState }),
        [composerState],
    );
    const inheritedEmail = useEmailComposeOptions();
    const returnContactId = useRef<string | null>(null);
    const inheritedMessages = useMessageComposeOptions();
    const inheritedDial = usePhoneDialDraft();
    const inheritedCapabilities = useSimulatorCapabilities();
    const resolvedCapabilities = useMemo(
        () => ({ ...inheritedCapabilities, ...capabilities }),
        [inheritedCapabilities, capabilities],
    );
    const payload = useMemo(
        () => (datasource ? simulatorDatasourceToPayload(datasource) : null),
        [datasource],
    );
    const state = useMemo(
        () => (payload ? updateSimulatorPayload(hostState, payload) : hostState),
        [hostState, payload],
    );
    const screenRef = useRef<HTMLDivElement | null>(null);
    const attachScreen = useCallback(
        (element: HTMLDivElement | null) => {
            screenRef.current = element;
            assignElementRef(hostScreenRef, element);
        },
        [hostScreenRef],
    );
    const stateRef = useRef(state);
    stateRef.current = state;
    const hostContactEnabled = renderContactDetail != null || contactDetail != null;
    const { hostMode, contact, clearSelection, onPhoneContactOpen } =
        useSimulatorPhoneDeviceContactHost(state, hostContactEnabled);
    const hideNav = shouldHideHostPhoneNav(state);

    const dispatchAndClear = useCallback(
        (action: SimulatorDispatchAction) => {
            if (action.type === SimulatorDispatchActionType.Back && contact) {
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

    const dispatchWithHostClear = useMemo(
        () =>
            createSimulatorNavigationDispatch({
                getState: () => stateRef.current,
                dispatch: dispatchAndClear,
                onNavigation,
                onNavigationEvent,
            }),
        [dispatchAndClear, onNavigation, onNavigationEvent],
    );

    const screenClassNames = [
        ...resolveSimulatorPhoneShellScreenClasses(state, hostMode),
        ...extraScreenClassNames,
    ];

    const showHostContactDetail =
        hostContactEnabled &&
        hostMode.kind === SimulatorPhoneShellHostKind.PhoneContactEdit &&
        contact != null;

    const selectedContactId = contact?.id;
    useLayoutEffect(() => {
        if (showHostContactDetail && selectedContactId) {
            returnContactId.current = selectedContactId;
            screenRef.current
                ?.querySelector<HTMLElement>('input:not([type="hidden"]), [tabindex="-1"], button')
                ?.focus();
        } else if (returnContactId.current) {
            if (
                state.view.activeApp === SimulatorApp.Phone &&
                state.view.phone.screen === SimulatorPhoneScreenId.Contacts
            ) {
                const rows = Array.from(
                    screenRef.current?.querySelectorAll<HTMLElement>(
                        '[data-simulator-contact-id]',
                    ) ?? [],
                );
                const row = rows.find(
                    (item) => item.dataset.simulatorContactId === returnContactId.current,
                );
                const button = row?.matches('button')
                    ? row
                    : row?.querySelector<HTMLButtonElement>('button');
                (
                    button ??
                    screenRef.current?.querySelector<HTMLInputElement>('input[type="search"]')
                )?.focus();
            }
            returnContactId.current = null;
        }
    }, [showHostContactDetail, selectedContactId, state.view.activeApp, state.view.phone.screen]);

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
            hostOwnsScreenActions={!hideNav}
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
        <ComposerStateContext.Provider value={composerContext}>
            <SimulatorCapabilitiesContext.Provider value={resolvedCapabilities}>
                <PhoneDialDraftContext.Provider value={dialDraft ?? inheritedDial}>
                    <MessageComposeContext.Provider value={messageCompose ?? inheritedMessages}>
                        <EmailComposeContext.Provider value={emailCompose ?? inheritedEmail}>
                            <SimulatorPhoneShell
                                useHostNav
                                screenClassNames={screenClassNames}
                                screenRef={attachScreen}
                                nav={
                                    hideNav ? undefined : (
                                        <SimulatorPhoneNav
                                            onEmailAction={onEmailAction}
                                            state={state}
                                            dispatch={dispatchWithHostClear}
                                        />
                                    )
                                }
                            >
                                {screenContent}
                            </SimulatorPhoneShell>
                        </EmailComposeContext.Provider>
                    </MessageComposeContext.Provider>
                </PhoneDialDraftContext.Provider>
            </SimulatorCapabilitiesContext.Provider>
        </ComposerStateContext.Provider>
    );

    if (className) {
        return <div className={className}>{shell}</div>;
    }

    return shell;
}
