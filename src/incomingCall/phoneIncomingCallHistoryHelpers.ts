import type { SimulatorCallHistoryEntry, SimulatorSessionState } from '@signalsafe/simulator-react';

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

function kindToLabel(kind: SimulatorCallHistoryEntry['kind']): string {
    switch (kind) {
        case 'outgoing':
            return 'Outbound';
        case 'missed':
            return 'Missed';
        case 'voicemail':
            return 'Voicemail';
        case 'incoming':
            return 'Incoming';
        default:
            return 'Unknown';
    }
}

function resolveStatusLabel(entry: SimulatorCallHistoryEntry): string {
    if (entry.kind != null) {
        return kindToLabel(entry.kind);
    }

    const label = (entry.label ?? '').toLowerCase();
    if (label.includes('missed')) {
        return 'Missed';
    }
    if (label.includes('voicemail')) {
        return 'Voicemail';
    }
    if (label.includes('out')) {
        return 'Outbound';
    }
    if (label.includes('in')) {
        return 'Incoming';
    }

    return 'Unknown';
}

function resolveDurationLabel(entry: SimulatorCallHistoryEntry): string {
    const rawDuration = (entry as SimulatorCallHistoryEntry & { duration?: string }).duration;
    const duration = rawDuration?.trim();
    return duration != null && duration !== '' ? duration : MISSING_LABEL;
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
        return normalizedIncoming !== '' && contactNumber !== '' && contactNumber === normalizedIncoming;
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
        statusLabel: resolveStatusLabel(entry),
    }));
}
