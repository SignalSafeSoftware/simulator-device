import { isSimulatorApp } from '@signalsafe/simulator-core/simulatorApp';

export const SimulatorDeviceKind = Object.freeze({
    PhoneFullDevice: 'phone-full-device',
    Unsupported: 'unsupported',
} as const);
export type SimulatorDeviceKind = (typeof SimulatorDeviceKind)[keyof typeof SimulatorDeviceKind];

/**
 * Classifies a simulator JSON value for {@link SimulatorDevice}.
 * Accepts the current full-device payload shape; rejects future desktop/discriminated shapes.
 */
export function resolveSimulatorDeviceKind(value: unknown): SimulatorDeviceKind {
    if (value == null || typeof value !== 'object') {
        return SimulatorDeviceKind.Unsupported;
    }

    const record = value as Record<string, unknown>;
    const discriminator = record.type;

    if (discriminator === 'desktop') {
        return SimulatorDeviceKind.Unsupported;
    }

    if (typeof discriminator === 'string' && discriminator !== 'phone') {
        return SimulatorDeviceKind.Unsupported;
    }

    const entryPoint = record.entry_point;
    if (entryPoint == null || typeof entryPoint !== 'object') {
        return SimulatorDeviceKind.Unsupported;
    }

    const app = (entryPoint as { app?: unknown }).app;
    if (!isSimulatorApp(app)) {
        return SimulatorDeviceKind.Unsupported;
    }

    return 'phone-full-device';
}
