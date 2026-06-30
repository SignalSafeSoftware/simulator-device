/**
 * Host phone shell screen modifier classes and host overlay mode from session state.
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

function appendPhoneScreenClass(
    classes: string[],
    view: SimulatorSessionState['view'],
    screen: NonNullable<NonNullable<SimulatorSessionState['view']>['phone']>['screen'],
    className: string,
): void {
    if (view?.activeApp === 'phone' && view.phone?.screen === screen) {
        classes.push(className);
    }
}

function appendEmailScreenClasses(classes: string[], view: SimulatorSessionState['view']): void {
    if (view?.activeApp !== 'email') {
        return;
    }

    const screen = view.email?.screen;
    if (screen === 'list') {
        classes.push(SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.emailInbox);
    } else if (screen === 'outbox') {
        classes.push(SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.emailOutbox);
    } else if (screen === 'trash') {
        classes.push(SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.emailTrash);
    }
}

/** Shell screen modifier classes derived from session view and host overlay mode. */
export function resolveSimulatorPhoneShellScreenClasses(
    state: SimulatorSessionState,
    hostMode: SimulatorPhoneShellHostMode = DEFAULT_HOST_MODE,
): string[] {
    const classes: string[] = [];
    const view = state.view;

    appendPhoneScreenClass(
        classes,
        view,
        'history',
        SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.phoneHistory,
    );
    appendPhoneScreenClass(
        classes,
        view,
        'contacts',
        SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.phoneContacts,
    );
    appendPhoneScreenClass(classes, view, 'dial', SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.phoneDial);
    appendPhoneScreenClass(
        classes,
        view,
        'incoming_call',
        SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.phoneIncomingCall,
    );

    if (hostMode.kind === 'phone-contact-edit') {
        classes.push(SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.phoneContactDetail);
    }

    if (view?.activeApp === 'messages' && view.messages?.screen === 'threads') {
        classes.push(SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.messagesThreads);
    }

    if (view?.activeApp === 'messages' && view.messages?.screen === 'thread_detail') {
        classes.push(SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.messagesThreadDetail);
    }

    appendEmailScreenClasses(classes, view);

    return classes;
}
