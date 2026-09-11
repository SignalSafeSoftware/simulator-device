import { useMemo, useRef } from 'react';
import { createSimulatorNavigationDispatch, type SimulatorNavigationOptions, type SimulatorDispatchAction, type SimulatorSessionState } from '@signalsafe/simulator-react';
import SimulatorPhoneNavItem from './SimulatorPhoneNavItem.js';
import { SIMULATOR_DEVICE_CLASS_NAMES as cls } from './simulatorDeviceClasses.js';
import {
    dispatchSimulatorPhoneNavItem,
    resolveSimulatorPhoneNav,
    shouldHideHostPhoneNav,
    type SimulatorPhoneNavModel,
} from './simulatorPhoneNavMapper.js';

export { shouldHideHostPhoneNav };

export interface SimulatorPhoneNavProps {
    state: SimulatorSessionState;
    onNavigation?: SimulatorNavigationOptions['onNavigation'];
    onNavigationEvent?: SimulatorNavigationOptions['onNavigationEvent'];
    dispatch: (action: SimulatorDispatchAction) => void;
}

function isActiveItem(model: SimulatorPhoneNavModel, itemId: string): boolean {
    if (model.mode === 'primary') {
        return model.activeChannel === itemId;
    }
    if (model.mode === 'secondary') {
        return model.activeId === itemId;
    }
    return false;
}

export default function SimulatorPhoneNav({ state, dispatch: rawDispatch, onNavigation, onNavigationEvent }: Readonly<SimulatorPhoneNavProps>) {
    const stateRef = useRef(state);
    stateRef.current = state;
    const dispatch = useMemo(() => onNavigation === undefined && onNavigationEvent === undefined ? rawDispatch : createSimulatorNavigationDispatch({
        getState: () => stateRef.current, dispatch: rawDispatch, onNavigation, onNavigationEvent,
    }), [rawDispatch, onNavigation, onNavigationEvent]);
    const model = useMemo(() => resolveSimulatorPhoneNav(state), [state]);

    if (model.mode === 'hidden') {
        return null;
    }

    const ariaLabel = model.mode === 'primary' ? 'Simulator channels' : 'App secondary menu';

    return (
        <nav
            className={cls.nav}
            aria-label={ariaLabel}
            data-testid="simulator-device-nav"
            data-nav-mode={model.mode}
        >
            <ul className={cls.navList}>
                {model.items.map((item) => (
                    <li key={item.id} className={cls.navItem}>
                        <SimulatorPhoneNavItem
                            label={item.label}
                            icon={item.icon}
                            active={isActiveItem(model, item.id)}
                            ariaLabel={item.label}
                            onClick={() => dispatchSimulatorPhoneNavItem(dispatch, model, item, state)}
                        />
                    </li>
                ))}
            </ul>
        </nav>
    );
}
