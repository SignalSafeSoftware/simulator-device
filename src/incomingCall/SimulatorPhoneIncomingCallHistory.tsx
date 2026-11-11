import { SIM_VISUALLY_HIDDEN } from '@signalsafe/simulator-react/ui/styles/simulatorClasses';
import { SIM_PHONE_INCOMING_CALL_HISTORY } from '@signalsafe/simulator-react/ui/styles/semanticSimulatorClasses';
import { useSimulatorLocale } from '@signalsafe/simulator-react/i18n/SimulatorLocale';
import { useTimestampFormatter } from '@signalsafe/simulator-react/contract/regionalPresentation';
import type { ReactNode } from 'react';
import type { PhoneIncomingCallHistoryRow } from './phoneIncomingCallHistoryHelpers.js';

export interface SimulatorPhoneIncomingCallHistoryProps {
    recentCalls: PhoneIncomingCallHistoryRow[];
}

export function SimulatorPhoneIncomingCallHistory({
    recentCalls,
}: Readonly<SimulatorPhoneIncomingCallHistoryProps>): ReactNode {
    const screenLocale = useSimulatorLocale();
    const formatTimestamp = useTimestampFormatter();

    if (recentCalls.length === 0) {
        return null;
    }

    return (
        <section
            className={SIM_PHONE_INCOMING_CALL_HISTORY}
            aria-label={screenLocale.t('screen.simulatorPhoneIncomingCallHistory.previous.calls')}
            data-testid='simulator-incoming-call-history'
        >
            <h3>
                {screenLocale.t('screen.simulatorPhoneIncomingCallHistory.previous.calls')}
                <span aria-hidden='true'> ({recentCalls.length})</span>
            </h3>
            <ul>
                {recentCalls.map((call) => (
                    <li key={call.id}>
                        <p>{formatTimestamp(call.timeLabel)}</p>
                        <dl>
                            <div>
                                <dt className={SIM_VISUALLY_HIDDEN}>
                                    {screenLocale.t(
                                        'screen.simulatorPhoneIncomingCallHistory.status',
                                    )}
                                </dt>
                                <dd>{call.statusLabel}</dd>
                            </div>
                            <div>
                                <dt className={SIM_VISUALLY_HIDDEN}>
                                    {screenLocale.t(
                                        'screen.simulatorPhoneIncomingCallHistory.duration',
                                    )}
                                </dt>
                                <dd>{call.durationLabel}</dd>
                            </div>
                        </dl>
                    </li>
                ))}
            </ul>
        </section>
    );
}
