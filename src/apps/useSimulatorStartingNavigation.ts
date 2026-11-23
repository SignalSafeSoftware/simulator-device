import { useMemo, useState } from 'react';
import { SimulatorApp } from '@signalsafe/simulator-core/simulatorApp';
import {
    SimulatorDispatchActionType,
    type SimulatorDispatchAction,
} from '@signalsafe/simulator-react/state/simulatorDispatchActions';
import type { DeviceStore } from '@signalsafe/simulator-core/apps/store';
import type { SimulatorEntryTarget } from '@signalsafe/simulator-core/devicePayload';
import type { VaultNavigation } from '@signalsafe/simulator-react/apps/vault/Vault';
import type { PhotoNavigation } from '@signalsafe/simulator-react/apps/photos/Photos';
import { useDeviceRecord } from '@signalsafe/simulator-react/hooks/device/useDeviceRecord';
type HomePage = 'vault' | 'photos' | null;

function startingHomePage(target: SimulatorEntryTarget | undefined): HomePage {
    if (target?.kind === 'vault-folder' || target?.kind === 'vault-entry') return 'vault';
    if (target?.kind === 'photo') return 'photos';
    return null;
}

/** Load selected records through the store, preserving its paging and cancellation behavior. */
export function useSimulatorStartingNavigation(
    store: DeviceStore,
    target: SimulatorEntryTarget | undefined,
    propsHomePage: HomePage | undefined,
    onHomePageChange: ((page: HomePage) => void) | undefined,
    dispatch: (action: SimulatorDispatchAction) => void,
) {
    const { record: initialSecret } = useDeviceRecord(
        store,
        'secrets',
        target?.kind === 'vault-entry' ? target.id : null,
    );
    const { record: initialPhoto } = useDeviceRecord(
        store,
        'photos',
        target?.kind === 'photo' ? target.id : null,
    );
    const initialVaultNavigation = useMemo((): VaultNavigation | undefined => {
        if (target?.kind === 'vault-folder') return { revision: 0, folder: target.folder };
        if (target?.kind !== 'vault-entry') return undefined;
        const secret = initialSecret;
        return secret ? { revision: 0, folder: secret.folder, secret, existing: true } : undefined;
    }, [target, initialSecret]);
    const initialPhotoNavigation = useMemo((): PhotoNavigation | undefined => {
        if (target?.kind !== 'photo') return undefined;
        const photo = initialPhoto;
        return photo ? { revision: 0, photo } : undefined;
    }, [target, initialPhoto]);
    const [localPage, setLocalPage] = useState<HomePage>(() => startingHomePage(target));
    const page = propsHomePage === undefined ? localPage : propsHomePage;
    const setPage = (next: HomePage) => {
        setLocalPage(next);
        onHomePageChange?.(next);
    };
    const home = () => {
        setPage(null);
        dispatch({ type: SimulatorDispatchActionType.SwitchApp, app: SimulatorApp.Home });
    };
    return { page, setPage, home, initialVaultNavigation, initialPhotoNavigation };
}
