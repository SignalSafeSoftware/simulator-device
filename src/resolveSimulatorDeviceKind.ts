import { isSimulatorApp } from '@signalsafe/simulator-core/simulatorApp';

export type SimulatorDeviceKind = 'phone-full-device' | 'unsupported';

/**
 * Classifies a simulator JSON value for {@link SimulatorDevice}.
 * Accepts the current full-device payload shape; rejects future desktop/discriminated shapes.
 */
export function resolveSimulatorDeviceKind(value: unknown): SimulatorDeviceKind {
    if (value == null || typeof value !== 'object') {
        return 'unsupported';
    }

    const record = value as Record<string, unknown>;
    const discriminator = record.type;

    if (discriminator === 'desktop') {
        return 'unsupported';
    }

    if (typeof discriminator === 'string' && discriminator !== 'phone') {
        return 'unsupported';
    }

    const entryPoint = record.entry_point;
    if (entryPoint == null || typeof entryPoint !== 'object') {
        return 'unsupported';
    }

    const app = (entryPoint as { app?: unknown }).app;
    if (!isSimulatorApp(app)) {
        return 'unsupported';
    }

    return 'phone-full-device';
}
