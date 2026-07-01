import { templateDetailToPayload } from '@signalsafe/simulator-react';
import type { SimulatorTemplateDetail } from '@signalsafe/simulator-react';
import type { SimulatorDevicePayload } from './types/simulatorDevicePayload.js';

/**
 * Maps stored simulator JSON ({@link SimulatorDevicePayload}) to session payload
 * via the existing full-device adapter in `@signalsafe/simulator-react`.
 */
export function simulatorDeviceValueToSessionPayload(
    value: SimulatorDevicePayload,
): ReturnType<typeof templateDetailToPayload> {
    const detail = {
        id: 0,
        channel: 'phone',
        key: 'simulator-device',
        name: 'Simulator',
        is_master: false,
        is_active: true,
        company: null,
        topics: [],
        created_on: '',
        updated_on: '',
        description: '',
        content_json: {},
        simulator_json: value,
        simulator: value,
        thread_id: null,
        reply_to_message: null,
        attachment_name: '',
        attachment_type: '',
        attachment_behavior: '',
        messages: [],
        browser_template: null,
    } as SimulatorTemplateDetail;

    return templateDetailToPayload(detail);
}
