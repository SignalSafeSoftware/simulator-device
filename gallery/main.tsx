import { SimulatorDispatchActionType } from '@signalsafe/simulator-react/state/simulatorDispatchActions';
import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ContactValuesEditor } from '@signalsafe/simulator-react/ui/contacts/ContactValuesEditor';
import { ContactPhotoControls } from '@signalsafe/simulator-react/ui/contacts/ContactPhotoControls';
import PhoneContactEditor from '@signalsafe/simulator-react/views/contacts/PhoneContactEditor';
import {
    SimulatorCapabilitiesContext,
    useSimulatorCapabilities,
} from '@signalsafe/simulator-react/contract/capabilities';
import { SimulatorListLoadingContext } from '@signalsafe/simulator-react/ui/lists/SimulatorListGroup';
import { MessageComposeContext } from '@signalsafe/simulator-react/contract/messageComposeContract';
import { simulatorSessionReducer } from '@signalsafe/simulator-react/state/simulatorSessionReducer';
import type { SimulatorDispatchAction } from '@signalsafe/simulator-react/state/simulatorDispatchActions';
import type { EditableContactValue } from '@signalsafe/simulator-react/ui/contacts/ContactValuesEditor';
import type { SimulatorScreenOverrideProps } from '@signalsafe/simulator-react/contract/screenOverrides';
import SimulatorPhoneDevice from '../src/phone/SimulatorPhoneDevice.js';
import { SimulatorDeviceApps } from '../src/apps/SimulatorDeviceApps.js';
import { fixture, createGalleryStore, type GalleryState } from './fixtures.js';
import '@signalsafe/simulator-theme-bootstrap/styles.css';
import './styles.css';

