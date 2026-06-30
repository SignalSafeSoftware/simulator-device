import type { ReactNode } from 'react';
import type { SimulatorPhoneIncomingCallExtraRenderProps } from '@signalsafe/simulator-react';
import { SimulatorPhoneIncomingCallHistory } from './SimulatorPhoneIncomingCallHistory.js';
import {
    getRecentCallsForCaller,
    resolveIncomingCallCaller,
} from './phoneIncomingCallHistoryHelpers.js';

/** Drop-in {@link SimulatorWithSession} `renderIncomingCallExtra` slot for caller history. */
export function renderPhoneIncomingCallHistoryExtra(
    props: SimulatorPhoneIncomingCallExtraRenderProps,
): ReactNode {
    const caller = resolveIncomingCallCaller(props.state);
    const recentCalls = getRecentCallsForCaller(props.state, caller);
    if (recentCalls.length === 0) {
        return null;
    }
    return <SimulatorPhoneIncomingCallHistory recentCalls={recentCalls} />;
}
