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

export {
    SIMULATOR_DEVICE_SCREEN_CLASS_NAMES,
    resolveSimulatorPhoneShellHostMode,
    resolveSimulatorPhoneShellScreenClasses,
} from './simulatorPhoneShellScreenMapper.js';
export type { SimulatorPhoneShellHostMode } from './simulatorPhoneShellScreenMapper.js';

export {
    normalizePhoneNumber,
    resolveIncomingCallCaller,
    getRecentCallsForCaller,
} from './incomingCall/phoneIncomingCallHistoryHelpers.js';
export type {
    PhoneIncomingCallCaller,
    PhoneIncomingCallHistoryRow,
} from './incomingCall/phoneIncomingCallHistoryHelpers.js';

export {
    SimulatorPhoneIncomingCallHistory,
} from './incomingCall/SimulatorPhoneIncomingCallHistory.js';
export type { SimulatorPhoneIncomingCallHistoryProps } from './incomingCall/SimulatorPhoneIncomingCallHistory.js';

export { renderPhoneIncomingCallHistoryExtra } from './incomingCall/renderPhoneIncomingCallHistoryExtra.js';

export { default as SimulatorPhoneDevice } from './SimulatorPhoneDevice.js';
export type {
    SimulatorPhoneDeviceProps,
    SimulatorPhoneDeviceContactDetailRenderProps,
} from './SimulatorPhoneDevice.js';

export { default as SimulatorPhoneContactDetailForm } from './contact/SimulatorPhoneContactDetailForm.js';
export type {
    SimulatorPhoneContactDetailFormProps,
    SimulatorPhoneContactDetailValues,
    SimulatorPhoneContactDetailContext,
    SimulatorPhoneDeviceContactDetailOptions,
} from './contact/contactDetailTypes.js';
export { contactSnapshotFromSessionContact } from './contact/contactSnapshotFromSessionContact.js';
export { splitContactDisplayName } from './contact/splitContactDisplayName.js';
export {
    patchContactInDevicePayload,
    removeContactFromDevicePayload,
} from './contact/patchContactsInDevicePayload.js';

export { default as SimulatorDevice } from './SimulatorDevice.js';
export type {
    SimulatorDeviceProps,
    SimulatorDevicePhoneOptions,
    SimulatorDeviceUnsupportedRenderProps,
} from './SimulatorDevice.js';

export { resolveSimulatorDeviceKind } from './resolveSimulatorDeviceKind.js';
export type { SimulatorDeviceKind } from './resolveSimulatorDeviceKind.js';

export type { SimulatorDevicePayload } from './types/simulatorDevicePayload.js';
