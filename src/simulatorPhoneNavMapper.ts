/**
 * Host phone navigation model derived from @signalsafe/simulator-react session state.
 * Mirrors package PhoneSimulatorShell / useSimulatorSecondaryMenu behavior using dispatch actions.
 */
import type { SimulatorChannel, SimulatorDispatchAction, SimulatorSessionState, SimulatorViewState } from '@signalsafe/simulator-react';
import { switchChannelAction, viewStateToActiveChannel } from '@signalsafe/simulator-react';

export interface SimulatorPhoneNavItemModel {
    id: string;
    label: string;
    icon?: string;
    action: 'channel' | 'local' | 'back';
    channel?: SimulatorChannel;
}

export type SimulatorPhoneNavModel =
    | { mode: 'hidden' }
    | {
          mode: 'primary';
          items: SimulatorPhoneNavItemModel[];
          activeChannel: SimulatorChannel;
      }
    | {
          mode: 'secondary';
          app: 'phone' | 'email';
          items: SimulatorPhoneNavItemModel[];
          activeId: string;
      };

/** Primary bottom tabs — aligned with package PhoneSimulatorShell PRIMARY_CHANNELS. */
export const SIMULATOR_PRIMARY_NAV_ITEMS: ReadonlyArray<{
    channel: SimulatorChannel;
    label: string;
    icon: string;
}> = [
    { channel: 'contacts', label: 'Phone', icon: '📞' },
    { channel: 'email', label: 'Email', icon: '📧' },
    { channel: 'browser', label: 'Internet', icon: '🌐' },
    { channel: 'sms', label: 'Messages', icon: '💬' },
    { channel: 'home', label: 'Home', icon: '🏠' },
];

const EMAIL_SECONDARY_ITEMS = [
    { id: 'list', label: 'Inbox', icon: '📥' },
    { id: 'outbox', label: 'Outbox', icon: '📤' },
    { id: 'trash', label: 'Trash', icon: '🗑️' },
    { id: 'back', label: 'Back', icon: '↩' },
] as const;

const PHONE_SECONDARY_ITEMS = [
    { id: 'history', label: 'History', icon: '🕐' },
    { id: 'contacts', label: 'Contacts', icon: '👤' },
    { id: 'dial', label: 'Dial', icon: '📞' },
    { id: 'back', label: 'Back', icon: '↩' },
] as const;

function getPhoneSecondaryActiveId(screen: string): string {
    if (screen === 'add_contact' || screen === 'directory') {
        return 'contacts';
    }
    if (screen === 'incoming_call' || screen === 'voicemail') {
        return 'history';
    }
    return screen;
}

function getEmailSecondaryActiveId(screen: string, stack: string[]): string {
    if (screen === 'list' || screen === 'outbox' || screen === 'trash') {
        return screen;
    }
    return stack.at(-1) ?? 'list';
}

function getScreenForNavHideCheck(view: SimulatorViewState): string | null {
    const app = view.activeApp;
    if (app == null) {
        return null;
    }
    switch (app) {
        case 'phone':
            return view.phone?.screen ?? null;
        case 'email':
            return view.email?.screen ?? null;
        case 'messages':
            return view.messages?.screen ?? null;
        case 'internet':
            return view.internet?.screen ?? null;
        case 'home':
            return view.home?.screen ?? null;
        default:
            return null;
    }
}

/** Same hide rules as SimulatorWithSession → PhoneSimulatorShell hideBottomNav. */
export function shouldHideHostPhoneNav(state: SimulatorSessionState): boolean {
    const view = state.view;
    if (view == null) {
        return true;
    }
    const screen = getScreenForNavHideCheck(view);
    if (screen == null) {
        return true;
    }
    return (
        (view.activeApp === 'messages' && (screen === 'thread_detail' || screen === 'new_thread')) ||
        (view.activeApp === 'email' && screen === 'detail')
    );
}

export function resolveSimulatorPhoneNav(state: SimulatorSessionState): SimulatorPhoneNavModel {
    const view = state.view;
    if (view == null) {
        return { mode: 'hidden' };
    }

    if (shouldHideHostPhoneNav(state)) {
        return { mode: 'hidden' };
    }

    const activeApp = view.activeApp;
    const showSecondaryMenu = !view.showPrimaryMenu && (activeApp === 'phone' || activeApp === 'email');

    if (showSecondaryMenu && activeApp === 'phone') {
        return {
            mode: 'secondary',
            app: 'phone',
            activeId: getPhoneSecondaryActiveId(view.phone.screen),
            items: PHONE_SECONDARY_ITEMS.map((item) => ({
                id: item.id,
                label: item.label,
                icon: item.icon,
                action: item.id === 'back' ? 'back' : 'local',
            })),
        };
    }

    if (showSecondaryMenu && activeApp === 'email') {
        return {
            mode: 'secondary',
            app: 'email',
            activeId: getEmailSecondaryActiveId(view.email.screen, view.email.stack),
            items: EMAIL_SECONDARY_ITEMS.map((item) => ({
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
            label: item.label,
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
    state?: SimulatorSessionState,
): void {
    if (item.action === 'back') {
        if (
            model.mode === 'secondary' &&
            model.app === 'phone' &&
            state?.view.phone?.screen === 'contacts'
        ) {
            // ContactsView keeps selected contact in local state; remount via screen hop.
            dispatch({ type: 'NAV_LOCAL', app: 'phone', screen: 'history' });
            dispatch({ type: 'NAV_LOCAL', app: 'phone', screen: 'contacts' });
            return;
        }
        dispatch({ type: 'BACK_TO_PRIMARY' });
        return;
    }

    if (item.action === 'channel' && item.channel != null) {
        dispatch(switchChannelAction(item.channel));
        return;
    }

    if (item.action === 'local' && model.mode === 'secondary') {
        dispatch({ type: 'NAV_LOCAL', app: model.app, screen: item.id });
    }
}
