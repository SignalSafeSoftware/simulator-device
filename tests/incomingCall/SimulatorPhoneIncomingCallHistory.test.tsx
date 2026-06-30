import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { SimulatorPhoneIncomingCallHistory } from '../../src/incomingCall/SimulatorPhoneIncomingCallHistory.js';

describe('SimulatorPhoneIncomingCallHistory', () => {
    it('returns null for empty rows', () => {
        const { container } = render(<SimulatorPhoneIncomingCallHistory recentCalls={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders previous calls table with semantic class and test id', () => {
        const { getByTestId, getByRole, getByText } = render(
            <SimulatorPhoneIncomingCallHistory
                recentCalls={[
                    {
                        id: 'ph1',
                        timeLabel: 'Today 9:15 AM',
                        durationLabel: '0:32',
                        statusLabel: 'Incoming',
                    },
                ]}
            />,
        );

        const section = getByTestId('simulator-incoming-call-history');
        expect(section.className).toContain('simulator-phone__incoming-call-history');
        expect(getByText('Previous calls')).toBeDefined();
        expect(getByRole('columnheader', { name: 'Time' })).toBeDefined();
        expect(getByRole('columnheader', { name: 'Duration' })).toBeDefined();
        expect(getByRole('columnheader', { name: 'Status' })).toBeDefined();
        expect(getByText('Today 9:15 AM')).toBeDefined();
        expect(getByText('0:32')).toBeDefined();
        expect(getByText('Incoming')).toBeDefined();
    });
});
