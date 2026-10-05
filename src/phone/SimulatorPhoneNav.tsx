import { SIM_ACTION_REASON } from '@signalsafe/simulator-react/ui/styles/semanticSimulatorClasses';
import { SIM_VISUALLY_HIDDEN } from '@signalsafe/simulator-react/ui/styles/simulatorClasses';
import {
    SimulatorEmailScreenId,
    SimulatorMessagesScreenId,
} from '@signalsafe/simulator-core/devicePayload';
import { SimulatorApp } from '@signalsafe/simulator-core/simulatorApp';
import { useId, useMemo, useRef } from 'react';
import { useSimulatorCapabilities } from '@signalsafe/simulator-react/contract/capabilities';
import { useComposerState } from '@signalsafe/simulator-react/contract/composerState';
import { useSimulatorLocale } from '@signalsafe/simulator-react/i18n/SimulatorLocale';
import { useMessageComposeOptions } from '@signalsafe/simulator-react/contract/messageComposeContract';
import { useEmailComposeOptions } from '@signalsafe/simulator-react/contract/emailComposeContract';
import {
    createSimulatorNavigationDispatch,
    type SimulatorNavigationOptions,
} from '@signalsafe/simulator-react/contract/navigation';
import type { SimulatorDispatchAction } from '@signalsafe/simulator-react/state/simulatorDispatchActions';
import type { SimulatorSessionState } from '@signalsafe/simulator-react/types/session';
import { SimulatorAppNavItem as SimulatorPhoneNavItem } from '@signalsafe/simulator-react/ui/navigation/SimulatorAppNavItem';
import { SIMULATOR_DEVICE_CLASS_NAMES as cls } from '../simulatorDeviceClasses.js';
import {
    dispatchSimulatorPhoneNavItem,
    resolveSimulatorPhoneNav,
    SimulatorPhoneNavAction,
    SimulatorPhoneNavMode,
    type SimulatorPhoneNavModel,
} from './simulatorPhoneNavMapper.js';

export interface SimulatorPhoneNavProps {
    /** Host owns forward/delete persistence; absent handlers leave actions unavailable. */
    onEmailAction?: (
        intent: typeof SimulatorPhoneNavAction.Forward | typeof SimulatorPhoneNavAction.Dispose,
        messageId: string | null,
    ) => void;
    state: SimulatorSessionState;
    onNavigation?: SimulatorNavigationOptions['onNavigation'];
    onNavigationEvent?: SimulatorNavigationOptions['onNavigationEvent'];
    dispatch: (action: SimulatorDispatchAction) => void;
}

function isActiveItem(
    model: Exclude<SimulatorPhoneNavModel, { mode: typeof SimulatorPhoneNavMode.Hidden }>,
    itemId: string,
): boolean {
    if (model.mode === SimulatorPhoneNavMode.Primary) {
        return model.activeChannel === itemId;
    }
    return model.activeId === itemId;
}

function useSendAvailability(state: SimulatorSessionState) {
    const { t } = useSimulatorLocale();
    const capabilities = useSimulatorCapabilities();
    const messageCompose = useMessageComposeOptions();
    const emailCompose = useEmailComposeOptions();
    const composingEmail =
        state.view.activeApp === SimulatorApp.Email &&
        state.view.email.screen === SimulatorEmailScreenId.Compose;
    const newMessage =
        state.view.activeApp === SimulatorApp.Messages &&
        state.view.messages.screen === SimulatorMessagesScreenId.NewThread;
    const sendCapability = composingEmail ? capabilities.sendEmail : capabilities.sendMessage;
    if (sendCapability && sendCapability.state !== 'enabled') {
        return { composingEmail, sendReason: sendCapability.reason };
    }
    if (composingEmail && !emailCompose?.onSend) {
        return { composingEmail, sendReason: t('email.unconfigured') };
    }
    if (newMessage && !messageCompose?.onSend) {
        return { composingEmail, sendReason: t('messages.unconfigured') };
    }
    return { composingEmail, sendReason: '' };
}

