/** Safe default when {@link SimulatorDevice} receives an unsupported value shape. */
export default function SimulatorDeviceFallback() {
    return (
        <div data-testid="simulator-device-unsupported" role="status">
            Unsupported simulator device configuration.
        </div>
    );
}
