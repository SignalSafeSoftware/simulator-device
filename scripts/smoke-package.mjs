import { readFileSync } from 'node:fs';
import { runSmokePackage } from './smoke-package-lib.mjs';
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const subpaths = Object.keys(manifest.exports).filter((p) => p !== '.' && p !== './package.json');
runSmokePackage({
    examples: [],
    runtimeChecks: subpaths.map((subpath) => ({
        subpath,
        exports:
            {
                './phone/SimulatorPhoneShell': ['default'],
                './phone/SimulatorPhoneNav': ['default'],
                './phone/simulatorPhoneNavMapper': [
                    'resolveSimulatorPhoneNav',
                    'dispatchSimulatorPhoneNavItem',
                    'shouldHideHostPhoneNav',
                    'SIMULATOR_PRIMARY_NAV_ITEMS',
                ],
                './simulatorDeviceClasses': ['SIMULATOR_DEVICE_CLASS_NAMES'],
                './phone/simulatorPhoneShellScreenMapper': [
                    'SIMULATOR_DEVICE_SHELL_SCREEN_CLASS_NAMES',
                    'resolveSimulatorPhoneShellHostMode',
                    'resolveSimulatorPhoneShellScreenClasses',
                ],
                './incomingCall/SimulatorPhoneIncomingCallHistory': [
                    'SimulatorPhoneIncomingCallHistory',
                ],
                './incomingCall/renderPhoneIncomingCallHistoryExtra': [
                    'renderPhoneIncomingCallHistoryExtra',
                ],
                './phone/SimulatorPhoneDevice': ['default'],
                './SimulatorDevice': ['default'],
                './apps/SimulatorDeviceSettings': ['default'],
                './apps/SimulatorDeviceApps': ['SimulatorDeviceApps'],
                './apps/SimulatorDeviceAppsProvider': ['SimulatorDeviceAppsProvider'],
                './runtime/SimulatorCallBoundary': ['SimulatorCallBoundary'],
                './contact/SimulatorPhoneContactDetailForm': ['default'],
                './contact/contactSnapshotFromSessionContact': [
                    'contactSnapshotFromSessionContact',
                ],
                './contact/splitContactDisplayName': ['splitContactDisplayName'],
                './contact/patchContactsInDevicePayload': [
                    'patchContactInDevicePayload',
                    'removeContactFromDevicePayload',
                ],
                './runtime/resolveSimulatorDeviceKind': ['resolveSimulatorDeviceKind'],
                './incomingCall/phoneIncomingCallHistoryHelpers': [
                    'normalizePhoneNumber',
                    'resolveIncomingCallCaller',
                    'getRecentCallsForCaller',
                ],
            }[subpath] ?? [],
    })),
    typecheckSubpaths: subpaths,
});
