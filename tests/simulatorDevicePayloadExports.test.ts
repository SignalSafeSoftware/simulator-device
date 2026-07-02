import { describe, expect, it } from 'vitest';
import { isSimulatorDevicePayload } from '@signalsafe/simulator-core';
import type { SimulatorDevicePayload } from '../src/types/simulatorDevicePayload.js';

describe('simulatorDevicePayload re-export', () => {
    it('re-exports canonical payload type from simulator-core', () => {
        const payload: SimulatorDevicePayload = {
            entry_point: { app: 'phone', screen: 'history' },
        };

        expect(isSimulatorDevicePayload(payload)).toBe(true);
    });
});
