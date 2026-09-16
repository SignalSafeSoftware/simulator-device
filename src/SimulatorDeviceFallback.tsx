import { useSimulatorLocale } from "@signalsafe/simulator-react";
/** Safe default when {@link SimulatorDevice} receives an unsupported value shape. */
export default function SimulatorDeviceFallback() {
  const screenLocale = useSimulatorLocale();

  return (
    <div data-testid="simulator-device-unsupported" role="status">
      {screenLocale.t("screen.simulatorDeviceFallback.unsupported.simulator.device.configuration")}
    </div>
  );
}
