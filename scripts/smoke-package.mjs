import { runSmokePackage } from './smoke-package-lib.mjs';

runSmokePackage({
    runtimeChecks: [
        {
            subpath: '.',
            exports: [
                'SimulatorPhoneShell',
                'SimulatorPhoneNav',
                'SimulatorPhoneNavItem',
                'resolveSimulatorPhoneNav',
                'dispatchSimulatorPhoneNavItem',
                'shouldHideHostPhoneNav',
                'SIMULATOR_PRIMARY_NAV_ITEMS',
                'SIMULATOR_DEVICE_CLASS_NAMES',
            ],
        },
    ],
    typecheckSubpaths: ['.'],
});
