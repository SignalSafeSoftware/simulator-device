import {
    SimulatorEmailScreenId,
    SimulatorHomeScreenId,
    SimulatorMessagesScreenId,
} from '@signalsafe/simulator-core/devicePayload';
import {
    SimulatorDispatchActionType,
    switchChannelAction,
    type SimulatorDispatchAction,
} from '@signalsafe/simulator-react/state/simulatorDispatchActions';
import { SimulatorApp } from '@signalsafe/simulator-core/simulatorApp';
import { getPhoneSecondaryItems } from '@signalsafe/simulator-react/utils/navigation/phoneLocalNavItems';
import {
    getEmailSecondaryItems,
    getPhoneSecondaryActiveId,
    getEmailSecondaryActiveId,
} from '@signalsafe/simulator-react/utils/navigation/simulatorSecondaryMenuHelpers';
import { shouldHideSimulatorNavigation } from '@signalsafe/simulator-react/utils/navigation/simulatorNavigationPolicy';
import { createTranslator, simulatorEnglish } from '@signalsafe/simulator-react/i18n/catalog';
import {
    SimulatorChannel,
    viewStateToActiveChannel,
    type SimulatorSessionState,
} from '@signalsafe/simulator-react/types/session';
/**
 * Host phone navigation model derived from @signalsafe/simulator-react session state.
 * Mirrors package PhoneSimulatorShell / useSimulatorSecondaryMenu behavior using dispatch actions.
 */

const BACK_LABEL_KEY = 'nav.back';

export const SimulatorPhoneNavAction = Object.freeze({
    Channel: 'channel',
    Local: 'local',
    Back: 'back',
    Submit: 'submit',
    Reply: 'reply',
    Forward: 'forward',
    Dispose: 'dispose',
} as const);
export type SimulatorPhoneNavAction =
    (typeof SimulatorPhoneNavAction)[keyof typeof SimulatorPhoneNavAction];

export const SimulatorPhoneNavMode = Object.freeze({
    Hidden: 'hidden',
    Primary: 'primary',
    Secondary: 'secondary',
    Tertiary: 'tertiary',
} as const);

export interface SimulatorPhoneNavItemModel {
    id: string;
    label: string;
    icon?: string;
    action: SimulatorPhoneNavAction;
    channel?: SimulatorChannel;
    disabled?: boolean;
}

export type SimulatorPhoneNavModel =
    | { mode: typeof SimulatorPhoneNavMode.Hidden }
    | {
          mode: typeof SimulatorPhoneNavMode.Primary;
          items: SimulatorPhoneNavItemModel[];
          activeChannel: SimulatorChannel;
      }
    | {
          mode: typeof SimulatorPhoneNavMode.Secondary | typeof SimulatorPhoneNavMode.Tertiary;
          app:
              | typeof SimulatorApp.Phone
              | typeof SimulatorApp.Email
              | typeof SimulatorApp.Home
              | typeof SimulatorApp.Messages;
          items: SimulatorPhoneNavItemModel[];
          activeId: string;
      };

const defaultLocale = createTranslator(simulatorEnglish);

/** Primary bottom tabs — aligned with package PhoneSimulatorShell PRIMARY_CHANNELS. */
export const SIMULATOR_PRIMARY_NAV_ITEMS: ReadonlyArray<{
    channel: SimulatorChannel;
    label: string;
    icon: string;
}> = [
    { channel: SimulatorChannel.Contacts, label: defaultLocale.t('nav.phone'), icon: '📞' },
    { channel: SimulatorChannel.Email, label: defaultLocale.t('nav.email'), icon: '📧' },
    { channel: SimulatorChannel.Browser, label: defaultLocale.t('nav.internet'), icon: '🌐' },
    { channel: SimulatorChannel.Sms, label: defaultLocale.t('nav.messages'), icon: '💬' },
    { channel: SimulatorChannel.Home, label: defaultLocale.t('nav.home'), icon: '🏠' },
];

const primaryKeys = {
    phone: 'nav.phone',
    contacts: 'nav.phone',
    email: 'nav.email',
    browser: 'nav.internet',
    sms: 'nav.messages',
    home: 'nav.home',
} as const;

/** Host detail/composer navigation remains visible; scenarios use inline controls. */
export function shouldHideHostPhoneNav(state: SimulatorSessionState): boolean {
    return shouldHideSimulatorNavigation(state.view, 'host');
}

