import { useCallback, useMemo, useReducer, useState } from 'react';
import { isSupportedCountry, parsePhoneNumberFromString } from 'libphonenumber-js';
import { createSimulatorId } from '@signalsafe/simulator-core/apps/id';
import { SimulatorMessagesScreenId } from '@signalsafe/simulator-core/devicePayload';
import { SimulatorApp } from '@signalsafe/simulator-core/simulatorApp';
import { fullDeviceToPayload } from '@signalsafe/simulator-react/adapters/deviceToSession';
import type { RegionalPreferences } from '@signalsafe/simulator-react/apps/settings/regionalFormats';
import type {
    MessageComposeDraft,
    MessageComposeOptions,
} from '@signalsafe/simulator-react/contract/messageComposeContract';
import { updateSimulatorPayload } from '@signalsafe/simulator-react/datasource/datasource';
import { getInitialSessionState } from '@signalsafe/simulator-react/state/simulatorSessionInitialState';
import { simulatorSessionReducer } from '@signalsafe/simulator-react/state/simulatorSessionReducer';
import {
    SimulatorDispatchActionType,
    type SimulatorDispatchAction,
} from '@signalsafe/simulator-react/state/simulatorDispatchActions';
import {
    MessageSender,
    SmsMode,
    type SimulatorSessionState,
    type SimulatorSmsPayload,
} from '@signalsafe/simulator-react/types/session';
import { SimulatorActionType } from '@signalsafe/simulator-react/utils/telemetry/simulatorActionTaxonomy';
import { createDemoDevice } from './demoData';
import { createDemoConversations, type DemoConversation } from './demoMessages';
import {
    createDemoContacts,
    createDemoContactRecords,
    toSessionContact,
    type DemoContact,
} from './demoContacts';

interface DemoSessionModel {
    session: SimulatorSessionState;
    conversations: DemoConversation[];
    contacts: DemoContact[];
    selectedId: string;
}

const DemoActionType = {
    Session: 'session',
    Compose: 'compose',
    SaveContact: 'save-contact',
    DeleteContact: 'delete-contact',
} as const;
type DemoAction =
    | { type: typeof DemoActionType.SaveContact; contact: DemoContact }
    | { type: typeof DemoActionType.DeleteContact; id: string }
    | { type: typeof DemoActionType.Session; action: SimulatorDispatchAction; timestamp: string }
    | {
          type: typeof DemoActionType.Compose;
          draft: MessageComposeDraft;
          timestamp: string;
          id: string;
      };

const emptyDraft = (): MessageComposeDraft => ({ phoneNumber: '', messageBody: '' });
function canonicalRecipient(value: string, country: string): string {
    const parsed = parsePhoneNumberFromString(value, {
        defaultCountry: isSupportedCountry(country) ? country : undefined,
        extract: false,
    });
    return parsed?.isPossible() && !parsed.ext ? parsed.number : value.trim();
}

function appendReply(item: DemoConversation, text: string, timestamp: string): DemoConversation {
    return {
        ...item,
        unread: false,
        messages: [
            ...item.messages,
            {
                id: `${item.id}-${item.messages.length + 1}`,
                from: MessageSender.Me,
                text,
                timestamp,
            },
        ],
    };
}

function sendNewMessage(
    model: DemoSessionModel,
    event: Extract<DemoAction, { type: typeof DemoActionType.Compose }>,
): DemoSessionModel {
    const number = event.draft.phoneNumber.trim();
    const text = event.draft.messageBody.trim();
    if (!number || !text) return model;
    const existing = model.conversations.find((item) => item.number === number);
    if (existing)
        return {
            ...model,
            conversations: model.conversations.map((item) =>
                item.id === existing.id ? appendReply(item, text, event.timestamp) : item,
            ),
        };
    const contact = createDemoContacts().find((item) =>
        item.phone_numbers?.some((phone) => phone.value === number),
    );
    const conversation: DemoConversation = {
        id: event.id,
        name: contact?.display_name ?? '',
        number,
        unread: false,
        messages: [],
    };
    return {
        ...model,
        conversations: [appendReply(conversation, text, event.timestamp), ...model.conversations],
    };
}

