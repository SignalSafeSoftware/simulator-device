import { readFileSync } from 'node:fs';
import { runSmokePackage } from './smoke-package-lib.mjs';
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const subpaths = Object.keys(manifest.exports).filter(p => p !== '.' && p !== './package.json');
runSmokePackage({
 examples: [],
 runtimeChecks: subpaths.map(subpath => ({subpath, exports: {"./SimulatorPhoneShell":["default"],"./SimulatorPhoneNav":["default"],"./simulatorPhoneNavMapper":["resolveSimulatorPhoneNav","dispatchSimulatorPhoneNavItem","shouldHideHostPhoneNav","SIMULATOR_PRIMARY_NAV_ITEMS"],"./simulatorDeviceClasses":["SIMULATOR_DEVICE_CLASS_NAMES"],"./simulatorPhoneShellScreenMapper":["SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES","resolveSimulatorPhoneShellHostMode","resolveSimulatorPhoneShellScreenClasses"],"./incomingCall/SimulatorPhoneIncomingCallHistory":["SimulatorPhoneIncomingCallHistory"],"./incomingCall/renderPhoneIncomingCallHistoryExtra":["renderPhoneIncomingCallHistoryExtra"],"./SimulatorPhoneDevice":["default"],"./SimulatorDevice":["default"],"./SimulatorDeviceApps":["SimulatorDeviceApps"],"./SimulatorDeviceAppsProvider":["SimulatorDeviceAppsProvider"],"./SimulatorCallBoundary":["SimulatorCallBoundary"],"./contact/SimulatorPhoneContactDetailForm":["default"],"./contact/contactSnapshotFromSessionContact":["contactSnapshotFromSessionContact"],"./contact/splitContactDisplayName":["splitContactDisplayName"],"./contact/patchContactsInDevicePayload":["patchContactInDevicePayload","removeContactFromDevicePayload"],"./resolveSimulatorDeviceKind":["resolveSimulatorDeviceKind"],"./incomingCall/phoneIncomingCallHistoryHelpers":["normalizePhoneNumber","resolveIncomingCallCaller","getRecentCallsForCaller"]}[subpath] ?? []})),
 typecheckSubpaths: subpaths,
});
