import { StoreLoading, StoreNotice } from './SimulatorStoreStatus.js';
import type { PhotoNavigation } from '@signalsafe/simulator-react/apps/photos/Photos';
import type { VaultNavigation } from '@signalsafe/simulator-react/apps/vault/Vault';
import type { Secret } from '@signalsafe/simulator-core/apps/contracts';
import { HomeWidgets } from '@signalsafe/simulator-react/views/home/HomeWidgets';
import { HomeSettingsSectionList } from '@signalsafe/simulator-react/views/home/HomeSettingsScreen';
import type { SimulatorHomePayload } from '@signalsafe/simulator-react/types/session';
import SimulatorDeviceSettings, {
    type SimulatorDeviceSettingsProps,
} from './SimulatorDeviceSettings.js';
import { SimulatorHomeScreenId } from '@signalsafe/simulator-core/devicePayload';
import {
    SimulatorDispatchActionType,
    type SimulatorDispatchAction,
} from '@signalsafe/simulator-react/state/simulatorDispatchActions';
import { SimulatorApp } from '@signalsafe/simulator-core/simulatorApp';
import { type ReactNode } from 'react';
import DeviceHome from '@signalsafe/simulator-react/apps/home/DeviceHome';
import type { HomeClockOptions } from '@signalsafe/simulator-react/apps/home/HomeClock';
import type { SimulatorSessionState } from '@signalsafe/simulator-react/types/session';
import SimulatorPhoneShell from '../phone/SimulatorPhoneShell.js';
import SimulatorPhoneNav from '../phone/SimulatorPhoneNav.js';
import type { DeviceStore } from '@signalsafe/simulator-core/apps/store';
import Vault from '@signalsafe/simulator-react/apps/vault/Vault';
import Photos from '@signalsafe/simulator-react/apps/photos/Photos';
import { SimulatorDeviceMailbox } from './SimulatorDeviceMailbox.js';
import { useSimulatorStartingNavigation } from './useSimulatorStartingNavigation.js';
import ScenarioBrowserWorkbench from '@signalsafe/simulator-react/apps/browser/ScenarioBrowserWorkbench';
import { LockScreen } from '@signalsafe/simulator-react/apps/lock/LockScreen';
import { SimulatorDeviceAppsProvider } from './SimulatorDeviceAppsProvider.js';
const DeviceAppsPage = Object.freeze({ Vault: 'vault', Photos: 'photos' } as const);
type DeviceAppsPage = (typeof DeviceAppsPage)[keyof typeof DeviceAppsPage];

interface DeviceAppsContentProps {
    homePage?: DeviceAppsPage | null;
    onHomePageChange?: (page: DeviceAppsPage | null) => void;
    settings?: Omit<SimulatorDeviceSettingsProps, 'store' | 'onLock' | 'onBack'>;
    homeHeader?: ReactNode;
    homeClock?: HomeClockOptions;
    renderMailbox?: (onBack: () => void) => ReactNode;
    selectedEmailId?: string;
    onSelectedEmailChange?: (id: string | undefined) => void;
    decorate?: (content: ReactNode) => ReactNode;
    browserThemeCss?: string;
    store: DeviceStore;
    unlocked: boolean;
    onUnlock: () => void;
    photoNavigation?: PhotoNavigation;
    onSelectedPhotoChange?: (id: string | undefined) => void;
    vaultNavigation?: VaultNavigation;
    vaultSecretDraft?: Secret | null;
    onVaultSecretDraftChange?: (draft: Secret | null) => void;
    onSelectedVaultFolderChange?: (folder: string | null) => void;
    onSelectedVaultSecretChange?: (id: string) => void;
    onLock: () => void;
    state: SimulatorSessionState;
    dispatch: (action: SimulatorDispatchAction) => void;
    openSettings: () => void;
    children: ReactNode;
}

