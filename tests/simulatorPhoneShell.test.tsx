import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import SimulatorPhoneShell from '../src/SimulatorPhoneShell.js';
import { SIMULATOR_DEVICE_CLASS_NAMES } from '../src/simulatorDeviceClasses.js';

describe('SimulatorPhoneShell', () => {
    it('wraps session content in simulator-device-shell__session-column', () => {
        const { container } = render(
            <SimulatorPhoneShell>
                <div data-testid="session-content">Runtime</div>
            </SimulatorPhoneShell>,
        );

        const sessionColumn = container.querySelector(`.${SIMULATOR_DEVICE_CLASS_NAMES.shellSessionColumn}`);
        expect(sessionColumn).toBeTruthy();
        expect(sessionColumn?.querySelector('[data-testid="session-content"]')).toBeTruthy();
    });
});
