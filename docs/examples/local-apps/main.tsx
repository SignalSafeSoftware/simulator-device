import RegionalSettings from '@signalsafe/simulator-react/apps/settings/RegionalSettings';
import {
    RegionalDateFormat,
    RegionalTimeFormat,
    regionalLocale,
    type RegionalPreferences,
} from '@signalsafe/simulator-react/apps/settings/regionalFormats';
import { SimulatorLocaleProvider } from '@signalsafe/simulator-react/i18n/SimulatorLocale';
import { SimulatorRegionalPresentationProvider } from '@signalsafe/simulator-react/contract/regionalPresentation';
import {
    appearanceStyle,
    defaultAppearance,
    type SimulatorAppearance,
} from '@signalsafe/simulator-theme-bootstrap/appearance';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SimulatorApp } from '@signalsafe/simulator-core/simulatorApp';
import { SimulatorHomeScreenId } from '@signalsafe/simulator-core/devicePayload';
import { SimulatorDispatchActionType } from '@signalsafe/simulator-react/state/simulatorDispatchActions';
import PhoneCallView, {
    PhoneCallPhase,
} from '@signalsafe/simulator-react/views/phone/PhoneCallView';
import { SimulatorDeviceApps } from '@signalsafe/simulator-device/apps/SimulatorDeviceApps';
import { SimulatorCallBoundary } from '@signalsafe/simulator-device/runtime/SimulatorCallBoundary';
import SimulatorPhoneDevice from '@signalsafe/simulator-device/phone/SimulatorPhoneDevice';
import SimulatorPhoneShell from '@signalsafe/simulator-device/phone/SimulatorPhoneShell';
import ContactDetailActions from '@signalsafe/simulator-react/views/contacts/ContactDetailActions';
import { SimulatorPhoneScreenId } from '@signalsafe/simulator-core/devicePayload';
import { DemoContactsContext, demoScreenOverrides } from './demoContactsScreen';
import '@signalsafe/simulator-theme-bootstrap/styles.css';
import { createMemoryStore } from './memoryStore';
import { useDemoSession } from './useDemoSession';
import './page.css';
import wallpaper from './wallpaper-strata.webp';

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
const demoCountries = ['US', 'CA', 'GB', 'MX', 'FR', 'DE', 'IT', 'BR', 'JP', 'CN', 'AE'].map(
    (value) => ({ value, label: regionNames.of(value) ?? value }),
);

const demoAppearance: SimulatorAppearance = { ...defaultAppearance, backgroundImage: wallpaper };

