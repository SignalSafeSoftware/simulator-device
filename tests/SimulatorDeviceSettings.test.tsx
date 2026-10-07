import { useReducer } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { emptySimulatorStore } from '@signalsafe/simulator-core/apps/contracts';
import { SimulatorApp } from '@signalsafe/simulator-core/simulatorApp';
import { SimulatorHomeScreenId } from '@signalsafe/simulator-core/devicePayload';
import { SimulatorDispatchActionType } from '@signalsafe/simulator-react/state/simulatorDispatchActions';
import { simulatorSessionReducer } from '@signalsafe/simulator-react/state/simulatorSessionReducer';
import RegionalSettings from '@signalsafe/simulator-react/apps/settings/RegionalSettings';
import {
    RegionalDateFormat,
    RegionalTimeFormat,
} from '@signalsafe/simulator-react/apps/settings/regionalFormats';
import { defaultAppearance } from '@signalsafe/simulator-theme-bootstrap/appearance';
import SimulatorDeviceSettings from '../src/apps/SimulatorDeviceSettings.js';
import { SimulatorDeviceApps } from '../src/apps/SimulatorDeviceApps.js';
import { createMemoryStore } from '../docs/examples/local-apps/memoryStore.js';
import { buildState } from './support/sessionFixtures.js';

vi.mock('../docs/examples/local-apps/demoData.js', () => ({
    createDemoStore: () => emptySimulatorStore(),
}));

it('composes shared controls and host features without adding a second navigation shell', async () => {
    const onApply = vi.fn();
    const onSave = vi.fn();
    const onLock = vi.fn();
    const store = createMemoryStore(() => {});
    const metadata = store.data;
    if (!metadata) throw new Error('Missing synthetic device data');
    await store.save({ ...metadata, lock: { salt: 'a'.repeat(32), digest: 'b'.repeat(64) } });
    render(
        <SimulatorDeviceSettings
            store={store}
            onLock={onLock}
            appearance={{ value: defaultAppearance, onApply, onReset: vi.fn() }}
            regional={
                <RegionalSettings
                    value={{
                        country: 'US',
                        language: 'en',
                        currency: 'USD',
                        dateFormat: RegionalDateFormat.Locale,
                        timeFormat: RegionalTimeFormat.TwelveHour,
                        timeZone: 'UTC',
                    }}
                    countries={[{ value: 'US', label: 'United States' }]}
                    onSave={onSave}
                />
            }
        >
            <section aria-label='Host contact tools'>Host tools</section>
        </SimulatorDeviceSettings>,
    );
    expect(screen.getAllByRole('heading', { name: 'Settings', level: 2 })).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Appearance' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Region and formats' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Screen password' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Simulated device data' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Blocked simulator numbers' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Merge duplicate contacts' })).toBeNull();
    expect(screen.getByRole('region', { name: 'Host contact tools' })).toBeTruthy();
    expect(screen.queryByTestId('simulator-device-shell')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
    expect(screen.queryByText(/Twilio|Find microphones|Readiness checks/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Apply appearance' }));
    expect(onApply).toHaveBeenCalledWith(defaultAppearance);
    fireEvent.change(screen.getByLabelText('Time format'), {
        target: { value: RegionalTimeFormat.TwentyFourHour },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save regional settings' }));
    await waitFor(() =>
        expect(onSave).toHaveBeenCalledWith(
            expect.objectContaining({ timeFormat: RegionalTimeFormat.TwentyFourHour }),
        ),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Lock now' }));
    expect(onLock).toHaveBeenCalledOnce();
});

it('opens shared settings through Home and returns Home with one Back action', () => {
    const store = createMemoryStore(() => {});
    function Session() {
        const [state, dispatch] = useReducer(simulatorSessionReducer, buildState());
        return (
            <SimulatorDeviceApps
                store={store}
                state={state}
                dispatch={dispatch}
                unlocked
                onUnlock={() => {}}
                onLock={() => {}}
                openSettings={() =>
                    dispatch({
                        type: SimulatorDispatchActionType.NavLocal,
                        app: SimulatorApp.Home,
                        screen: SimulatorHomeScreenId.Settings,
                    })
                }
                settings={{
                    appearance: { value: defaultAppearance, onApply: () => {}, onReset: () => {} },
                }}
            >
                <p>Host scenario content</p>
            </SimulatorDeviceApps>
        );
    }
    render(<Session />);
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('heading', { name: 'Settings', level: 2 })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Appearance' })).toBeTruthy();
    expect(screen.getAllByTestId('simulator-device-shell')).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Back' })).toHaveLength(1);
    expect(screen.queryByText('Host scenario content')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('heading', { name: 'Home', level: 2 })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Appearance' })).toBeNull();
});
