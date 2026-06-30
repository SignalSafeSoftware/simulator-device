import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';

import { renderPhoneIncomingCallHistoryExtra } from '../../src/incomingCall/renderPhoneIncomingCallHistoryExtra.js';
import { buildIncomingCallState } from '../support/incomingCallFixtures.js';

describe('renderPhoneIncomingCallHistoryExtra', () => {
    it('returns null when there are no matching recent calls', () => {
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

        const result = renderPhoneIncomingCallHistoryExtra({
            state,
            dispatch: vi.fn(),
            content: state.payload.phone!.content!,
            callHistory: state.payload.phone!.callHistory ?? [],
            contacts: state.payload.contacts,
        });

        expect(result).toBeNull();
    });

    it('returns SimulatorPhoneIncomingCallHistory when matching calls exist', () => {
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
            ],
        });

        const slot = renderPhoneIncomingCallHistoryExtra({
            state,
            dispatch: vi.fn(),
            content: state.payload.phone!.content!,
            callHistory: state.payload.phone!.callHistory ?? [],
            contacts: state.payload.contacts,
        });

        const { getByTestId, getByText } = render(<>{slot}</>);
        expect(getByTestId('simulator-incoming-call-history').className).toContain(
            'simulator-phone__incoming-call-history',
        );
        expect(getByText('Previous calls')).toBeDefined();
        expect(getByText('Today 9:15 AM')).toBeDefined();
    });
});
