import {
    SimulatorButtonTone,
    simBtnToneClass,
} from '@signalsafe/simulator-react/ui/styles/simulatorClasses';
import { SIM_APP_PAGE_CONTENT } from '@signalsafe/simulator-react/ui/styles/semanticSimulatorClasses';
import { SimulatorHomeScreenId } from '@signalsafe/simulator-core/devicePayload';
import {
    SimulatorDispatchActionType,
    type SimulatorDispatchAction,
} from '@signalsafe/simulator-react/state/simulatorDispatchActions';
import { SimulatorApp } from '@signalsafe/simulator-core/simulatorApp';
import { useState, type ReactNode } from 'react';
import DeviceHome from '@signalsafe/simulator-react/apps/home/DeviceHome';
import type { SimulatorSessionState } from '@signalsafe/simulator-react/types/session';
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

interface DeviceAppsContentProps {
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
}

function StoreLoading({ store }: Readonly<{ store: DeviceStore }>) {
    const { t } = useSimulatorLocale();
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
}

function StoreNotice({ store }: Readonly<{ store: DeviceStore }>) {
    if (!store.error) return null;
    return (
        <div className="device-notice" role="alert">
            {store.error}
            <button
                className={simBtnToneClass(SimulatorButtonTone.NeutralOutline)}
                onClick={() => void store.reload()}
            >
                {/* Use t('app.device.reloadState') once simulator-react 0.19.2 is published. */}
                Reload saved state
            </button>
        </div>
    );
}

function HomeContent({
    store,
    page,
    setPage,
    homeHeader,
    openSettings,
    onLock,
}: Readonly<{
    store: DeviceStore;
    page: DeviceAppsPage | null;
    setPage: (page: DeviceAppsPage | null) => void;
    homeHeader?: ReactNode;
    openSettings: () => void;
    onLock: () => void;
}>) {
    if (page === DeviceAppsPage.Vault) return <Vault store={store} onBack={() => setPage(null)} />;
    if (page === DeviceAppsPage.Photos)
        return <Photos store={store} onBack={() => setPage(null)} />;
    return (
        <DeviceHome
            homeHeader={homeHeader}
            onOpenSettings={openSettings}
            onOpenVault={() => setPage(DeviceAppsPage.Vault)}
            onOpenPhotos={() => setPage(DeviceAppsPage.Photos)}
            onLock={store.data?.lock ? onLock : undefined}
        />
    );
}

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
}: Readonly<DeviceAppsContentProps>) {
    const [page, setPage] = useState<DeviceAppsPage | null>(null);
    const home = () => {
        setPage(null);
        dispatch({ type: SimulatorDispatchActionType.SwitchApp, app: SimulatorApp.Home });
    };
    if (!store.data) return <StoreLoading store={store} />;
    if (store.data.lock && !unlocked) return <LockScreen store={store} onUnlock={onUnlock} />;
    const { activeApp, home: homeView } = state.view;
    const onHomeScreen =
        activeApp === SimulatorApp.Home && homeView.screen === SimulatorHomeScreenId.Home;
    let content: ReactNode = children;
    if (onHomeScreen) {
        content = (
            <HomeContent
                store={store}
                page={page}
                setPage={setPage}
                homeHeader={homeHeader}
                openSettings={openSettings}
                onLock={onLock}
            />
        );
    } else if (activeApp === SimulatorApp.Email) {
        content = renderMailbox ? renderMailbox(home) : <Mailbox store={store} onBack={home} />;
    } else if (activeApp === SimulatorApp.Internet) {
        content = <BrowserWorkbench templates={children} themeCss={browserThemeCss} />;
    }
    const custom = activeApp === SimulatorApp.Internet || (onHomeScreen && page === null);
    return (
        <>
            <StoreNotice store={store} />
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

export function SimulatorDeviceApps(props: Readonly<DeviceAppsContentProps>) {
    return (
        <SimulatorDeviceAppsProvider>
            <DeviceAppsContent {...props} />
        </SimulatorDeviceAppsProvider>
    );
}
