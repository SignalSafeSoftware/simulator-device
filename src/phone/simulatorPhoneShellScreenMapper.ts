import {
    SimulatorEmailScreenId,
    SimulatorMessagesScreenId,
    SimulatorPhoneScreenId,
} from '@signalsafe/simulator-core/devicePayload';
import { SimulatorApp } from '@signalsafe/simulator-core/simulatorApp';
/**
 * Host phone shell screen modifier classes and host overlay mode from session state.
 *
 */
import type { SimulatorSessionState } from '@signalsafe/simulator-react/types/session';

export const SimulatorPhoneShellHostKind = Object.freeze({
    Runtime: 'runtime',
    PhoneContactEdit: 'phone-contact-edit',
} as const);

/** Host overlay replacing runtime screen content (e.g. host-owned contact detail). */
export type SimulatorPhoneShellHostMode =
    | { kind: typeof SimulatorPhoneShellHostKind.Runtime }
    | { kind: typeof SimulatorPhoneShellHostKind.PhoneContactEdit; contactId: string };

/** Canonical device-shell screen modifier classes. */
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

const DEFAULT_HOST_MODE: SimulatorPhoneShellHostMode = {
    kind: SimulatorPhoneShellHostKind.Runtime,
};

export function resolveSimulatorPhoneShellHostMode(
    state: SimulatorSessionState,
    selectedContactId: string | null,
): SimulatorPhoneShellHostMode {
    if (selectedContactId == null) {
        return { kind: SimulatorPhoneShellHostKind.Runtime };
    }

    if (
        state.view?.activeApp !== SimulatorApp.Phone ||
        state.view.phone?.screen !== SimulatorPhoneScreenId.Contacts
    ) {
        return { kind: SimulatorPhoneShellHostKind.Runtime };
    }

    const contact = state.payload.contacts?.find((entry) => entry.id === selectedContactId);
    if (contact == null) {
        return { kind: SimulatorPhoneShellHostKind.Runtime };
    }

    return { kind: SimulatorPhoneShellHostKind.PhoneContactEdit, contactId: contact.id };
}

function appendPhoneScreenClasses(
    classes: string[],
    view: SimulatorSessionState['view'],
    screen: NonNullable<NonNullable<SimulatorSessionState['view']>['phone']>['screen'],
    deviceShellClass: string,
): void {
    if (view?.activeApp === SimulatorApp.Phone && view.phone?.screen === screen) {
        classes.push(deviceShellClass);
    }
}

function appendEmailScreenClasses(classes: string[], view: SimulatorSessionState['view']): void {
    if (view?.activeApp !== SimulatorApp.Email) {
        return;
    }

    const screen = view.email?.screen;
    if (screen === SimulatorEmailScreenId.List) {
        classes.push(SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.emailInbox);
    } else if (screen === SimulatorEmailScreenId.Outbox) {
        classes.push(SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.emailOutbox);
    } else if (screen === SimulatorEmailScreenId.Trash) {
        classes.push(SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.emailTrash);
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
        SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.phoneHistory,
    );
    appendPhoneScreenClasses(
        classes,
        view,
        'contacts',
        SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.phoneContacts,
    );
    appendPhoneScreenClasses(
        classes,
        view,
        'dial',
        SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.phoneDial,
    );
    appendPhoneScreenClasses(
        classes,
        view,
        'incoming_call',
        SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.phoneIncomingCall,
    );

    if (hostMode.kind === SimulatorPhoneShellHostKind.PhoneContactEdit) {
        classes.push(SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.phoneContactDetail);
    }

    if (
        view?.activeApp === SimulatorApp.Messages &&
        view.messages?.screen === SimulatorMessagesScreenId.Threads
    ) {
        classes.push(SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.messagesThreads);
    }

    if (
        view?.activeApp === SimulatorApp.Messages &&
        view.messages?.screen === SimulatorMessagesScreenId.ThreadDetail
    ) {
        classes.push(SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.messagesThreadDetail);
    }

    appendEmailScreenClasses(classes, view);

    return classes;
}
