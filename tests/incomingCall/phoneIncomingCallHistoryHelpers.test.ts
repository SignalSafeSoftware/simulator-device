import { describe, expect, it } from 'vitest';

import {
    getRecentCallsForCaller,
    normalizePhoneNumber,
    resolveIncomingCallCaller,
} from '../../src/incomingCall/phoneIncomingCallHistoryHelpers.js';
import { buildIncomingCallState } from '../support/incomingCallFixtures.js';

describe('phoneIncomingCallHistoryHelpers', () => {
    it('normalizes phone numbers for matching', () => {
        expect(normalizePhoneNumber('+1 (555) 100-2000')).toBe('15551002000');
        expect(normalizePhoneNumber('+1-555-100-2000')).toBe('15551002000');
    });

    it('returns empty string for null or blank phone numbers', () => {
        expect(normalizePhoneNumber(null)).toBe('');
        expect(normalizePhoneNumber('')).toBe('');
    });

    it('resolves Alice Chen contact id from incoming caller', () => {
        const caller = resolveIncomingCallCaller(buildIncomingCallState());
        expect(caller.contactId).toBe('alice');
        expect(caller.displayName).toBe('Alice Chen');
    });

    it('resolves caller without matching contact when contacts list is empty', () => {
        const state = buildIncomingCallState({ contacts: [] });
        const caller = resolveIncomingCallCaller(state);
        expect(caller.contactId).toBeUndefined();
        expect(caller.displayName).toBe('Alice Chen');
    });

    it('returns matching Alice call history rows with table labels', () => {
        const state = buildIncomingCallState({
            callHistory: [
                {
                    id: 'ph1',
                    number: '+1-555-100-2000',
                    name: 'Alice Chen',
                    kind: 'incoming',
                    timestamp: 'Today 9:15 AM',
                    duration: '0:32',
                },
                {
                    id: 'ph2',
                    number: '+1-555-100-2000',
                    name: 'Alice Chen',
                    kind: 'missed',
                    timestamp: 'Today 8:05 AM',
                },
                {
                    id: 'ph3',
                    number: '+1-555-100-2001',
                    name: 'Bob Martinez',
                    kind: 'outgoing',
                    timestamp: 'Yesterday 2:00 PM',
                },
            ],
        });

        const caller = resolveIncomingCallCaller(state);
        const recent = getRecentCallsForCaller(state, caller);

        expect(recent).toHaveLength(2);
        expect(recent[0]).toEqual({
            id: 'ph1',
            timeLabel: 'Today 9:15 AM',
            durationLabel: '0:32',
            statusLabel: 'Incoming',
        });
        expect(recent[1]).toEqual({
            id: 'ph2',
            timeLabel: 'Today 8:05 AM',
            durationLabel: '—',
            statusLabel: 'Missed',
        });
    });

    it('uses em dash when duration is missing', () => {
        const state = buildIncomingCallState({
            callHistory: [
                {
                    id: 'ph1',
                    number: '+1-555-100-2000',
                    name: 'Alice Chen',
                    kind: 'incoming',
                    timestamp: 'Today 9:15 AM',
                },
            ],
        });

        const caller = resolveIncomingCallCaller(state);
        expect(getRecentCallsForCaller(state, caller)[0]?.durationLabel).toBe('—');
    });

    it('derives status from label when kind is missing', () => {
        const state = buildIncomingCallState({
            callHistory: [
                {
                    id: 'ph1',
                    number: '+1-555-100-2000',
                    name: 'Alice Chen',
                    label: 'missed call',
                    timestamp: 'Today 8:05 AM',
                },
            ],
        });

        const caller = resolveIncomingCallCaller(state);
        expect(getRecentCallsForCaller(state, caller)[0]?.statusLabel).toBe('Missed');
    });

    it('maps outgoing and voicemail status labels', () => {
        const state = buildIncomingCallState({
            callHistory: [
                {
                    id: 'out1',
                    number: '+1-555-100-2000',
                    name: 'Alice Chen',
                    kind: 'outgoing',
                    timestamp: 'Today 1:00 PM',
                    duration: '1:05',
                },
                {
                    id: 'vm1',
                    number: '+1-555-100-2000',
                    name: 'Alice Chen',
                    kind: 'voicemail',
                    timestamp: 'Today 12:00 PM',
                },
            ],
        });

        const caller = resolveIncomingCallCaller(state);
        const recent = getRecentCallsForCaller(state, caller);
        expect(recent[0]?.statusLabel).toBe('Outbound');
        expect(recent[1]?.statusLabel).toBe('Voicemail');
    });

    it('excludes unrelated call history', () => {
        const state = buildIncomingCallState({
            callHistory: [
                {
                    id: 'ph2',
                    number: '+1-555-999-8888',
                    name: 'Unknown',
                    kind: 'missed',
                    timestamp: 'Yesterday 4:30 PM',
                },
            ],
        });

        const caller = resolveIncomingCallCaller(state);
        expect(getRecentCallsForCaller(state, caller)).toEqual([]);
    });

    it('limits results to three entries by default', () => {
        const state = buildIncomingCallState({
            callHistory: [
                { id: 'a1', number: '+1-555-100-2000', name: 'Alice Chen', kind: 'incoming', timestamp: '1' },
                { id: 'a2', number: '+1-555-100-2000', name: 'Alice Chen', kind: 'incoming', timestamp: '2' },
                { id: 'a3', number: '+1-555-100-2000', name: 'Alice Chen', kind: 'incoming', timestamp: '3' },
                { id: 'a4', number: '+1-555-100-2000', name: 'Alice Chen', kind: 'incoming', timestamp: '4' },
            ],
        });

        const caller = resolveIncomingCallCaller(state);
        expect(getRecentCallsForCaller(state, caller)).toHaveLength(3);
    });

    it('respects custom limit', () => {
        const state = buildIncomingCallState({
            callHistory: [
                { id: 'a1', number: '+1-555-100-2000', name: 'Alice Chen', kind: 'incoming', timestamp: '1' },
                { id: 'a2', number: '+1-555-100-2000', name: 'Alice Chen', kind: 'incoming', timestamp: '2' },
            ],
        });

        const caller = resolveIncomingCallCaller(state);
        expect(getRecentCallsForCaller(state, caller, 1)).toHaveLength(1);
    });

    it('matches history via contact id when caller has contactId', () => {
        const state = buildIncomingCallState({
            callerName: undefined,
            callerNumber: undefined,
            callHistory: [
                {
                    id: 'via-contact',
                    number: '+1-555-100-2000',
                    name: 'Alice Chen',
                    kind: 'incoming',
                    timestamp: 'Today 9:00 AM',
                },
            ],
        });

        const caller = { contactId: 'alice' };
        expect(getRecentCallsForCaller(state, caller)).toHaveLength(1);
    });

    it('returns empty recent calls when history is empty', () => {
        const state = buildIncomingCallState({ callHistory: [] });
        expect(getRecentCallsForCaller(state, resolveIncomingCallCaller(state))).toEqual([]);
    });
});
