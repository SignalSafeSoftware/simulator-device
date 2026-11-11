import type { DeviceStore } from '@signalsafe/simulator-core/apps/store';
import { SIM_APP_PAGE_CONTENT } from '@signalsafe/simulator-react/ui/styles/semanticSimulatorClasses';
import {
    SimulatorButtonTone,
    simBtnToneClass,
} from '@signalsafe/simulator-react/ui/styles/simulatorClasses';
import { useSimulatorLocale } from '@signalsafe/simulator-react/i18n/SimulatorLocale';
const OUTLINE_BUTTON = simBtnToneClass(SimulatorButtonTone.NeutralOutline);

export function StoreLoading({ store }: Readonly<{ store: DeviceStore }>) {
    const { t } = useSimulatorLocale();
    return (
        <section className={SIM_APP_PAGE_CONTENT}>
            <output>{store.error || t('app.device.loading')}</output>
            <button className={OUTLINE_BUTTON} onClick={() => void store.reload()}>
                {t('app.retry')}
            </button>
        </section>
    );
}

export function StoreNotice({ store }: Readonly<{ store: DeviceStore }>) {
    if (!store.error) return null;
    return (
        <div className='device-notice' role='alert'>
            {store.error}
            <button className={OUTLINE_BUTTON} onClick={() => void store.reload()}>
                {/* Use t('app.device.reloadState') once simulator-react 0.19.2 is published. */}
                Reload saved state
            </button>
        </div>
    );
}