function HomeContent({
    store,
    page,
    setPage,
    homeHeader,
    homeClock,
    scenarioHome,
    openSettings,
    onLock,
    photoNavigation,
    onSelectedPhotoChange,
    vaultNavigation,
    vaultSecretDraft,
    onVaultSecretDraftChange,
    onSelectedVaultFolderChange,
    onSelectedVaultSecretChange,
}: Readonly<
    Pick<
        DeviceAppsContentProps,
        | 'store'
        | 'homeHeader'
        | 'homeClock'
        | 'openSettings'
        | 'onLock'
        | 'photoNavigation'
        | 'onSelectedPhotoChange'
        | 'vaultNavigation'
        | 'vaultSecretDraft'
        | 'onVaultSecretDraftChange'
        | 'onSelectedVaultFolderChange'
        | 'onSelectedVaultSecretChange'
    > & {
        page: DeviceAppsPage | null;
        setPage: (page: DeviceAppsPage | null) => void;
        scenarioHome: SimulatorHomePayload | null;
    }
>) {
    if (page === DeviceAppsPage.Vault)
        return (
            <Vault
                store={store}
                onBack={() => setPage(null)}
                navigation={vaultNavigation}
                secretDraft={vaultSecretDraft}
                onSecretDraftChange={onVaultSecretDraftChange}
                onSelectedFolderChange={onSelectedVaultFolderChange}
                onSelectedSecretChange={onSelectedVaultSecretChange}
            />
        );
    if (page === DeviceAppsPage.Photos)
        return (
            <Photos
                store={store}
                onBack={() => setPage(null)}
                navigation={photoNavigation}
                onSelectedPhotoChange={onSelectedPhotoChange}
            />
        );
    return (
        <DeviceHome
            homeClock={homeClock}
            homeHeader={homeHeader}
            onOpenSettings={openSettings}
            onOpenVault={() => setPage(DeviceAppsPage.Vault)}
            onOpenPhotos={() => setPage(DeviceAppsPage.Photos)}
            onLock={store.data?.lock ? onLock : undefined}
        >
            <HomeWidgets widgets={scenarioHome?.widgets ?? []} />
        </DeviceHome>
    );
}

function DeviceAppsContent({
    homePage: propsHomePage,
    onHomePageChange,
    store,
    unlocked,
    onUnlock,
    onLock,
    photoNavigation,
    onSelectedPhotoChange,
    vaultNavigation,
    vaultSecretDraft,
    onVaultSecretDraftChange,
    onSelectedVaultFolderChange,
    onSelectedVaultSecretChange,
    state,
    dispatch,
    openSettings,
    browserThemeCss = '',
    homeHeader,
    homeClock,
    settings,
    renderMailbox,
    selectedEmailId,
    onSelectedEmailChange,
    decorate = (content) => content,
    children,
}: Readonly<DeviceAppsContentProps>) {
    const target = state.payload.entryPoint?.target;
    const { page, setPage, home, initialVaultNavigation, initialPhotoNavigation } =
        useSimulatorStartingNavigation(store, target, propsHomePage, onHomePageChange, dispatch);
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
                homeClock={homeClock}
                homeHeader={homeHeader}
                photoNavigation={photoNavigation ?? initialPhotoNavigation}
                onSelectedPhotoChange={onSelectedPhotoChange}
                vaultNavigation={vaultNavigation ?? initialVaultNavigation}
                vaultSecretDraft={vaultSecretDraft}
                onVaultSecretDraftChange={onVaultSecretDraftChange}
                onSelectedVaultFolderChange={onSelectedVaultFolderChange}
                onSelectedVaultSecretChange={onSelectedVaultSecretChange}
                scenarioHome={state.payload.home}
                openSettings={openSettings}
                onLock={onLock}
            />
        );
    } else if (
        activeApp === SimulatorApp.Home &&
        homeView.screen === SimulatorHomeScreenId.Settings &&
        settings
    ) {
        content = (
            <SimulatorDeviceSettings
                {...settings}
                store={store}
                onLock={onLock}
                onBack={() => {
                    setPage(null);
                    dispatch({
                        type: SimulatorDispatchActionType.NavLocal,
                        app: SimulatorApp.Home,
                        screen: SimulatorHomeScreenId.Home,
                    });
                }}
            >
                <HomeSettingsSectionList sections={state.payload.home?.settingsSections ?? []} />
                {settings.children}
            </SimulatorDeviceSettings>
        );
    } else if (activeApp === SimulatorApp.Email) {
        content = renderMailbox ? (
            renderMailbox(home)
        ) : (
            <SimulatorDeviceMailbox
                store={store}
                onBack={home}
                screen={state.view.email.screen}
                selectedEmailId={selectedEmailId}
                target={target}
                onSelectedEmailChange={onSelectedEmailChange}
            />
        );
    } else if (activeApp === SimulatorApp.Internet) {
        content = (
            <ScenarioBrowserWorkbench
                payload={state.payload.browser}
                screen={state.view.internet.screen}
                onNavigate={(screen) => {
                    if (screen !== state.view.internet.screen)
                        dispatch({
                            type: SimulatorDispatchActionType.NavLocal,
                            app: SimulatorApp.Internet,
                            screen,
                        });
                }}
                themeCss={browserThemeCss}
                onAction={(action) =>
                    dispatch({ type: SimulatorDispatchActionType.SimulatorAction, action })
                }
            />
        );
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
