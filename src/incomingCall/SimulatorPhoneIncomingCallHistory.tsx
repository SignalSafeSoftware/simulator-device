import { useSimulatorLocale } from "@signalsafe/simulator-react";
import type { ReactNode } from "react";
import type { PhoneIncomingCallHistoryRow } from "./phoneIncomingCallHistoryHelpers.js";

export interface SimulatorPhoneIncomingCallHistoryProps {
  recentCalls: PhoneIncomingCallHistoryRow[];
}

export function SimulatorPhoneIncomingCallHistory({
  recentCalls,
}: Readonly<SimulatorPhoneIncomingCallHistoryProps>): ReactNode {
  const screenLocale = useSimulatorLocale();

  if (recentCalls.length === 0) {
    return null;
  }

  return (
    <section
      className="simulator-phone__incoming-call-history"
      aria-label={screenLocale.t("screen.simulatorPhoneIncomingCallHistory.previous.calls")}
      data-testid="simulator-incoming-call-history"
    >
      <h3>{screenLocale.t("screen.simulatorPhoneIncomingCallHistory.previous.calls")}</h3>
      <table>
        <thead>
          <tr>
            <th scope="col">{screenLocale.t("screen.simulatorPhoneIncomingCallHistory.time")}</th>
            <th scope="col">
              {screenLocale.t("screen.simulatorPhoneIncomingCallHistory.duration")}
            </th>
            <th scope="col">{screenLocale.t("screen.simulatorPhoneIncomingCallHistory.status")}</th>
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
