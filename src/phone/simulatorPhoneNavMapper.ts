import {
    SimulatorEmailScreenId,
    SimulatorHomeScreenId,
    SimulatorMessagesScreenId,
} from '@signalsafe/simulator-core/devicePayload';
import { SimulatorDispatchActionType } from '@signalsafe/simulator-react/state/simulatorDispatchActions';
import { SimulatorApp } from '@signalsafe/simulator-core/simulatorApp';
import { getPhoneSecondaryItems } from '@signalsafe/simulator-react/utils/navigation/phoneLocalNavItems';
import {
    getEmailSecondaryItems,
    getPhoneSecondaryActiveId,
    getEmailSecondaryActiveId,
} from '@signalsafe/simulator-react/utils/navigation/simulatorSecondaryMenuHelpers';
import { shouldHideSimulatorNavigation } from '@signalsafe/simulator-react/utils/navigation/simulatorNavigationPolicy';
import { createTranslator, simulatorEnglish } from '@signalsafe/simulator-react/i18n/catalog';
import { switchChannelAction } from '@signalsafe/simulator-react/state/simulatorDispatchActions';
import { viewStateToActiveChannel } from '@signalsafe/simulator-react/types/session';
import type {
    SimulatorChannel,
    SimulatorSessionState,
} from '@signalsafe/simulator-react/types/session';
import type { SimulatorDispatchAction } from '@signalsafe/simulator-react/state/simulatorDispatchActions';
/**
 * Host phone navigation model derived from @signalsafe/simulator-react session state.
 * Mirrors package PhoneSimulatorShell / useSimulatorSecondaryMenu behavior using dispatch actions.
 */

export interface SimulatorPhoneNavItemModel {
    id: string;
    label: string;
    icon?: string;
    action: 'channel' | 'local' | 'back' | 'submit' | 'reply' | 'forward' | 'dispose';
    channel?: SimulatorChannel;
    disabled?: boolean;
}

export type SimulatorPhoneNavModel =
    | { mode: 'hidden' }
    | {
          mode: 'primary';
          items: SimulatorPhoneNavItemModel[];
          activeChannel: SimulatorChannel;
      }
    | {
          mode: 'secondary' | 'tertiary';
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
    { channel: 'contacts', label: defaultLocale.t('nav.phone'), icon: '📞' },
    { channel: 'email', label: defaultLocale.t('nav.email'), icon: '📧' },
    { channel: 'browser', label: defaultLocale.t('nav.internet'), icon: '🌐' },
    { channel: 'sms', label: defaultLocale.t('nav.messages'), icon: '💬' },
    { channel: 'home', label: defaultLocale.t('nav.home'), icon: '🏠' },
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
        return { mode: 'hidden' };
    }

    if (shouldHideHostPhoneNav(state)) {
        return { mode: 'hidden' };
    }

    const activeApp = view.activeApp;
    if (activeApp === SimulatorApp.Email && view.email.screen === SimulatorEmailScreenId.Compose) {
        return {
            mode: 'tertiary',
            app: SimulatorApp.Email,
            activeId: '',
            items: [
                {
                    id: 'send',
                    label: locale.t('nav.send'),
                    icon: '➤',
                    action: 'submit',
                    disabled: true,
                },
                { id: 'back', label: locale.t('nav.back'), icon: '↩', action: 'back' },
            ],
        };
    }
    if (activeApp === SimulatorApp.Email && view.email.screen === SimulatorEmailScreenId.Detail) {
        return {
            mode: 'tertiary',
            app: SimulatorApp.Email,
            activeId: '',
            items: [
                { id: 'reply', label: locale.t('nav.reply'), icon: '↪', action: 'reply' },
                { id: 'forward', label: locale.t('nav.forward'), icon: '➜', action: 'forward' },
                { id: 'dispose', label: locale.t('nav.dispose'), icon: '🗑', action: 'dispose' },
                { id: 'back', label: locale.t('nav.back'), icon: '↩', action: 'back' },
            ],
        };
    }

    if (
        activeApp === SimulatorApp.Messages &&
        (view.messages.screen === SimulatorMessagesScreenId.ThreadDetail ||
            view.messages.screen === SimulatorMessagesScreenId.NewThread)
    ) {
        return {
            mode: 'secondary',
            app: SimulatorApp.Messages,
            activeId: SimulatorMessagesScreenId.ThreadDetail,
            items: [
                {
                    id: 'send',
                    label: locale.t('nav.send'),
                    icon: '➤',
                    action: 'submit',
                    disabled: view.messages.screen === SimulatorMessagesScreenId.NewThread,
                },
                { id: 'back', label: locale.t('nav.back'), icon: '↩', action: 'back' },
            ],
        };
    }

    if (activeApp === SimulatorApp.Home && view.home.screen === SimulatorHomeScreenId.Settings) {
        return {
            mode: 'secondary',
            app: SimulatorApp.Home,
            activeId: SimulatorHomeScreenId.Settings,
            items: [
                { id: 'settings', label: locale.t('nav.settings'), icon: '⚙', action: 'local' },
                { id: 'back', label: locale.t('nav.back'), icon: '↩', action: 'back' },
            ],
        };
    }

    const showSecondaryMenu =
        !view.showPrimaryMenu &&
        (activeApp === SimulatorApp.Phone || activeApp === SimulatorApp.Email);

    if (showSecondaryMenu && activeApp === SimulatorApp.Phone) {
        return {
            mode: 'secondary',
            app: SimulatorApp.Phone,
            activeId: getPhoneSecondaryActiveId(view.phone.screen),
            items: getPhoneSecondaryItems(locale).map((item) => ({
                id: item.id,
                label: item.label,
                icon: item.icon,
                action: item.id === 'back' ? 'back' : 'local',
            })),
        };
    }

    if (showSecondaryMenu && activeApp === SimulatorApp.Email) {
        return {
            mode: 'secondary',
            app: SimulatorApp.Email,
            activeId: getEmailSecondaryActiveId(view.email.screen, view.email.stack),
            items: getEmailSecondaryItems(locale).map((item) => ({
                id: item.id,
                label: item.label,
                icon: item.icon,
                action: item.id === 'back' ? 'back' : 'local',
            })),
        };
    }

    const activeChannel = viewStateToActiveChannel(activeApp);
    return {
        mode: 'primary',
        activeChannel,
        items: SIMULATOR_PRIMARY_NAV_ITEMS.map((item) => ({
            id: item.channel,
            label: locale.t(primaryKeys[item.channel]),
            icon: item.icon,
            action: 'channel',
            channel: item.channel,
        })),
    };
}

export function dispatchSimulatorPhoneNavItem(
    dispatch: (action: SimulatorDispatchAction) => void,
    model: Exclude<SimulatorPhoneNavModel, { mode: 'hidden' }>,
    item: SimulatorPhoneNavItemModel,
    _state?: SimulatorSessionState,
): void {
    if (item.action === 'reply') {
        dispatch({
            type: SimulatorDispatchActionType.SimulatorAction,
            action: { type: 'send_reply' },
        });
        return;
    }
    if (item.action === 'back') {
        dispatch({ type: SimulatorDispatchActionType.Back });
        return;
    }

    if (item.action === 'channel' && item.channel != null) {
        dispatch(switchChannelAction(item.channel));
        return;
    }

    if (item.action === 'local' && model.mode === 'secondary') {
        dispatch({ type: SimulatorDispatchActionType.NavLocal, app: model.app, screen: item.id });
    }
}
