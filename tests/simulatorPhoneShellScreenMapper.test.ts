import { describe, expect, it } from 'vitest';

import {
    SIMULATOR_DEVICE_SCREEN_CLASS_NAMES,
    SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES,
    resolveSimulatorPhoneShellHostMode,
    resolveSimulatorPhoneShellScreenClasses,
} from '../src/simulatorPhoneShellScreenMapper.js';
import { buildState } from './support/sessionFixtures.js';

function pairedScreenClasses(
    key: keyof typeof SIMULATOR_DEVICE_SCREEN_CLASS_NAMES,
): string[] {
    return [
        SIMULATOR_DEVICE_SCREEN_CLASS_NAMES[key],
        SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES[key],
    ];
}

describe('SIMULATOR_DEVICE_SCREEN_CLASS_NAMES', () => {
    it('matches expected CSS class strings', () => {
        expect(SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.phoneHistory).toBe(
            'simulator-phone-shell--screen-phone-history',
        );
        expect(SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.phoneContacts).toBe(
            'simulator-phone-shell--screen-phone-contacts',
        );
        expect(SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.phoneDial).toBe(
            'simulator-phone-shell--screen-phone-dial',
        );
        expect(SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.phoneIncomingCall).toBe(
            'simulator-phone-shell--screen-phone-incoming-call',
        );
        expect(SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.phoneContactDetail).toBe(
            'simulator-phone-shell--screen-phone-contact-detail',
        );
        expect(SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.messagesThreads).toBe(
            'simulator-phone-shell--screen-messages-threads',
        );
        expect(SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.messagesThreadDetail).toBe(
            'simulator-phone-shell--screen-messages-thread-detail',
        );
        expect(SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.emailInbox).toBe(
            'simulator-phone-shell--screen-email-inbox',
        );
        expect(SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.emailOutbox).toBe(
            'simulator-phone-shell--screen-email-outbox',
        );
        expect(SIMULATOR_DEVICE_SCREEN_CLASS_NAMES.emailTrash).toBe(
            'simulator-phone-shell--screen-email-trash',
        );
    });
});

describe('SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES', () => {
    it('matches expected device-shell screen modifier aliases', () => {
        expect(SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.phoneHistory).toBe(
            'simulator-device-shell--screen-phone-history',
        );
        expect(SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.phoneContacts).toBe(
            'simulator-device-shell--screen-phone-contacts',
        );
        expect(SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.phoneDial).toBe(
            'simulator-device-shell--screen-phone-dial',
        );
        expect(SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.phoneIncomingCall).toBe(
            'simulator-device-shell--screen-phone-incoming-call',
        );
        expect(SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.phoneContactDetail).toBe(
            'simulator-device-shell--screen-phone-contact-detail',
        );
        expect(SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.messagesThreads).toBe(
            'simulator-device-shell--screen-messages-threads',
        );
        expect(SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.messagesThreadDetail).toBe(
            'simulator-device-shell--screen-messages-thread-detail',
        );
        expect(SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.emailInbox).toBe(
            'simulator-device-shell--screen-email-inbox',
        );
        expect(SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.emailOutbox).toBe(
            'simulator-device-shell--screen-email-outbox',
        );
        expect(SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES.emailTrash).toBe(
            'simulator-device-shell--screen-email-trash',
        );
    });
});

