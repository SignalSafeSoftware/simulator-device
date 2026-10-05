import { useMemo, useReducer, useState } from 'react';
import { createRoot } from 'react-dom/client';
import SimulatorVault from '@signalsafe/simulator-react/apps/vault/Vault';
import SimulatorPhotos from '@signalsafe/simulator-react/apps/photos/Photos';
import SimulatorMailbox from '@signalsafe/simulator-react/apps/mail/Mailbox';
import { LockSettings as SimulatorLockSettings } from '@signalsafe/simulator-react/apps/lock/LockScreen';
import SimulatorBrowserWorkbench from '@signalsafe/simulator-react/apps/browser/BrowserWorkbench';
import { SimulatorDeviceAppsProvider } from '@signalsafe/simulator-device/apps/SimulatorDeviceAppsProvider';
import { SimulatorCallBoundary } from '@signalsafe/simulator-device/runtime/SimulatorCallBoundary';
import '@signalsafe/simulator-theme-bootstrap/styles.css';
import { createMemoryStore } from './memoryStore';
function Demo() {
    const [, refresh] = useReducer((value: number) => value + 1, 0);
    const store = useMemo(() => createMemoryStore(refresh), []);
    const [screen, setScreen] = useState('Vault');
    const [calling, setCalling] = useState(false);
    const back = () => setScreen('Vault');
    const renderScreen = () => {
        if (screen === 'Vault') return <SimulatorVault store={store} onBack={back} />;
        if (screen === 'Photos') return <SimulatorPhotos store={store} onBack={back} />;
        if (screen === 'Mail') return <SimulatorMailbox store={store} onBack={back} />;
        if (screen === 'Settings') return <SimulatorLockSettings store={store} onLock={() => {}} />;
        return <SimulatorBrowserWorkbench templates={null} />;
    };
    return (
        <main className='simulator-root' style={{ maxWidth: 390, margin: 'auto' }}>
            <nav aria-label='Demo apps'>
                {['Vault', 'Photos', 'Mail', 'Settings', 'Internet'].map((name) => (
                    <button key={name} onClick={() => setScreen(name)}>
                        {name}
                    </button>
                ))}
            </nav>
            <button onClick={() => setCalling(true)}>Simulate call overlay</button>
            <SimulatorDeviceAppsProvider>
                <SimulatorCallBoundary
                    active={calling}
                    call={
                        <section>
                            <h2>Synthetic call</h2>
                            <button onClick={() => setCalling(false)}>End synthetic call</button>
                        </section>
                    }
                >
                    {renderScreen()}
                </SimulatorCallBoundary>
            </SimulatorDeviceAppsProvider>
        </main>
    );
}
const root = document.getElementById('root');
if (root) createRoot(root).render(<Demo />);
