import type { SimulatorApp } from '@signalsafe/simulator-core';

export type SimulatorDeviceKind = 'phone-full-device' | 'unsupported';

const SUPPORTED_APPS: SimulatorApp[] = ['phone', 'email', 'messages', 'internet', 'home'];

function isSupportedApp(value: unknown): value is SimulatorApp {
    return typeof value === 'string' && (SUPPORTED_APPS as string[]).includes(value);
}

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
    if (!isSupportedApp(app)) {
        return 'unsupported';
    }

    return 'phone-full-device';
}
