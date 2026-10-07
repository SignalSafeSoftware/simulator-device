import type { ComponentProps, ReactNode } from 'react';
import type { DeviceStore } from '@signalsafe/simulator-core/apps/store';
import { LockSettings } from '@signalsafe/simulator-react/apps/lock/LockScreen';
import { AppSecondaryNav } from '@signalsafe/simulator-react/apps/shared/AppSecondaryNav';
import { SimulatorPage } from '@signalsafe/simulator-react/ui/layout/SimulatorPage';
import { SIM_SCREEN_HEADER } from '@signalsafe/simulator-react/ui/styles/semanticSimulatorClasses';
import { useSimulatorLocale } from '@signalsafe/simulator-react/i18n/SimulatorLocale';
import SimulatorAppearanceSettings from '../appearance/SimulatorAppearanceSettings.js';
import SimulatorPhoneShell from '../phone/SimulatorPhoneShell.js';

export interface SimulatorDeviceSettingsProps {
    store: DeviceStore;
    onLock: () => void;
    appearance?: ComponentProps<typeof SimulatorAppearanceSettings>;
    /** Host adapter for the shared regional form and host persistence. */
    regional?: ReactNode;
    /** Explicit host features, such as device data, blocked numbers or contact merging. */
    children?: ReactNode;
    onBack?: () => void;
}

/** Shared device settings; hosts retain preferences and service integration. */
export default function SimulatorDeviceSettings({
    store,
    onLock,
    appearance,
    regional,
    children,
    onBack,
}: Readonly<SimulatorDeviceSettingsProps>) {
    const { t } = useSimulatorLocale();
    const title = t('nav.settings');
    const content = (
        <SimulatorPage
            className='simulator-app-page'
            header={<h2 className={SIM_SCREEN_HEADER}>{title}</h2>}
        >
            <div className='simulator-settings__sections'>
                {appearance && <SimulatorAppearanceSettings {...appearance} />}
                {regional}
                <LockSettings store={store} onLock={onLock} />
                {children}
            </div>
        </SimulatorPage>
    );
    if (!onBack) return content;
    return (
        <SimulatorPhoneShell
            useHostNav
            nav={
                <AppSecondaryNav
                    actions={[
                        { label: title, icon: '⚙', active: true },
                        { label: t('app.back'), icon: '↩', onClick: onBack },
                    ]}
                />
            }
        >
            {content}
        </SimulatorPhoneShell>
    );
}