export function resolveSimulatorPhoneNav(
    state: SimulatorSessionState,
    locale = createTranslator(simulatorEnglish),
): SimulatorPhoneNavModel {
    const view = state.view;
    if (view == null) {
        return { mode: SimulatorPhoneNavMode.Hidden };
    }

    if (shouldHideHostPhoneNav(state)) {
        return { mode: SimulatorPhoneNavMode.Hidden };
    }

    const activeApp = view.activeApp;
    if (activeApp === SimulatorApp.Email && view.email.screen === SimulatorEmailScreenId.Compose) {
        return {
            mode: SimulatorPhoneNavMode.Tertiary,
            app: SimulatorApp.Email,
            activeId: '',
            items: [
                {
                    id: 'send',
                    label: locale.t('nav.send'),
                    icon: '➤',
                    action: SimulatorPhoneNavAction.Submit,
                    disabled: true,
                },
                {
                    id: SimulatorPhoneNavAction.Back,
                    label: locale.t(BACK_LABEL_KEY),
                    icon: '↩',
                    action: SimulatorPhoneNavAction.Back,
                },
            ],
        };
    }
    if (activeApp === SimulatorApp.Email && view.email.screen === SimulatorEmailScreenId.Detail) {
        return {
            mode: SimulatorPhoneNavMode.Tertiary,
            app: SimulatorApp.Email,
            activeId: '',
            items: [
                {
                    id: SimulatorPhoneNavAction.Reply,
                    label: locale.t('nav.reply'),
                    icon: '↪',
                    action: SimulatorPhoneNavAction.Reply,
                },
                {
                    id: SimulatorPhoneNavAction.Forward,
                    label: locale.t('nav.forward'),
                    icon: '➜',
                    action: SimulatorPhoneNavAction.Forward,
                },
                {
                    id: SimulatorPhoneNavAction.Dispose,
                    label: locale.t('nav.dispose'),
                    icon: '🗑',
                    action: SimulatorPhoneNavAction.Dispose,
                },
                {
                    id: SimulatorPhoneNavAction.Back,
                    label: locale.t(BACK_LABEL_KEY),
                    icon: '↩',
                    action: SimulatorPhoneNavAction.Back,
                },
            ],
        };
    }

    if (
        activeApp === SimulatorApp.Messages &&
        (view.messages.screen === SimulatorMessagesScreenId.ThreadDetail ||
            view.messages.screen === SimulatorMessagesScreenId.NewThread)
    ) {
        return {
            mode: SimulatorPhoneNavMode.Secondary,
            app: SimulatorApp.Messages,
            activeId: SimulatorMessagesScreenId.ThreadDetail,
            items: [
                {
                    id: 'send',
                    label: locale.t('nav.send'),
                    icon: '➤',
                    action: SimulatorPhoneNavAction.Submit,
                    disabled: view.messages.screen === SimulatorMessagesScreenId.NewThread,
                },
                {
                    id: SimulatorPhoneNavAction.Back,
                    label: locale.t(BACK_LABEL_KEY),
                    icon: '↩',
                    action: SimulatorPhoneNavAction.Back,
                },
            ],
        };
    }

    if (activeApp === SimulatorApp.Home && view.home.screen === SimulatorHomeScreenId.Settings) {
        return {
            mode: SimulatorPhoneNavMode.Secondary,
            app: SimulatorApp.Home,
            activeId: SimulatorHomeScreenId.Settings,
            items: [
                {
                    id: 'settings',
                    label: locale.t('nav.settings'),
                    icon: '⚙',
                    action: SimulatorPhoneNavAction.Local,
                },
                {
                    id: SimulatorPhoneNavAction.Back,
                    label: locale.t(BACK_LABEL_KEY),
                    icon: '↩',
                    action: SimulatorPhoneNavAction.Back,
                },
            ],
        };
    }

    const showSecondaryMenu =
        !view.showPrimaryMenu &&
        (activeApp === SimulatorApp.Phone || activeApp === SimulatorApp.Email);

    if (showSecondaryMenu && activeApp === SimulatorApp.Phone) {
        return {
            mode: SimulatorPhoneNavMode.Secondary,
            app: SimulatorApp.Phone,
            activeId: getPhoneSecondaryActiveId(view.phone.screen),
            items: getPhoneSecondaryItems(locale).map((item) => ({
                id: item.id,
                label: item.label,
                icon: item.icon,
                action:
                    item.id === SimulatorPhoneNavAction.Back
                        ? SimulatorPhoneNavAction.Back
                        : SimulatorPhoneNavAction.Local,
            })),
        };
    }

    if (showSecondaryMenu && activeApp === SimulatorApp.Email) {
        return {
            mode: SimulatorPhoneNavMode.Secondary,
            app: SimulatorApp.Email,
            activeId: getEmailSecondaryActiveId(view.email.screen, view.email.stack),
            items: getEmailSecondaryItems(locale).map((item) => ({
                id: item.id,
                label: item.label,
                icon: item.icon,
                action:
                    item.id === SimulatorPhoneNavAction.Back
                        ? SimulatorPhoneNavAction.Back
                        : SimulatorPhoneNavAction.Local,
            })),
        };
    }

    const activeChannel = viewStateToActiveChannel(activeApp);
    return {
        mode: SimulatorPhoneNavMode.Primary,
        activeChannel,
        items: SIMULATOR_PRIMARY_NAV_ITEMS.map((item) => ({
            id: item.channel,
            label: locale.t(primaryKeys[item.channel]),
            icon: item.icon,
            action: SimulatorPhoneNavAction.Channel,
            channel: item.channel,
        })),
    };
}

export function dispatchSimulatorPhoneNavItem(
    dispatch: (action: SimulatorDispatchAction) => void,
    model: Exclude<SimulatorPhoneNavModel, { mode: typeof SimulatorPhoneNavMode.Hidden }>,
    item: SimulatorPhoneNavItemModel,
    _state?: SimulatorSessionState,
): void {
    if (item.action === SimulatorPhoneNavAction.Reply) {
        dispatch({
            type: SimulatorDispatchActionType.SimulatorAction,
            action: { type: 'send_reply' },
        });
        return;
    }
    if (item.action === SimulatorPhoneNavAction.Back) {
        dispatch({ type: SimulatorDispatchActionType.Back });
        return;
    }

    if (item.action === SimulatorPhoneNavAction.Channel && item.channel != null) {
        dispatch(switchChannelAction(item.channel));
        return;
    }

    if (
        item.action === SimulatorPhoneNavAction.Local &&
        model.mode === SimulatorPhoneNavMode.Secondary
    ) {
        dispatch({ type: SimulatorDispatchActionType.NavLocal, app: model.app, screen: item.id });
    }
}