describe('resolveSimulatorPhoneShellScreenClasses', () => {
    it('returns phone screen classes for history, contacts, dial, and incoming call', () => {
        expect(
            resolveSimulatorPhoneShellScreenClasses(
                buildState({
                    activeApp: 'phone',
                    showPrimaryMenu: false,
                    phone: { screen: 'history', stack: [], chosenIndex: null },
                }),
            ),
        ).toEqual(pairedScreenClasses('phoneHistory'));

        expect(
            resolveSimulatorPhoneShellScreenClasses(
                buildState({
                    activeApp: 'phone',
                    showPrimaryMenu: false,
                    phone: { screen: 'contacts', stack: [], chosenIndex: null },
                }),
            ),
        ).toEqual(pairedScreenClasses('phoneContacts'));

        expect(
            resolveSimulatorPhoneShellScreenClasses(
                buildState({
                    activeApp: 'phone',
                    showPrimaryMenu: false,
                    phone: { screen: 'dial', stack: [], chosenIndex: null },
                }),
            ),
        ).toEqual(pairedScreenClasses('phoneDial'));

        expect(
            resolveSimulatorPhoneShellScreenClasses(
                buildState({
                    activeApp: 'phone',
                    showPrimaryMenu: false,
                    phone: { screen: 'incoming_call', stack: [], chosenIndex: null },
                }),
            ),
        ).toEqual(pairedScreenClasses('phoneIncomingCall'));
    });

    it('returns messages screen classes for threads and thread detail', () => {
        expect(
            resolveSimulatorPhoneShellScreenClasses(
                buildState({
                    activeApp: 'messages',
                    showPrimaryMenu: false,
                    messages: { screen: 'threads', stack: [], visibleCount: 0 },
                }),
            ),
        ).toEqual(pairedScreenClasses('messagesThreads'));

        expect(
            resolveSimulatorPhoneShellScreenClasses(
                buildState({
                    activeApp: 'messages',
                    showPrimaryMenu: false,
                    messages: { screen: 'thread_detail', stack: [], visibleCount: 2 },
                }),
            ),
        ).toEqual(pairedScreenClasses('messagesThreadDetail'));
    });

    it('returns email folder screen classes', () => {
        expect(
            resolveSimulatorPhoneShellScreenClasses(
                buildState({
                    activeApp: 'email',
                    showPrimaryMenu: false,
                    email: { screen: 'list', stack: [], selectedMessageId: null },
                }),
            ),
        ).toEqual(pairedScreenClasses('emailInbox'));

        expect(
            resolveSimulatorPhoneShellScreenClasses(
                buildState({
                    activeApp: 'email',
                    showPrimaryMenu: false,
                    email: { screen: 'outbox', stack: [], selectedMessageId: null },
                }),
            ),
        ).toEqual(pairedScreenClasses('emailOutbox'));

        expect(
            resolveSimulatorPhoneShellScreenClasses(
                buildState({
                    activeApp: 'email',
                    showPrimaryMenu: false,
                    email: { screen: 'trash', stack: [], selectedMessageId: null },
                }),
            ),
        ).toEqual(pairedScreenClasses('emailTrash'));
    });

    it('includes phone contact detail class when hostMode is phone-contact-edit', () => {
        const contactsState = buildState({
            activeApp: 'phone',
            showPrimaryMenu: false,
            phone: { screen: 'contacts', stack: [], chosenIndex: null },
        });

        expect(
            resolveSimulatorPhoneShellScreenClasses(contactsState, {
                kind: 'phone-contact-edit',
                contactId: 'alice',
            }),
        ).toEqual([
            ...pairedScreenClasses('phoneContacts'),
            ...pairedScreenClasses('phoneContactDetail'),
        ]);
    });
});

describe('resolveSimulatorPhoneShellHostMode', () => {
    function contactsStateWithPayload(contacts: Array<{ id: string; displayName: string; number?: string }>) {
        return {
            ...buildState({
                activeApp: 'phone',
                showPrimaryMenu: false,
                phone: { screen: 'contacts', stack: [], chosenIndex: null },
            }),
            payload: {
                ...buildState().payload,
                contacts,
            },
        };
    }

    it('returns runtime when selectedContactId is null', () => {
        const state = contactsStateWithPayload([
            { id: 'alice', displayName: 'Alice Chen', number: '+1-555-100-2000' },
        ]);
        expect(resolveSimulatorPhoneShellHostMode(state, null)).toEqual({ kind: 'runtime' });
    });

    it('returns runtime when selectedContactId is missing from payload.contacts', () => {
        const state = contactsStateWithPayload([
            { id: 'alice', displayName: 'Alice Chen', number: '+1-555-100-2000' },
        ]);
        expect(resolveSimulatorPhoneShellHostMode(state, 'missing')).toEqual({ kind: 'runtime' });
    });

    it('returns runtime when not on the phone contacts screen', () => {
        const state = {
            ...contactsStateWithPayload([
                { id: 'alice', displayName: 'Alice Chen', number: '+1-555-100-2000' },
            ]),
            view: buildState({
                activeApp: 'phone',
                showPrimaryMenu: false,
                phone: { screen: 'history', stack: [], chosenIndex: null },
            }).view,
        };
        expect(resolveSimulatorPhoneShellHostMode(state, 'alice')).toEqual({ kind: 'runtime' });
    });

    it('returns phone-contact-edit when selectedContactId is valid on phone contacts', () => {
        const state = contactsStateWithPayload([
            { id: 'alice', displayName: 'Alice Chen', number: '+1-555-100-2000' },
        ]);
        expect(resolveSimulatorPhoneShellHostMode(state, 'alice')).toEqual({
            kind: 'phone-contact-edit',
            contactId: 'alice',
        });
    });
});
