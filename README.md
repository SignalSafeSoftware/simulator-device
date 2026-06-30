# @signalsafe/simulator-device

Reusable full-device simulator shell and bottom navigation for hosts building on
[`@signalsafe/simulator-react`](https://www.npmjs.com/package/@signalsafe/simulator-react).

This package provides presentation-only composition:

- `SimulatorPhoneShell` — device frame with optional host-owned bottom nav
- `SimulatorPhoneNav` / `SimulatorPhoneNavItem` — primary channel tabs and phone/email secondary menus
- `resolveSimulatorPhoneNav`, `dispatchSimulatorPhoneNavItem`, `shouldHideHostPhoneNav` — nav model helpers

It does **not** include routing, API calls, template management, DOM enhancers, or CSS. Hosts style the
package-owned BEM classes exported as `SIMULATOR_DEVICE_CLASS_NAMES`.

## Install

```bash
yarn add @signalsafe/simulator-device @signalsafe/simulator-react react react-dom
```

Peer dependencies: `react`, `react-dom`.

## Usage

```tsx
import {
  SimulatorPhoneShell,
  SimulatorPhoneNav,
  shouldHideHostPhoneNav,
  SIMULATOR_DEVICE_CLASS_NAMES,
} from '@signalsafe/simulator-device';
import { SimulatorWithSession, type SimulatorSessionState } from '@signalsafe/simulator-react';

/** Style `.simulator-device-shell`, `.simulator-device-nav`, etc. in your host CSS. */
void SIMULATOR_DEVICE_CLASS_NAMES;

function DevicePreview({ payload }: { payload: SimulatorSessionState['payload'] }) {
  return (
    <SimulatorWithSession payload={payload}>
      {({ state, dispatch, children }) => (
        <SimulatorPhoneShell
          useHostNav={!shouldHideHostPhoneNav(state)}
          nav={shouldHideHostPhoneNav(state) ? null : <SimulatorPhoneNav state={state} dispatch={dispatch} />}
        >
          {children}
        </SimulatorPhoneShell>
      )}
    </SimulatorWithSession>
  );
}
```

## Public API

| Export | Description |
| --- | --- |
| `SimulatorPhoneShell` | Presentational device shell |
| `SimulatorPhoneNav` | Session-driven bottom navigation |
| `SimulatorPhoneNavItem` | Single nav button (for custom layouts) |
| `resolveSimulatorPhoneNav` | Derive primary/secondary/hidden nav model from session state |
| `dispatchSimulatorPhoneNavItem` | Map nav item clicks to simulator dispatch actions |
| `shouldHideHostPhoneNav` | Hide nav on thread/email detail screens |
| `SIMULATOR_PRIMARY_NAV_ITEMS` | Primary tab metadata |
| `SIMULATOR_DEVICE_CLASS_NAMES` | BEM class constants for host styling |
| `SimulatorPhoneNavModel`, `SimulatorPhoneNavItemModel` | Nav model types |

Types for session state and dispatch actions come from `@signalsafe/simulator-react`.

## Development

```bash
yarn install
yarn test
yarn build
```

## License

MIT
