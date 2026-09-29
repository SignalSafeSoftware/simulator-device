import { useMemo, useReducer, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
    SimulatorVault,
    SimulatorPhotos,
    SimulatorMailbox,
    SimulatorLockSettings,
    SimulatorBrowserWorkbench,
} from '@signalsafe/simulator-react';
import { SimulatorDeviceAppsProvider, SimulatorCallBoundary } from '@signalsafe/simulator-device';
import '@signalsafe/simulator-theme-bootstrap/styles.css';
import { createMemoryStore } from './memoryStore';
function Demo() {
    const [, refresh] = useReducer((value: number) => value + 1, 0);
    const store = useMemo(() => createMemoryStore(refresh), []);
    const [screen, setScreen] = useState('Vault');
    const [calling, setCalling] = useState(false);
    const back = () => setScreen('Vault');
    return (
        <main className="simulator-root" style={{ maxWidth: 390, margin: 'auto' }}>
            <nav aria-label="Demo apps">
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
                    {screen === 'Vault' ? (
                        <SimulatorVault store={store} onBack={back} />
                    ) : screen === 'Photos' ? (
                        <SimulatorPhotos store={store} onBack={back} />
                    ) : screen === 'Mail' ? (
                        <SimulatorMailbox store={store} onBack={back} />
                    ) : screen === 'Settings' ? (
                        <SimulatorLockSettings store={store} onLock={() => {}} />
                    ) : (
                        <SimulatorBrowserWorkbench templates={null} />
                    )}
                </SimulatorCallBoundary>
            </SimulatorDeviceAppsProvider>
        </main>
    );
}
const root = document.getElementById('root');
if (root) createRoot(root).render(<Demo />);
