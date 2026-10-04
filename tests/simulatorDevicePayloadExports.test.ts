import { describe, expect, it } from 'vitest';
import { isSimulatorDevicePayload } from '@signalsafe/simulator-core/devicePayloadGuards';
import type { SimulatorDevicePayload } from '@signalsafe/simulator-core/devicePayload';

describe('canonical device payload', () => {
    it('uses the canonical payload contract from simulator-core', () => {
        const payload: SimulatorDevicePayload = {
            entry_point: { app: 'phone', screen: 'history' },
        };

        expect(isSimulatorDevicePayload(payload)).toBe(true);
    });
});
