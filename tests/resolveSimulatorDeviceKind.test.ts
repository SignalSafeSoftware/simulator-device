import { describe, expect, it } from 'vitest';
import { resolveSimulatorDeviceKind } from '../src/resolveSimulatorDeviceKind.js';
import {
    buildContactsDeviceJson,
    buildDesktopDiscriminatedJson,
    buildHomeDeviceJson,
} from './support/deviceJsonFixtures.js';

describe('resolveSimulatorDeviceKind', () => {
    it('accepts current full-device JSON with entry_point', () => {
        expect(resolveSimulatorDeviceKind(buildHomeDeviceJson())).toBe('phone-full-device');
        expect(resolveSimulatorDeviceKind(buildContactsDeviceJson())).toBe('phone-full-device');
    });

    it('rejects future desktop discriminated JSON', () => {
        expect(resolveSimulatorDeviceKind(buildDesktopDiscriminatedJson())).toBe('unsupported');
    });

    it('rejects missing entry_point', () => {
        expect(resolveSimulatorDeviceKind({ device: {} })).toBe('unsupported');
    });
});
