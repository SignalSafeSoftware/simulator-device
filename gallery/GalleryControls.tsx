import { SimulatorDispatchActionType } from '@signalsafe/simulator-react/state/simulatorDispatchActions';
import type { SimulatorDispatchAction } from '@signalsafe/simulator-react/state/simulatorDispatchActions';
import type { GalleryState } from './fixtures.js';

interface Control<Value> {
    value: Value;
    onChange: (value: Value) => void;
}
interface GalleryControlsProps {
    editableContacts: Control<boolean>;
    surface: Control<string>;
    mode: Control<GalleryState>;
    theme: Control<string>;
    width: Control<string>;
    scale: Control<string>;
    onVerifyContacts: () => void;
    onDeviceLock: () => void;
    onUnlock: () => void;
    navigate: (
        action: Extract<
            SimulatorDispatchAction,
            { type: typeof SimulatorDispatchActionType.NavLocal }
        >,
    ) => void;
}
const STATES: readonly GalleryState[] = ['populated', 'empty', 'loading', 'disabled', 'error'];

export function GalleryControls({
    editableContacts,
    surface,
    mode,
    theme,
    width,
    scale,
    onVerifyContacts,
    onDeviceLock,
    onUnlock,
    navigate,
}: Readonly<GalleryControlsProps>) {
    return (
        <>
            <div className='gallery-controls'>
                <label>
                    <input
                        type='checkbox'
                        checked={editableContacts.value}
                        onChange={(event) => editableContacts.onChange(event.target.checked)}
                    />{' '}
                    Editable contact details
                </label>
                <label>
                    Surface{' '}
                    <select
                        aria-label='Surface'
                        value={surface.value}
                        onChange={(event) => surface.onChange(event.target.value)}
                    >
                        <option>scenario</option>
                        <option>device apps</option>
                    </select>
                </label>
                <label>
                    State{' '}
                    <select
                        aria-label='State'
                        value={mode.value}
                        onChange={(event) => {
                            const next = STATES.find((value) => value === event.target.value);
                            if (next) mode.onChange(next);
                        }}
                    >
                        {STATES.map((value) => (
                            <option key={value}>{value}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Theme{' '}
                    <select
                        aria-label='Theme'
                        value={theme.value}
                        onChange={(event) => theme.onChange(event.target.value)}
                    >
                        <option>default</option>
                        <option>dark</option>
                        <option>night mint</option>
                        <option>high contrast</option>
                    </select>
                </label>
                <label>
                    Width{' '}
                    <select
                        aria-label='Width'
                        value={width.value}
                        onChange={(event) => width.onChange(event.target.value)}
                    >
                        {['320', '375', '430', '520'].map((value) => (
                            <option key={value}>{value}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Text size{' '}
                    <select
                        aria-label='Text size'
                        value={scale.value}
                        onChange={(event) => scale.onChange(event.target.value)}
                    >
                        {['100', '150', '200'].map((value) => (
                            <option key={value}>{value}</option>
                        ))}
                    </select>
                </label>
            </div>
            <div className='gallery-controls' aria-label='Preview screens'>
                <button onClick={onVerifyContacts}>Verify contact overlay</button>
                <button onClick={onDeviceLock}>Device lock screen</button>
                <button onClick={onUnlock}>Unlock preview</button>
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
        </>
    );
}