export default function SimulatorPhoneNav({
    state,
    onEmailAction,
    dispatch: rawDispatch,
    onNavigation,
    onNavigationEvent,
}: Readonly<SimulatorPhoneNavProps>) {
    const composer = useComposerState()?.state;
    const locale = useSimulatorLocale();
    const { t } = locale;
    const reasonId = useId();
    const { composingEmail, sendReason } = useSendAvailability(state);
    const stateRef = useRef(state);
    stateRef.current = state;
    const dispatch = useMemo(
        () =>
            onNavigation === undefined && onNavigationEvent === undefined
                ? rawDispatch
                : createSimulatorNavigationDispatch({
                      getState: () => stateRef.current,
                      dispatch: rawDispatch,
                      onNavigation,
                      onNavigationEvent,
                  }),
        [rawDispatch, onNavigation, onNavigationEvent],
    );
    const model = useMemo(() => resolveSimulatorPhoneNav(state, locale), [state, locale]);

    if (model.mode === SimulatorPhoneNavMode.Hidden) {
        return null;
    }

    const menuLabels = {
        primary: 'nav.simulatorChannels',
        secondary: 'nav.appSecondaryMenu',
        tertiary: 'nav.appTertiaryMenu',
    } as const;
    const ariaLabel = t(menuLabels[model.mode]);

    return (
        <nav
            className={cls.nav}
            aria-label={ariaLabel}
            data-testid='simulator-device-nav'
            data-nav-mode={model.mode}
        >
            <ul className={cls.navList}>
                {model.items.map((item) => (
                    <li key={item.id} className={cls.navItem}>
                        <SimulatorPhoneNavItem
                            label={item.label}
                            disabled={
                                composer?.pending ||
                                ((item.action === SimulatorPhoneNavAction.Forward ||
                                    item.action === SimulatorPhoneNavAction.Dispose) &&
                                    !onEmailAction) ||
                                (item.action === SimulatorPhoneNavAction.Submit
                                    ? Boolean(sendReason) || composer?.valid === false
                                    : item.disabled)
                            }
                            describedBy={
                                ((item.action === SimulatorPhoneNavAction.Forward ||
                                    item.action === SimulatorPhoneNavAction.Dispose) &&
                                    !onEmailAction) ||
                                (item.action === SimulatorPhoneNavAction.Submit && sendReason)
                                    ? reasonId
                                    : undefined
                            }
                            title={
                                item.action === SimulatorPhoneNavAction.Submit
                                    ? sendReason || undefined
                                    : undefined
                            }
                            icon={item.icon}
                            active={isActiveItem(model, item.id)}
                            ariaLabel={item.label}
                            onClick={(event) => {
                                if (
                                    item.action === SimulatorPhoneNavAction.Forward ||
                                    item.action === SimulatorPhoneNavAction.Dispose
                                ) {
                                    onEmailAction?.(
                                        item.action,
                                        state.view.email.selectedMessageId ??
                                            state.payload.email?.selectedMessageId ??
                                            null,
                                    );
                                } else if (item.action === SimulatorPhoneNavAction.Submit) {
                                    const form = event.currentTarget
                                        .closest('.simulator-device-shell')
                                        ?.querySelector<HTMLFormElement>(
                                            composingEmail
                                                ? 'form.simulator-email__composer'
                                                : 'form.simulator-messages__composer',
                                        );
                                    form?.requestSubmit();
                                } else dispatchSimulatorPhoneNavItem(dispatch, model, item, state);
                            }}
                        />
                    </li>
                ))}
            </ul>
            {!onEmailAction &&
                model.items.some(
                    (item) =>
                        item.action === SimulatorPhoneNavAction.Forward ||
                        item.action === SimulatorPhoneNavAction.Dispose,
                ) && (
                    <small id={reasonId} className={SIM_ACTION_REASON}>
                        {locale.t('app.mail.actionsUnavailable')}
                    </small>
                )}
            {model.items.some((item) => item.action === SimulatorPhoneNavAction.Submit) &&
                sendReason && (
                    <small
                        id={reasonId}
                        className={
                            state.view.activeApp === SimulatorApp.Messages
                                ? SIM_VISUALLY_HIDDEN
                                : SIM_ACTION_REASON
                        }
                    >
                        {sendReason}
                    </small>
                )}
        </nav>
    );
}
