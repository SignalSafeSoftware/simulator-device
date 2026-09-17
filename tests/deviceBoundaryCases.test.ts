import { expect, it } from 'vitest';
import { resolveSimulatorDeviceKind } from '../src/resolveSimulatorDeviceKind';
import { splitContactDisplayName } from '../src/contact/splitContactDisplayName';
import { contactSnapshotFromSessionContact } from '../src/contact/contactSnapshotFromSessionContact';
import { patchContactInDevicePayload, removeContactFromDevicePayload } from '../src/contact/patchContactsInDevicePayload';
import { getRecentCallsForCaller, resolveIncomingCallCaller } from '../src/incomingCall/phoneIncomingCallHistoryHelpers';
import { buildIncomingCallState } from './support/incomingCallFixtures';

it.each([null, undefined, 1, 'phone', {}, { type: 'tablet' }, { entry_point: {} }, { entry_point: { app: 'unknown' } }, { entry_point: 'phone' }])('rejects unsupported device input %j', value => {
    expect(resolveSimulatorDeviceKind(value)).toBe('unsupported');
});
it('handles single-token names and independently copies contact endpoint arrays', () => {
    expect(splitContactDisplayName(' Ada ')).toEqual({ firstName: 'Ada', lastName: '' });
    const contact = { id: 'one', displayName: 'Ada', phoneNumbers: [{ label: 'Home', value: '123' }], emailAddresses: [{ label: 'Work', value: 'ada@example.test' }] };
    const result = contactSnapshotFromSessionContact(contact);
    expect(result.phoneNumbers).toEqual(contact.phoneNumbers);
    expect(result.phoneNumbers?.[0]).not.toBe(contact.phoneNumbers[0]);
    expect(result.emailAddresses?.[0]).not.toBe(contact.emailAddresses[0]);
});
it('inserts into missing contact lists and removes without mutating the source', () => {
    const original = { entry_point: { app: 'phone' as const, screen: 'contacts' } };
    const next = patchContactInDevicePayload(original, { id: 'one', displayName: 'Ada' });
    expect(next.contacts?.[0]?.display_name).toBe('Ada');
    expect(removeContactFromDevicePayload(original, 'missing').contacts).toEqual([]);
    expect(original).not.toHaveProperty('contacts');
});
it.each([
    ['missed yesterday', 'Missed'], ['voicemail', 'Voicemail'], ['outgoing', 'Outbound'], ['incoming', 'Incoming'], ['other', 'Unknown'],
])('derives call status from %s', (label, status) => {
    const state = buildIncomingCallState({ callHistory: [{ id: 'one', number: '123', label, timestamp: ' ', duration: ' ' }] });
    expect(getRecentCallsForCaller(state, { phoneNumber: '123' })).toEqual([{ id: 'one', timeLabel: '—', durationLabel: '—', statusLabel: status }]);
});
it('matches a caller by contact name or supplied name when phone numbers differ', () => {
    const state = buildIncomingCallState({ contacts: [{ id: 'ada', displayName: 'Ada', number: '123' }], callHistory: [{ id: 'one', number: '999', name: ' ADA ' }, { id: 'two', number: '999', name: 'Bob' }] });
    expect(getRecentCallsForCaller(state, { contactId: 'ada' }).map(row => row.id)).toEqual(['one']);
    expect(getRecentCallsForCaller(state, { displayName: 'Bob' }).map(row => row.id)).toEqual(['two']);
    expect(getRecentCallsForCaller(state, { contactId: 'missing' })).toEqual([]);
});
it('handles absent phone content and resolves incoming calls by normalized number', () => {
    const state = buildIncomingCallState({ contacts: [{ id: 'one', displayName: 'Different', number: '15551002000' }] });
    expect(resolveIncomingCallCaller(state).contactId).toBe('one');
    state.payload.phone = null;
    expect(resolveIncomingCallCaller(state)).toEqual({ contactId: undefined, displayName: undefined, phoneNumber: undefined });
    expect(getRecentCallsForCaller(state, {})).toEqual([]);
});

it('labels unrecognized call kinds and resolves callers without a contacts collection', () => {
    const state = buildIncomingCallState({ callHistory: [{ id: 'unknown-kind', number: '123' }] });
    const entry = state.payload.phone?.callHistory?.[0];
    if (!entry) throw new Error('Missing fixture history');
    Object.assign(entry, { kind: 'future-kind' });
    expect(getRecentCallsForCaller(state, { phoneNumber: '123' })[0]?.statusLabel).toBe('Unknown');
    state.payload.contacts = null;
    expect(resolveIncomingCallCaller(state)).toMatchObject({ displayName: 'Alice Chen' });
});
