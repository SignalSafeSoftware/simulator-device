import {
    SimulatorButtonTone,
    simBtnToneClass,
} from '@signalsafe/simulator-react/ui/styles/simulatorClasses';
import { SIM_APP_PAGE_CONTENT } from '@signalsafe/simulator-react/ui/styles/semanticSimulatorClasses';
import { SimulatorHomeScreenId } from '@signalsafe/simulator-core/devicePayload';
import { SimulatorDispatchActionType } from '@signalsafe/simulator-react/state/simulatorDispatchActions';
import { SimulatorApp } from '@signalsafe/simulator-core/simulatorApp';
import { useState, type ReactNode } from 'react';
import DeviceHome from '@signalsafe/simulator-react/apps/home/DeviceHome';
import type { SimulatorSessionState } from '@signalsafe/simulator-react/types/session';
import type { SimulatorDispatchAction } from '@signalsafe/simulator-react/state/simulatorDispatchActions';
import SimulatorPhoneShell from '../phone/SimulatorPhoneShell.js';
import SimulatorPhoneNav from '../phone/SimulatorPhoneNav.js';
import { useSimulatorLocale } from '@signalsafe/simulator-react/i18n/SimulatorLocale';
import type { DeviceStore } from '@signalsafe/simulator-core/apps/store';
import Vault from '@signalsafe/simulator-react/apps/vault/Vault';
import Photos from '@signalsafe/simulator-react/apps/photos/Photos';
import Mailbox from '@signalsafe/simulator-react/apps/mail/Mailbox';
import BrowserWorkbench from '@signalsafe/simulator-react/apps/browser/BrowserWorkbench';
import { LockScreen } from '@signalsafe/simulator-react/apps/lock/LockScreen';
import { SimulatorDeviceAppsProvider } from './SimulatorDeviceAppsProvider.js';
const DeviceAppsPage = Object.freeze({ Vault: 'vault', Photos: 'photos' } as const);
type DeviceAppsPage = (typeof DeviceAppsPage)[keyof typeof DeviceAppsPage];

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
    const [page, setPage] = useState<DeviceAppsPage | null>(null);
    const { t } = useSimulatorLocale();
    const home = () => {
        setPage(null);
        dispatch({ type: SimulatorDispatchActionType.SwitchApp, app: SimulatorApp.Home });
    };
    if (!store.data)
        return (
            <section className={SIM_APP_PAGE_CONTENT}>
                <output>{store.error || t('app.device.loading')}</output>
                <button
                    className={simBtnToneClass(SimulatorButtonTone.NeutralOutline)}
                    onClick={() => void store.reload()}
                >
                    {t('app.retry')}
                </button>
            </section>
        );
    if (store.data.lock && !unlocked) return <LockScreen store={store} onUnlock={onUnlock} />;
    let content: ReactNode = children;
    if (
        state.view.activeApp === SimulatorApp.Home &&
        state.view.home.screen === SimulatorHomeScreenId.Home
    ) {
        content =
            page === DeviceAppsPage.Vault ? (
                <Vault store={store} onBack={() => setPage(null)} />
            ) : page === DeviceAppsPage.Photos ? (
                <Photos store={store} onBack={() => setPage(null)} />
            ) : (
                <DeviceHome
                    homeHeader={homeHeader}
                    onOpenSettings={openSettings}
                    onOpenVault={() => setPage(DeviceAppsPage.Vault)}
                    onOpenPhotos={() => setPage(DeviceAppsPage.Photos)}
                    onLock={store.data.lock ? onLock : undefined}
                />
            );
    } else if (state.view.activeApp === SimulatorApp.Email)
        content = renderMailbox ? renderMailbox(home) : <Mailbox store={store} onBack={home} />;
    else if (state.view.activeApp === SimulatorApp.Internet)
        content = <BrowserWorkbench templates={children} themeCss={browserThemeCss} />;
    const custom =
        state.view.activeApp === SimulatorApp.Internet ||
        (state.view.activeApp === SimulatorApp.Home &&
            state.view.home.screen === SimulatorHomeScreenId.Home &&
            page === null);
    return (
        <>
            {store.error && (
                <div className="device-notice" role="alert">
                    {store.error}
                    <button
                        className={simBtnToneClass(SimulatorButtonTone.NeutralOutline)}
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
