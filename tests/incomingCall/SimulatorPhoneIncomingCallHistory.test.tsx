import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { SimulatorRegionalPresentationProvider } from '@signalsafe/simulator-react/contract/regionalPresentation';
import {
    RegionalDateFormat,
    RegionalTimeFormat,
} from '@signalsafe/simulator-react/apps/settings/regionalFormats';

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
                        durationLabel: '00:32',
                        statusLabel: 'Incoming',
                    },
                ]}
            />,
        );

        const section = getByTestId('simulator-incoming-call-history');
        expect(section.className).toContain('simulator-phone__incoming-call-history');
        expect(getByText('Previous calls')).toBeInstanceOf(HTMLElement);
        expect(getByRole('columnheader', { name: 'Time' })).toBeInstanceOf(HTMLElement);
        expect(getByRole('columnheader', { name: 'Duration' })).toBeInstanceOf(HTMLElement);
        expect(getByRole('columnheader', { name: 'Status' })).toBeInstanceOf(HTMLElement);
        expect(getByText('Today 9:15 AM')).toBeInstanceOf(HTMLElement);
        expect(getByText('00:32')).toBeInstanceOf(HTMLElement);
        expect(getByText('Incoming')).toBeInstanceOf(HTMLElement);
    });

    it('formats ISO instants through the regional presentation and keeps other labels', () => {
        const { getByText } = render(
            <SimulatorRegionalPresentationProvider
                value={{
                    country: 'US',
                    language: 'en',
                    currency: 'USD',
                    dateFormat: RegionalDateFormat.Locale,
                    timeFormat: RegionalTimeFormat.TwelveHour,
                    timeZone: 'UTC',
                }}
            >
                <SimulatorPhoneIncomingCallHistory
                    recentCalls={[
                        {
                            id: 'iso',
                            timeLabel: '2026-10-05T12:00:00.000Z',
                            durationLabel: '03:04',
                            statusLabel: 'Incoming',
                        },
                        {
                            id: 'text',
                            timeLabel: 'Today 9:15 AM',
                            durationLabel: '—',
                            statusLabel: 'Missed',
                        },
                    ]}
                />
            </SimulatorRegionalPresentationProvider>,
        );
        expect(getByText('10/5/2026, 12:00:00 PM')).toBeInstanceOf(HTMLElement);
        expect(getByText('Today 9:15 AM')).toBeInstanceOf(HTMLElement);
    });
});
