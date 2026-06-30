import type { ReactNode } from 'react';
import type { PhoneIncomingCallHistoryRow } from './phoneIncomingCallHistoryHelpers.js';

export interface SimulatorPhoneIncomingCallHistoryProps {
    recentCalls: PhoneIncomingCallHistoryRow[];
}

export function SimulatorPhoneIncomingCallHistory({
    recentCalls,
}: Readonly<SimulatorPhoneIncomingCallHistoryProps>): ReactNode {
    if (recentCalls.length === 0) {
        return null;
    }

    return (
        <section
            className="simulator-phone__incoming-call-history"
            aria-label="Previous calls"
            data-testid="simulator-incoming-call-history"
        >
            <h3>Previous calls</h3>
            <table>
                <thead>
                    <tr>
                        <th scope="col">Time</th>
                        <th scope="col">Duration</th>
                        <th scope="col">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {recentCalls.map((call) => (
                        <tr key={call.id}>
                            <td>{call.timeLabel}</td>
                            <td>{call.durationLabel}</td>
                            <td>{call.statusLabel}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}
