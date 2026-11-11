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
/** Load selected records through the store, preserving its paging and cancellation behavior. */
export function useSimulatorStartingNavigation(
    store: DeviceStore,
    target: SimulatorEntryTarget | undefined,
    propsHomePage: 'vault' | 'photos' | null | undefined,
    onHomePageChange: ((page: 'vault' | 'photos' | null) => void) | undefined,
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
    const [localPage, setLocalPage] = useState<'vault' | 'photos' | null>(() =>
        target?.kind === 'vault-folder' || target?.kind === 'vault-entry'
            ? 'vault'
            : target?.kind === 'photo'
              ? 'photos'
              : null,
    );
    const page = propsHomePage === undefined ? localPage : propsHomePage;
    const setPage = (next: 'vault' | 'photos' | null) => {
        setLocalPage(next);
        onHomePageChange?.(next);
    };
    const home = () => {
        setPage(null);
        dispatch({ type: SimulatorDispatchActionType.SwitchApp, app: SimulatorApp.Home });
    };
    return { page, setPage, home, initialVaultNavigation, initialPhotoNavigation };
}
