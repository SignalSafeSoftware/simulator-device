import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import SimulatorPhoneShell from '../src/phone/SimulatorPhoneShell';
import SimulatorPhoneNav from '../src/phone/SimulatorPhoneNav';
import { fullDeviceToPayload } from '@signalsafe/simulator-react/adapters/deviceToSession';
import { getInitialSessionState } from '@signalsafe/simulator-react/state/simulatorSessionInitialState';

it('marks the actual screen and native primary Home control independently of translated text', () => {
    const state = getInitialSessionState(
        fullDeviceToPayload({ entry_point: { app: 'home', screen: 'home' } }),
    );
    const { container } = render(
        <SimulatorPhoneShell nav={<SimulatorPhoneNav state={state} dispatch={vi.fn()} />}>
            <p>Screen content</p>
        </SimulatorPhoneShell>,
    );
    const actualScreen = container.querySelector('[data-simulator-anchor="screen"]');
    expect(actualScreen?.textContent).toContain('Screen content');
    expect(actualScreen?.contains(screen.getByRole('button', { name: 'Home' }))).toBe(false);
    expect(screen.getByRole('button', { name: 'Home' }).getAttribute('data-simulator-anchor')).toBe(
        'home-control',
    );
    expect(container.querySelectorAll('[data-simulator-anchor="home-control"]')).toHaveLength(1);
});
