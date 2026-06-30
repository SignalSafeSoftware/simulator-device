export { default as SimulatorPhoneShell } from './SimulatorPhoneShell.js';
export type { SimulatorPhoneShellProps } from './SimulatorPhoneShell.js';

export { default as SimulatorPhoneNav } from './SimulatorPhoneNav.js';
export type { SimulatorPhoneNavProps } from './SimulatorPhoneNav.js';

export { default as SimulatorPhoneNavItem } from './SimulatorPhoneNavItem.js';
export type { SimulatorPhoneNavItemProps } from './SimulatorPhoneNavItem.js';

export {
    dispatchSimulatorPhoneNavItem,
    resolveSimulatorPhoneNav,
    shouldHideHostPhoneNav,
    SIMULATOR_PRIMARY_NAV_ITEMS,
} from './simulatorPhoneNavMapper.js';

export type {
    SimulatorPhoneNavItemModel,
    SimulatorPhoneNavModel,
} from './simulatorPhoneNavMapper.js';

export { SIMULATOR_DEVICE_CLASS_NAMES } from './simulatorDeviceClasses.js';
