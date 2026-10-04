import { formatPhoneCallDuration } from '@signalsafe/simulator-react/views/phone/PhoneCallView';
import { createTranslator, simulatorEnglish } from '@signalsafe/simulator-react/i18n/catalog';
import type {
    SimulatorCallHistoryEntry,
    SimulatorSessionState,
} from '@signalsafe/simulator-react/types/session';

export interface PhoneIncomingCallCaller {
    contactId?: string;
    displayName?: string;
    phoneNumber?: string;
}

export interface PhoneIncomingCallHistoryRow {
    id: string;
    timeLabel: string;
    durationLabel: string;
    statusLabel: string;
}

const MISSING_LABEL = '—';

export function normalizePhoneNumber(value: string | undefined | null): string {
    if (value == null || value === '') {
        return '';
    }
    return value.replace(/\D/g, '');
}

type Translator = ReturnType<typeof createTranslator<keyof typeof simulatorEnglish>>;
const englishTranslator: Translator = createTranslator(simulatorEnglish);

function kindToLabel(kind: SimulatorCallHistoryEntry['kind'], locale: Translator): string {
    switch (kind) {
        case 'outgoing':
            return locale.t('calls.outgoing');
        case 'missed':
            return locale.t('calls.missed');
        case 'voicemail':
            return locale.t('calls.voicemail');
        case 'incoming':
            return locale.t('calls.incoming');
        default:
            return locale.t('value.unknown');
    }
}

function resolveDurationLabel(entry: SimulatorCallHistoryEntry): string {
    const seconds = entry.durationSeconds;
    return seconds == null || !Number.isFinite(seconds) || seconds < 0
        ? MISSING_LABEL
        : formatPhoneCallDuration(seconds);
}

function resolveTimeLabel(entry: SimulatorCallHistoryEntry): string {
    const timestamp = entry.timestamp?.trim();
    return timestamp != null && timestamp !== '' ? timestamp : MISSING_LABEL;
}

function entryMatchesCaller(
    entry: SimulatorCallHistoryEntry,
    caller: PhoneIncomingCallCaller,
    contactNumber: string,
    contactName: string,
): boolean {
    const entryNumber = normalizePhoneNumber(entry.number);
    const entryName = (entry.name ?? '').trim().toLowerCase();
    const callerNumber = normalizePhoneNumber(caller.phoneNumber);
    const callerName = (caller.displayName ?? '').trim().toLowerCase();

    if (caller.contactId != null && contactNumber !== '' && entryNumber !== '') {
        if (entryNumber === contactNumber) {
            return true;
        }
    }

    if (callerNumber !== '' && entryNumber !== '' && entryNumber === callerNumber) {
        return true;
    }

    if (contactName !== '' && entryName !== '' && entryName === contactName) {
        return true;
    }

    if (callerName !== '' && entryName !== '' && entryName === callerName) {
        return true;
    }

    return false;
}

/** Resolve the active incoming caller from session payload. */
export function resolveIncomingCallCaller(state: SimulatorSessionState): PhoneIncomingCallCaller {
    const content = state.payload.phone?.content;
    const callerName = content?.caller_name;
    const phoneNumber = content?.phone_number;
    const contacts = state.payload.contacts ?? [];

    if (contacts.length === 0) {
        return {
            displayName: callerName,
            phoneNumber,
        };
    }

    const normalizedIncoming = normalizePhoneNumber(phoneNumber);
    const matchedContact = contacts.find((contact) => {
        if (callerName != null && callerName !== '' && contact.displayName === callerName) {
            return true;
        }
        const contactNumber = normalizePhoneNumber(contact.number);
        return (
            normalizedIncoming !== '' &&
            contactNumber !== '' &&
            contactNumber === normalizedIncoming
        );
    });

    return {
        contactId: matchedContact?.id,
        displayName: callerName ?? matchedContact?.displayName,
        phoneNumber: phoneNumber ?? matchedContact?.number,
    };
}

/** Recent call history rows for the active incoming caller (default limit 3). */
export function getRecentCallsForCaller(
    state: SimulatorSessionState,
    caller: PhoneIncomingCallCaller,
    limit = 3,
    locale: Translator = englishTranslator,
): PhoneIncomingCallHistoryRow[] {
    const history = state.payload.phone?.callHistory ?? [];
    if (history.length === 0) {
        return [];
    }

    const contact =
        caller.contactId == null
            ? undefined
            : state.payload.contacts?.find((entry) => entry.id === caller.contactId);
    const contactNumber = normalizePhoneNumber(contact?.number);
    const contactName = (contact?.displayName ?? '').trim().toLowerCase();

    const matching = history.filter((entry) =>
        entryMatchesCaller(entry, caller, contactNumber, contactName),
    );

    return matching.slice(0, limit).map((entry) => ({
        id: entry.id,
        timeLabel: resolveTimeLabel(entry),
        durationLabel: resolveDurationLabel(entry),
        statusLabel: kindToLabel(entry.kind, locale),
    }));
}