function EditContact({ onBack }: SimulatorScreenOverrideProps) {
    const { changePhoto } = useSimulatorCapabilities();
    const [values, setValues] = useState<EditableContactValue[]>([
        { id: 'one', label: 'Mobile', value: '+12025550123' },
    ]);
    const [preferred, setPreferred] = useState<string | null>('one');
    return (
        <section className="simulator-app-page">
            <h2 className="simulator-screen__header">Add contact</h2>
            <div className="simulator-contact-editor-layout">
                <PhoneContactEditor
                    defaultName="Synthetic person"
                    identityImage={
                        <ContactPhotoControls
                            capability={changePhoto ?? { state: 'enabled' }}
                            restoreCapability={{
                                state: 'unsupported',
                                reason: 'This new contact has no original image.',
                            }}
                            onSelect={() => {}}
                            onRemove={() => {}}
                            onRestore={() => {}}
                        />
                    }
                    valueFields={
                        <ContactValuesEditor
                            kind="phone"
                            values={values}
                            preferredId={preferred}
                            createId={() => crypto.randomUUID()}
                            onChange={(next, id) => {
                                setValues(next);
                                setPreferred(id);
                            }}
                        />
                    }
                    onCancel={onBack}
                    onSubmit={(event) => {
                        event.preventDefault();
                        onBack();
                    }}
                />
            </div>
        </section>
    );
}
function Gallery() {
    const [surface, setSurface] = useState('scenario');
    const [unlocked, setUnlocked] = useState(true);
    const [mode, setMode] = useState<GalleryState>('populated');
    const [state, setState] = useState(() => fixture('populated'));
    const [theme, setTheme] = useState('light');
    const [width, setWidth] = useState('375');
    const [scale, setScale] = useState('100');
    const [message, setMessage] = useState({ phoneNumber: '', messageBody: '' });
    const [status, setStatus] = useState('');
    const store = useMemo(() => createGalleryStore(mode), [mode]);
    const navigate = (
        action: Extract<
            SimulatorDispatchAction,
            { type: typeof SimulatorDispatchActionType.NavLocal }
        >,
    ) =>
        setState((current) =>
            simulatorSessionReducer(
                simulatorSessionReducer(current, {
                    type: SimulatorDispatchActionType.SwitchApp,
                    app: action.app,
                }),
                action,
            ),
        );
    const disabled = mode === 'disabled' || mode === 'loading';
    const capabilities = useMemo(() => {
        const capability = disabled
            ? {
                  state: 'unavailable' as const,
                  reason: 'Synthetic unavailable state. Change the gallery state to enable actions.',
              }
            : { state: 'enabled' as const };
        return {
            call: capability,
            sendEmail: capability,
            sendMessage: capability,
            editContact: capability,
            changePhoto: capability,
        };
    }, [disabled]);
    const messageCompose = useMemo(
        () => ({
            draft: message,
            onChange: setMessage,
            onAccepted: () => setStatus('Accepted by this preview only.'),
        }),
        [message],
    );
    const scenario = (
        <SimulatorPhoneDevice
            state={state}
            dispatch={(action) => {
                setState((current) => simulatorSessionReducer(current, action));
                if (action.type === SimulatorDispatchActionType.SimulatorAction) {
                    setStatus(`Preview action: ${action.action.type}`);
                }
            }}
            contactDetail={{
                mode: 'editable',
                onSave: () => setStatus('Contact accepted in preview only.'),
            }}
            screenOverrides={{ phone: { add_contact: EditContact } }}
            emailCompose={{
                onSend: () => {
                    if (mode === 'error') {
                        return Promise.reject(
                            new Error('Synthetic send failure. Your draft is preserved.'),
                        );
                    }
                    setStatus('Email accepted in preview only.');
                    return Promise.resolve();
                },
            }}
        />
    );
    return (
        <main data-theme={theme}>
            <style>{`:root { font-size: ${scale}%; }`}</style>
            <h1>Simulator UI gallery</h1>
            <p>
                Synthetic fixtures only. Actions stay in this page; no calls, messages, or API
                requests are made.
            </p>
            <div className="gallery-controls">
                <label>
                    Surface{' '}
                    <select value={surface} onChange={(event) => setSurface(event.target.value)}>
                        <option>scenario</option>
                        <option>device apps</option>
                    </select>
                </label>
                <label>
                    State{' '}
                    <select
                        value={mode}
                        onChange={(event) => {
                            const next = event.target.value as GalleryState;
                            setMode(next);
                            setState(fixture(next));
                            setStatus('');
                        }}
                    >
                        {['populated', 'empty', 'loading', 'disabled', 'error'].map((value) => (
                            <option key={value}>{value}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Theme{' '}
                    <select value={theme} onChange={(event) => setTheme(event.target.value)}>
                        <option>light</option>
                        <option>dark</option>
                        <option>night mint</option>
                        <option>high contrast</option>
                    </select>
                </label>
                <label>
                    Width{' '}
                    <select value={width} onChange={(event) => setWidth(event.target.value)}>
                        {['320', '375', '430', '520'].map((value) => (
                            <option key={value}>{value}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Text size{' '}
                    <select value={scale} onChange={(event) => setScale(event.target.value)}>
                        {['100', '150', '200'].map((value) => (
                            <option key={value}>{value}</option>
                        ))}
                    </select>
                </label>
            </div>
            <div className="gallery-controls" aria-label="Preview screens">
                <button
                    onClick={() => {
                        setSurface('device apps');
                        setUnlocked(false);
                    }}
                >
                    Device lock screen
                </button>
                <button onClick={() => setUnlocked(true)}>Unlock preview</button>
                {(
                    [
                        'dial',
                        'contacts',
                        'history',
                        'incoming_call',
                        'add_contact',
                        'voicemail',
                        'directory',
                    ] as const
                ).map((screen) => (
                    <button
                        key={screen}
                        onClick={() =>
                            navigate({
                                type: SimulatorDispatchActionType.NavLocal,
                                app: 'phone',
                                screen,
                            })
                        }
                    >
                        {screen.replace('_', ' ')}
                    </button>
                ))}
                {(
                    [
                        { app: 'messages', screen: 'threads' },
                        { app: 'messages', screen: 'new_thread' },
                        { app: 'messages', screen: 'thread_detail' },
                        { app: 'email', screen: 'list' },
                        { app: 'email', screen: 'detail' },
                        { app: 'email', screen: 'compose' },
                        { app: 'internet', screen: 'landing' },
                        { app: 'home', screen: 'home' },
                        { app: 'home', screen: 'settings' },
                        { app: 'home', screen: 'store' },
                    ] as const
                ).map(({ app, screen }) => (
                    <button
                        key={`${app}:${screen}`}
                        onClick={() =>
                            navigate({ type: SimulatorDispatchActionType.NavLocal, app, screen })
                        }
                    >
                        {app} {screen}
                    </button>
                ))}
            </div>
            <output>{status}</output>
            {mode === 'error' && (
                <p role="alert">Synthetic refresh failed. Existing preview data remains visible.</p>
            )}
            <div
                className="simulator-root simulator-host-device"
                style={{ width: `${width}px`, maxWidth: '100%' }}
            >
                <SimulatorCapabilitiesContext.Provider value={capabilities}>
                    <SimulatorListLoadingContext.Provider value={mode === 'loading'}>
                        <MessageComposeContext.Provider value={messageCompose}>
                            {surface === 'device apps' ? (
                                <SimulatorDeviceApps
                                    homeHeader={
                                        <time
                                            className="prototype-home-clock"
                                            dateTime="2026-10-03T16:30:00Z"
                                        >
                                            <span>Saturday, October 3, 2026</span>
                                            <strong>4:30:00 PM</strong>
                                        </time>
                                    }
                                    store={store}
                                    unlocked={unlocked}
                                    onUnlock={() => setUnlocked(true)}
                                    onLock={() => setUnlocked(false)}
                                    state={state}
                                    dispatch={(action) =>
                                        setState((current) =>
                                            simulatorSessionReducer(current, action),
                                        )
                                    }
                                    openSettings={() =>
                                        navigate({
                                            type: SimulatorDispatchActionType.NavLocal,
                                            app: 'home',
                                            screen: 'settings',
                                        })
                                    }
                                >
                                    {scenario}
                                </SimulatorDeviceApps>
                            ) : (
                                scenario
                            )}
                        </MessageComposeContext.Provider>
                    </SimulatorListLoadingContext.Provider>
                </SimulatorCapabilitiesContext.Provider>
            </div>
        </main>
    );
}
const root = document.getElementById('root');
if (!root) {
    throw new Error('Gallery root missing');
}
createRoot(root).render(<Gallery />);
