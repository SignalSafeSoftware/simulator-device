import { deviceJsonToPayload } from '@signalsafe/simulator-react';
import type { SimulatorDevicePayload } from './types/simulatorDevicePayload.js';

/** Legacy JSON entry point shares normalization while retaining its tolerant behavior. */
export function simulatorDeviceValueToSessionPayload(value: SimulatorDevicePayload) {
    return deviceJsonToPayload(value);
}