function DemoSession() {
    const [appearance, setAppearance] = useState<SimulatorAppearance>(demoAppearance);
    const [regional, setRegional] = useState<RegionalPreferences>(() => ({
        country: 'US',
        language: 'en',
        currency: 'USD',
        dateFormat: RegionalDateFormat.Locale,
        timeFormat: RegionalTimeFormat.TwelveHour,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }));
    const [, refresh] = useReducer((value: number) => value + 1, 0);
    const store = useMemo(() => createMemoryStore(refresh), []);
    const { state, dispatch, messageCompose, contacts } = useDemoSession(regional);
    const [editingId, setEditingId] = useState<string | null>(null);
    const addingContact =
        state.view.activeApp === SimulatorApp.Phone &&
        state.view.phone.screen === SimulatorPhoneScreenId.AddContact;
    useEffect(() => {
        if (!addingContact) setEditingId(null);
    }, [addingContact]);
    const contactsScreen = useMemo(
        () => ({
            editing: contacts.records.find((item) => item.id === editingId),
            save: contacts.save,
            close: () => {
                setEditingId(null);
                dispatch({ type: SimulatorDispatchActionType.BackToPrimary });
            },
        }),
        [contacts, dispatch, editingId],
    );
    const [calling, setCalling] = useState(false);
    const [connectedAt, setConnectedAt] = useState<number | null>(null);
    const [muted, setMuted] = useState(false);
    const [digits, setDigits] = useState('');
    const [locked, setLocked] = useState(false);
    const lock = store.data?.lock;
    useEffect(() => setLocked(Boolean(lock)), [lock]);
    const navigateHome = (screen: SimulatorHomeScreenId) =>
        dispatch({
            type: SimulatorDispatchActionType.NavLocal,
            app: SimulatorApp.Home,
            screen,
        });
    return (
        <>
            <div className='demo-controls'>
                <button
                    disabled={calling}
                    onClick={() => {
                        setConnectedAt(null);
                        setMuted(false);
                        setDigits('');
                        setCalling(true);
                    }}
                >
                    Simulate call overlay
                </button>
            </div>
            <div className='demo-preview'>
                <div
                    className='simulator-root simulator-host-device'
                    style={appearanceStyle(appearance)}
                >
                    <SimulatorLocaleProvider
                        locale={regionalLocale(regional)}
                        timeZone={regional.timeZone}
                    >
                        <SimulatorRegionalPresentationProvider value={regional}>
                            <SimulatorCallBoundary
                                active={calling}
                                call={
                                    <SimulatorPhoneShell useHostNav>
                                        <PhoneCallView
                                            callerName='Taylor Example'
                                            label='Simulated call'
                                            phase={
                                                connectedAt === null
                                                    ? PhoneCallPhase.Ringing
                                                    : PhoneCallPhase.Connected
                                            }
                                            incoming
                                            connectedAt={connectedAt}
                                            muted={muted}
                                            digits={digits}
                                            onAnswer={() => setConnectedAt(Date.now())}
                                            onMute={() => setMuted((value) => !value)}
                                            onDigit={(digit) => setDigits((value) => value + digit)}
                                            onHangup={() => setCalling(false)}
                                        />
                                    </SimulatorPhoneShell>
                                }
                            >
                                <SimulatorDeviceApps
                                    homeClock={{
                                        locale: regionalLocale(regional),
                                        timeZone: regional.timeZone,
                                        hour12:
                                            regional.timeFormat === RegionalTimeFormat.TwelveHour,
                                    }}
                                    settings={{
                                        appearance: {
                                            value: appearance,
                                            onApply: setAppearance,
                                            onReset: () => setAppearance(demoAppearance),
                                            resetValue: demoAppearance,
                                        },
                                        regional: (
                                            <RegionalSettings
                                                value={regional}
                                                countries={demoCountries}
                                                onSave={setRegional}
                                            />
                                        ),
                                    }}
                                    store={store}
                                    state={state}
                                    dispatch={dispatch}
                                    unlocked={!locked}
                                    onUnlock={() => setLocked(false)}
                                    onLock={() => setLocked(true)}
                                    openSettings={() =>
                                        navigateHome(SimulatorHomeScreenId.Settings)
                                    }
                                >
                                    <DemoContactsContext.Provider value={contactsScreen}>
                                        <SimulatorPhoneDevice
                                            state={state}
                                            dispatch={dispatch}
                                            messageCompose={messageCompose}
                                            screenOverrides={demoScreenOverrides}
                                            contactDetail={{
                                                renderActions: ({ contact, onBack }) => (
                                                    <ContactDetailActions
                                                        onEdit={() => {
                                                            setEditingId(contact.id);
                                                            dispatch({
                                                                type: SimulatorDispatchActionType.NavLocal,
                                                                app: SimulatorApp.Phone,
                                                                screen: SimulatorPhoneScreenId.AddContact,
                                                            });
                                                        }}
                                                        onDelete={() => {
                                                            contacts.remove(contact.id);
                                                            onBack();
                                                        }}
                                                    />
                                                ),
                                            }}
                                        />
                                    </DemoContactsContext.Provider>
                                </SimulatorDeviceApps>
                            </SimulatorCallBoundary>
                        </SimulatorRegionalPresentationProvider>
                    </SimulatorLocaleProvider>
                </div>
            </div>
        </>
    );
}

function Demo() {
    const [session, reset] = useReducer((value: number) => value + 1, 0);
    return (
        <main className='demo-page'>
            <header className='demo-intro'>
                <h1>SignalSafe simulator</h1>
                <p>
                    Explore calls, messages, mail, photos and vault records with fictional data.
                    Changes stay in this tab. Reset or reload to start again.
                </p>
                <div className='demo-controls'>
                    <button onClick={reset}>Reset demo</button>
                    <a href='https://github.com/SignalSafeSoftware/simulator-device/tree/main/docs/examples/local-apps'>
                        View source
                    </a>
                    <a href='https://www.npmjs.com/package/@signalsafe/simulator-device'>
                        Install packages
                    </a>
                </div>
                <output>
                    {session > 0
                        ? 'Demo reset. Default data restored.'
                        : 'No account or setup required.'}
                </output>
            </header>
            <DemoSession key={session} />
        </main>
    );
}

const root = document.getElementById('root');
if (!root) throw new Error('Demo root missing.');
createRoot(root).render(<Demo />);
