import { deviceJsonToPayload, createSimulatorDatasourceFromPayload, simulatorDatasourceToPayload } from '@signalsafe/simulator-react';
import type { SimulatorDevicePayload } from './types/simulatorDevicePayload.js';

/** Legacy JSON entry point shares normalization while retaining its tolerant behavior. */
export function simulatorDeviceValueToSessionPayload(value: SimulatorDevicePayload) {
    return simulatorDatasourceToPayload(createSimulatorDatasourceFromPayload(deviceJsonToPayload(value)));
}
