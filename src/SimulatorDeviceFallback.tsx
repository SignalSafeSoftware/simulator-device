import { useSimulatorLocale } from "@signalsafe/simulator-react";
/** Safe default when {@link SimulatorDevice} receives an unsupported value shape. */
export default function SimulatorDeviceFallback() {
  const screenLocale = useSimulatorLocale();

  return (
    <output data-testid="simulator-device-unsupported">
      {screenLocale.t(
        "screen.simulatorDeviceFallback.unsupported.simulator.device.configuration",
      )}
    </output>
  );
}
