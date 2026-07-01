/**
 * Host phone shell screen modifier classes and host overlay mode from session state.
 *
 * Screen modifiers: resolveSimulatorPhoneShellScreenClasses emits BOTH
 * SIMULATOR_DEVICE_SCREEN_CLASS_NAMES (simulator-phone-shell--screen-*) and
 * SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES (simulator-device-shell--screen-*).
 * Host CSS should target simulator-device-shell--screen-* only.
 * Remove simulator-phone-shell--screen-* once host/theme CSS no longer reference them.
 */
import type { SimulatorSessionState } from '@signalsafe/simulator-react';

/** Host overlay replacing runtime screen content (e.g. host-owned contact detail). */
export type SimulatorPhoneShellHostMode =
    | { kind: 'runtime' }
    | { kind: 'phone-contact-edit'; contactId: string };

/** Stable shell screen modifier classes for host CSS (no CSS is shipped). */
export const SIMULATOR_DEVICE_SCREEN_CLASS_NAMES = {
    phoneHistory: 'simulator-phone-shell--screen-phone-history',
    phoneContacts: 'simulator-phone-shell--screen-phone-contacts',
    phoneDial: 'simulator-phone-shell--screen-phone-dial',
    phoneIncomingCall: 'simulator-phone-shell--screen-phone-incoming-call',
    phoneContactDetail: 'simulator-phone-shell--screen-phone-contact-detail',
    messagesThreads: 'simulator-phone-shell--screen-messages-threads',
    messagesThreadDetail: 'simulator-phone-shell--screen-messages-thread-detail',
    emailInbox: 'simulator-phone-shell--screen-email-inbox',
    emailOutbox: 'simulator-phone-shell--screen-email-outbox',
    emailTrash: 'simulator-phone-shell--screen-email-trash',
} as const;

/** Device-shell screen modifier aliases alongside legacy phone-shell names. */
export const SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES = {
    phoneHistory: 'simulator-device-shell--screen-phone-history',
    phoneContacts: 'simulator-device-shell--screen-phone-contacts',
    phoneDial: 'simulator-device-shell--screen-phone-dial',
    phoneIncomingCall: 'simulator-device-shell--screen-phone-incoming-call',
    phoneContactDetail: 'simulator-device-shell--screen-phone-contact-detail',
    messagesThreads: 'simulator-device-shell--screen-messages-threads',
    messagesThreadDetail: 'simulator-device-shell--screen-messages-thread-detail',
    emailInbox: 'simulator-device-shell--screen-email-inbox',
    emailOutbox: 'simulator-device-shell--screen-email-outbox',
    emailTrash: 'simulator-device-shell--screen-email-trash',
} as const;

const DEFAULT_HOST_MODE: SimulatorPhoneShellHostMode = { kind: 'runtime' };

export function resolveSimulatorPhoneShellHostMode(
    state: SimulatorSessionState,
    selectedContactId: string | null,
): SimulatorPhoneShellHostMode {
    if (selectedContactId == null) {
        return { kind: 'runtime' };
    }

    if (state.view?.activeApp !== 'phone' || state.view.phone?.screen !== 'contacts') {
        return { kind: 'runtime' };
    }

    const contact = state.payload.contacts?.find((entry) => entry.id === selectedContactId);
    if (contact == null) {
        return { kind: 'runtime' };
    }

    return { kind: 'phone-contact-edit', contactId: contact.id };
}

function appendPhoneScreenClasses(
    classes: string[],
    view: SimulatorSessionState['view'],
    screen: NonNullable<NonNullable<SimulatorSessionState['view']>['phone']>['screen'],
    phoneShellClass: string,
    deviceShellClass: string,
): void {
    if (view?.activeApp === 'phone' && view.phone?.screen === screen) {
        classes.push(phoneShellClass, deviceShellClass);
    }
}

function appendEmailScreenClasses(classes: string[], view: SimulatorSessionState['view']): void {
    if (view?.activeApp !== 'email') {
        return;
    }

    const screen = view.email?.screen;
    if (screen === 'list') {
        classes.push(
            SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.emailInbox,
            SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.emailInbox,
        );
    } else if (screen === 'outbox') {
        classes.push(
            SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.emailOutbox,
            SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.emailOutbox,
        );
    } else if (screen === 'trash') {
        classes.push(
            SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.emailTrash,
            SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.emailTrash,
        );
    }
}

/** Shell screen modifier classes derived from session view and host overlay mode. */
export function resolveSimulatorPhoneShellScreenClasses(
    state: SimulatorSessionState,
    hostMode: SimulatorPhoneShellHostMode = DEFAULT_HOST_MODE,
): string[] {
    const classes: string[] = [];
    const view = state.view;

    appendPhoneScreenClasses(
        classes,
        view,
        'history',
        SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.phoneHistory,
        SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.phoneHistory,
    );
    appendPhoneScreenClasses(
        classes,
        view,
        'contacts',
        SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.phoneContacts,
        SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.phoneContacts,
    );
    appendPhoneScreenClasses(
        classes,
        view,
        'dial',
        SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.phoneDial,
        SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.phoneDial,
    );
    appendPhoneScreenClasses(
        classes,
        view,
        'incoming_call',
        SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.phoneIncomingCall,
        SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.phoneIncomingCall,
    );

    if (hostMode.kind === 'phone-contact-edit') {
        classes.push(
            SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.phoneContactDetail,
            SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.phoneContactDetail,
        );
    }

    if (view?.activeApp === 'messages' && view.messages?.screen === 'threads') {
        classes.push(
            SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.messagesThreads,
            SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.messagesThreads,
        );
    }

    if (view?.activeApp === 'messages' && view.messages?.screen === 'thread_detail') {
        classes.push(
            SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.messagesThreadDetail,
            SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.messagesThreadDetail,
        );
    }

    appendEmailScreenClasses(classes, view);

    return classes;
}
