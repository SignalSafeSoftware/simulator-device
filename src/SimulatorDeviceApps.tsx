import { useState, type ReactNode } from 'react';
import {
    SimulatorScreenTile,
    type SimulatorSessionState,
    type SimulatorDispatchAction,
} from '@signalsafe/simulator-react';
import SimulatorPhoneShell from './SimulatorPhoneShell.js';
import SimulatorPhoneNav from './SimulatorPhoneNav.js';
import { Vault as VaultIcon, Images, Settings, LockKeyhole } from 'lucide-react';
import type { DeviceStore } from '@signalsafe/simulator-core';
import {
    SimulatorVault as Vault,
    SimulatorPhotos as Photos,
    SimulatorMailbox as Mailbox,
    SimulatorBrowserWorkbench as BrowserWorkbench,
    SimulatorLockScreen as LockScreen,
} from '@signalsafe/simulator-react';
import { SimulatorDeviceAppsProvider } from './SimulatorDeviceAppsProvider.js';
function DeviceAppsContent({
    store,
    unlocked,
    onUnlock,
    onLock,
    state,
    dispatch,
    openSettings,
    browserThemeCss = '',
    homeHeader,
    renderMailbox,
    decorate = (content) => content,
    children,
}: {
    homeHeader?: ReactNode;
    renderMailbox?: (onBack: () => void) => ReactNode;
    decorate?: (content: ReactNode) => ReactNode;
    browserThemeCss?: string;
    store: DeviceStore;
    unlocked: boolean;
    onUnlock: () => void;
    onLock: () => void;
    state: SimulatorSessionState;
    dispatch: (action: SimulatorDispatchAction) => void;
    openSettings: () => void;
    children: ReactNode;
}) {
    const [page, setPage] = useState<'vault' | 'photos' | null>(null);
    const home = () => {
        setPage(null);
        dispatch({ type: 'SWITCH_APP', app: 'home' });
    };
    if (!store.data)
        return (
            <section className="prototype-page">
                <output>{store.error || 'Loading simulated device…'}</output>
                <button
                    className="simulator-btn simulator-btn--neutral-outline"
                    onClick={() => void store.reload()}
                >
                    Retry
                </button>
            </section>
        );
    if (store.data.lock && !unlocked) return <LockScreen store={store} onUnlock={onUnlock} />;
    let content: ReactNode = children;
    if (state.view.activeApp === 'home' && state.view.home.screen === 'home') {
        content =
            page === 'vault' ? (
                <Vault store={store} onBack={() => setPage(null)} />
            ) : page === 'photos' ? (
                <Photos store={store} onBack={() => setPage(null)} />
            ) : (
                <section className="screen-content">
                    <h2 className="simulator-screen__header home-banner">Home</h2>
                    {homeHeader}
                    <div className="prototype-home">
                        <SimulatorScreenTile
                            label="Settings"
                            onClick={openSettings}
                            icon={<Settings size={48} strokeWidth={1.5} aria-hidden="true" />}
                        />
                        <SimulatorScreenTile
                            label="Vault"
                            onClick={() => setPage('vault')}
                            icon={<VaultIcon size={48} strokeWidth={1.5} aria-hidden="true" />}
                        />
                        <SimulatorScreenTile
                            label="Photos"
                            onClick={() => setPage('photos')}
                            icon={<Images size={48} strokeWidth={1.5} aria-hidden="true" />}
                        />
                    </div>
                    {store.data.lock && (
                        <button
                            className="simulator-btn simulator-btn--neutral-outline"
                            onClick={onLock}
                        >
                            <LockKeyhole size={18} aria-hidden="true" /> Lock device
                        </button>
                    )}
                </section>
            );
    } else if (state.view.activeApp === 'email')
        content = renderMailbox ? renderMailbox(home) : <Mailbox store={store} onBack={home} />;
    else if (state.view.activeApp === 'internet')
        content = <BrowserWorkbench templates={children} themeCss={browserThemeCss} />;
    const custom =
        state.view.activeApp === 'internet' ||
        (state.view.activeApp === 'home' && state.view.home.screen === 'home' && page === null);
    return (
        <>
            {store.error && (
                <div className="device-notice" role="alert">
                    {store.error}
                    <button
                        className="simulator-btn simulator-btn--neutral-outline"
                        onClick={() => void store.reload()}
                    >
                        Reload saved state
                    </button>
                </div>
            )}
            {custom ? (
                <SimulatorPhoneShell
                    useHostNav
                    nav={
                        <SimulatorPhoneNav
                            state={{
                                ...state,
                                view: { ...state.view, showPrimaryMenu: true },
                            }}
                            dispatch={(action) => {
                                setPage(null);
                                dispatch(action);
                            }}
                        />
                    }
                >
                    {decorate(content)}
                </SimulatorPhoneShell>
            ) : (
                decorate(content)
            )}
        </>
    );
}

export function SimulatorDeviceApps(props: Parameters<typeof DeviceAppsContent>[0]) {
    return (
        <SimulatorDeviceAppsProvider>
            <DeviceAppsContent {...props} />
        </SimulatorDeviceAppsProvider>
    );
}
