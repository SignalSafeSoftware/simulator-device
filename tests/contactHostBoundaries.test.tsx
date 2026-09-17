import { act, renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { useSimulatorPhoneDeviceContactHost } from '../src/useSimulatorPhoneDeviceContactHost.js';
import { buildContactsScreenState } from './support/contactFixtures.js';

it('ignores contact-open requests when host details are disabled', () => {
    const state = buildContactsScreenState();
    const { result } = renderHook(() => useSimulatorPhoneDeviceContactHost(state, false));
    act(() => result.current.onPhoneContactOpen({ contactId: 'c1', contact: { id: 'c1', displayName: 'Contact' }, state, dispatch: vi.fn() }));
    expect(result.current.contact).toBeNull();
    expect(result.current.hostMode).toEqual({ kind: 'runtime' });
});

it.each([null, []])('ignores an open request when the contact has disappeared: %j', contacts => {
    const state = buildContactsScreenState();
    state.payload.contacts = contacts;
    const { result } = renderHook(() => useSimulatorPhoneDeviceContactHost(state, true));
    act(() => result.current.onPhoneContactOpen({ contactId: 'missing', contact: { id: 'missing', displayName: 'Removed' }, state, dispatch: vi.fn() }));
    expect(result.current.contact).toBeNull();
    expect(result.current.hostMode).toEqual({ kind: 'runtime' });
});