/** The host owns message records; the shared reducer continues to own navigation and telemetry. */
function demoReducer(model: DemoSessionModel, event: DemoAction): DemoSessionModel {
    if (event.type === DemoActionType.SaveContact)
        return {
            ...model,
            contacts: [
                ...model.contacts.filter((item) => item.id !== event.contact.id),
                event.contact,
            ].sort((left, right) => left.name.localeCompare(right.name)),
        };
    if (event.type === DemoActionType.DeleteContact)
        return { ...model, contacts: model.contacts.filter((item) => item.id !== event.id) };
    if (event.type === DemoActionType.Compose) return sendNewMessage(model, event);
    const next = { ...model, session: simulatorSessionReducer(model.session, event.action) };
    if (event.action.type !== SimulatorDispatchActionType.SimulatorAction) return next;
    const action = event.action.action;
    if (action.type === SimulatorActionType.OpenThread) {
        if (!next.conversations.some((item) => item.id === action.threadId)) return next;
        return {
            ...next,
            selectedId: action.threadId,
            conversations: next.conversations.map((item) =>
                item.id === action.threadId ? { ...item, unread: false } : item,
            ),
        };
    }
    if (action.type === SimulatorActionType.SendReply) {
        const text = action.replyText?.trim();
        if (!text) return next;
        return {
            ...next,
            conversations: next.conversations.map((item) =>
                item.id === next.selectedId ? appendReply(item, text, event.timestamp) : item,
            ),
        };
    }
    return next;
}

function projectMessages(model: DemoSessionModel): SimulatorSmsPayload {
    const selected = model.conversations.find((item) => item.id === model.selectedId);
    const ordered = [...model.conversations].sort((left, right) =>
        (right.messages.at(-1)?.timestamp ?? '').localeCompare(
            left.messages.at(-1)?.timestamp ?? '',
        ),
    );
    return {
        mode: SmsMode.History,
        visibleMessageCount: selected?.messages.length ?? 0,
        thread: {
            id: selected?.id,
            sender_display_name: selected?.name || undefined,
            sender_number: selected?.number,
            messages: selected?.messages ?? [],
            last_at: selected?.messages.at(-1)?.timestamp,
            unread: selected?.unread ?? false,
        },
        threads: ordered.map((item) => ({
            id: item.id,
            senderName: item.name || undefined,
            senderNumber: item.number,
            preview: item.messages.at(-1)?.text ?? '',
            timestamp: item.messages.at(-1)?.timestamp,
            unread: item.unread,
        })),
    };
}

export function useDemoSession(regional: RegionalPreferences) {
    const [model, reduce] = useReducer(demoReducer, undefined, () => ({
        session: getInitialSessionState(fullDeviceToPayload(createDemoDevice())),
        conversations: createDemoConversations(),
        contacts: createDemoContactRecords(),
        selectedId: 'demo-thread',
    }));
    const [draft, setDraft] = useState(emptyDraft);
    const dispatch = useCallback((action: SimulatorDispatchAction) => {
        const openingThread =
            action.type === SimulatorDispatchActionType.SimulatorAction &&
            action.action.type === SimulatorActionType.OpenThread;
        const composing =
            action.type === SimulatorDispatchActionType.NavLocal &&
            action.app === SimulatorApp.Messages &&
            action.screen === SimulatorMessagesScreenId.NewThread;
        if (openingThread || composing) setDraft(emptyDraft());
        reduce({ type: DemoActionType.Session, action, timestamp: new Date().toISOString() });
    }, []);
    const state = useMemo(
        () =>
            updateSimulatorPayload(model.session, {
                ...model.session.payload,
                sms: projectMessages(model),
                contacts: model.contacts.length ? model.contacts.map(toSessionContact) : null,
            }),
        [model],
    );
    const messageCompose: MessageComposeOptions = {
        draft,
        onChange: setDraft,
        onSend: (message) =>
            reduce({
                type: DemoActionType.Compose,
                draft: {
                    ...message,
                    phoneNumber: canonicalRecipient(message.phoneNumber, regional.country),
                },
                timestamp: new Date().toISOString(),
                id: createSimulatorId(),
            }),
    };
    const contacts = useMemo(
        () => ({
            records: model.contacts,
            save: (contact: DemoContact) => reduce({ type: DemoActionType.SaveContact, contact }),
            remove: (id: string) => reduce({ type: DemoActionType.DeleteContact, id }),
        }),
        [model.contacts],
    );
    return { state, dispatch, messageCompose, contacts };
}
