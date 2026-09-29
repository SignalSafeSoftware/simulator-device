import { useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { emptySimulatorStore, type DeviceStore } from '@signalsafe/simulator-core';
import { useSimulatorAppsHost } from '@signalsafe/simulator-react';
import { SimulatorDeviceApps } from '../src/SimulatorDeviceApps.js';
import { SimulatorDeviceAppsProvider } from '../src/SimulatorDeviceAppsProvider.js';
import { SimulatorCallBoundary } from '../src/SimulatorCallBoundary.js';
import { buildState } from './support/sessionFixtures.js';

function store(): DeviceStore {
    return {
        data: emptySimulatorStore(),
        error: '',
        busy: false,
        reload: vi.fn(async () => {}),
        get: async () => null,
        page: async () => ({ records: [], total: 0, revision: 0 }),
        save: async () => true,
        put: async () => true,
        remove: async () => true,
        folder: async () => true,
        restore: async () => true,
        exportBackup: async () => emptySimulatorStore(),
    };
}
function setup(data = store(), state = buildState()) {
    return {
        store: data,
        state,
        dispatch: vi.fn(),
        openSettings: vi.fn(),
        onUnlock: vi.fn(),
        onLock: vi.fn(),
        unlocked: true,
        children: <p>Host phone</p>,
    };
}
it('preserves the mounted draft while a call obscures the app', () => {
    function Draft() {
        const [text, setText] = useState('');
        return (
            <input
                aria-label="Draft"
                value={text}
                onChange={(event) => setText(event.target.value)}
            />
        );
    }
    const view = render(
        <SimulatorCallBoundary active={false} call={<p>Call</p>}>
            <Draft />
        </SimulatorCallBoundary>,
    );
    fireEvent.change(view.getByLabelText('Draft'), { target: { value: 'Unsaved' } });
    view.rerender(
        <SimulatorCallBoundary active call={<p>Call</p>}>
            <Draft />
        </SimulatorCallBoundary>,
    );
    expect(view.getByLabelText('Draft').closest('[hidden]')).not.toBeNull();
    expect(view.getByText('Call')).toBeTruthy();
    view.rerender(
        <SimulatorCallBoundary active={false} call={<p>Call</p>}>
            <Draft />
        </SimulatorCallBoundary>,
    );
    expect(view.getByLabelText<HTMLInputElement>('Draft').value).toBe('Unsaved');
    expect(view.queryByText('Call')).toBeNull();
});
it('exposes loading and failed-read recovery before any app can open', () => {
    const data = store();
    data.data = null;
    const props = setup(data);
    const view = render(<SimulatorDeviceApps {...props} />);
    expect(view.getByText('Loading simulated device…')).toBeTruthy();
    fireEvent.click(view.getByRole('button', { name: 'Retry' }));
    expect(data.reload).toHaveBeenCalledOnce();
    data.error = 'Read failed';
    view.rerender(<SimulatorDeviceApps {...props} />);
    expect(view.getByText('Read failed')).toBeTruthy();
});
it('routes home tiles, settings, primary navigation and local app back actions', async () => {
    const props = setup();
    const view = render(<SimulatorDeviceApps {...props} homeHeader={<p>Host clock</p>} />);
    expect(view.getByText('Host clock')).toBeTruthy();
    fireEvent.click(view.getByRole('button', { name: 'Settings', exact: true }));
    expect(props.openSettings).toHaveBeenCalledOnce();
    fireEvent.click(view.getByRole('button', { name: 'Vault', exact: true }));
    await view.findByRole('button', { name: /Unfiled/ });
    fireEvent.click(view.getByRole('button', { name: 'Back', exact: true }));
    fireEvent.click(view.getByRole('button', { name: 'Photos', exact: true }));
    await view.findByText('No photos saved.');
    fireEvent.click(view.getByRole('button', { name: 'Back', exact: true }));
    fireEvent.click(view.getByRole('button', { name: 'Phone', exact: true }));
    expect(props.dispatch).toHaveBeenCalled();
});
it('keeps lock and persistence errors at the composition boundary', () => {
    const data = store();
    data.data = {
        ...emptySimulatorStore(),
        lock: { salt: 'a'.repeat(32), digest: 'b'.repeat(64) },
    };
    data.error = 'Save failed';
    const props = setup(data);
    const view = render(<SimulatorDeviceApps {...props} />);
    fireEvent.click(view.getByRole('button', { name: 'Lock device' }));
    expect(props.onLock).toHaveBeenCalledOnce();
    fireEvent.click(view.getByRole('button', { name: 'Reload saved state' }));
    expect(data.reload).toHaveBeenCalledOnce();
    view.rerender(<SimulatorDeviceApps {...props} unlocked={false} />);
    expect(view.getByRole('heading', { name: 'Device locked' })).toBeTruthy();
});
it('supports the default mailbox, a host mailbox and host decoration', () => {
    const props = setup(store(), buildState({ activeApp: 'email' }));
    const view = render(<SimulatorDeviceApps {...props} />);
    fireEvent.click(view.getByRole('button', { name: 'Back', exact: true }));
    expect(props.dispatch).toHaveBeenCalledWith({ type: 'SWITCH_APP', app: 'home' });
    props.dispatch.mockClear();
    view.rerender(
        <SimulatorDeviceApps
            {...props}
            decorate={(content) => <aside>{content}</aside>}
            renderMailbox={(back) => <button onClick={back}>Host mailbox back</button>}
        />,
    );
    expect(view.getByRole('button', { name: 'Host mailbox back' }).closest('aside')).not.toBeNull();
    fireEvent.click(view.getByRole('button', { name: 'Host mailbox back' }));
    expect(props.dispatch).toHaveBeenCalledWith({ type: 'SWITCH_APP', app: 'home' });
    view.rerender(<SimulatorDeviceApps {...props} state={buildState({ activeApp: 'phone' })} />);
    expect(view.getByText('Host phone')).toBeTruthy();
    view.rerender(
        <SimulatorDeviceApps
            {...props}
            state={buildState({ activeApp: 'home', home: { screen: 'settings' } })}
        />,
    );
    expect(view.getByText('Host phone')).toBeTruthy();
});
it('provides Internet composition and preserves host overrides in the shell provider', () => {
    const props = setup(store(), buildState({ activeApp: 'internet' }));
    const view = render(<SimulatorDeviceApps {...props} browserThemeCss="body { color: blue; }" />);
    expect(view.getByRole('heading', { name: 'Internet' })).toBeTruthy();
    function Probe() {
        const { Shell, formatDate } = useSimulatorAppsHost();
        return (
            <Shell nav={<p>Host nav</p>}>
                <p>{formatDate(new Date(0))}</p>
            </Shell>
        );
    }
    view.rerender(
        <SimulatorDeviceAppsProvider value={{ formatDate: () => 'Host date' }}>
            <Probe />
        </SimulatorDeviceAppsProvider>,
    );
    expect(view.getByText('Host date')).toBeTruthy();
    expect(view.getByText('Host nav')).toBeTruthy();
});
