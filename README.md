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
| `SIMULATOR_DEVICE_SCREEN_CLASS_NAMES` | Shell screen modifier class strings for host CSS |
| `resolveSimulatorPhoneShellScreenClasses` | Derive `screenClassNames` for `SimulatorPhoneShell` from session view |
| `resolveSimulatorPhoneShellHostMode` | Host overlay mode (e.g. phone contact edit) from session + selected contact id |
| `SimulatorPhoneShellHostMode` | Host overlay mode type |
| `SimulatorPhoneNavModel`, `SimulatorPhoneNavItemModel` | Nav model types |
| `SimulatorPhoneIncomingCallHistory` | Previous-calls table for incoming-call screen |
| `renderPhoneIncomingCallHistoryExtra` | Drop-in `renderIncomingCallExtra` slot for `@signalsafe/simulator-react` |
| `normalizePhoneNumber`, `resolveIncomingCallCaller`, `getRecentCallsForCaller` | Incoming-call history helpers |
| `PhoneIncomingCallHistoryRow`, `PhoneIncomingCallCaller` | History row and caller types |

Types for session state and dispatch actions come from `@signalsafe/simulator-react`.

## Incoming-call previous calls

Use the package slot helper with `SimulatorWithSession` from `@signalsafe/simulator-react` (0.2.4+):

```tsx
import { SimulatorWithSession } from '@signalsafe/simulator-react';
import {
  SimulatorPhoneShell,
  SimulatorPhoneNav,
  renderPhoneIncomingCallHistoryExtra,
} from '@signalsafe/simulator-device';

function DevicePreview({ state, dispatch }: { state: SimulatorSessionState; dispatch: DispatchFn }) {
  return (
    <SimulatorPhoneShell
      nav={<SimulatorPhoneNav state={state} dispatch={dispatch} />}
    >
      <SimulatorWithSession
        state={state}
        dispatch={dispatch}
        renderIncomingCallExtra={renderPhoneIncomingCallHistoryExtra}
      />
    </SimulatorPhoneShell>
  );
}
```

The history table uses the semantic class `simulator-phone__incoming-call-history` from `@signalsafe/simulator-react`. **Host apps style that class in their own CSS** — this package does not ship stylesheets.

When no matching recent calls exist for the active caller, the slot returns `null` (no empty wrappers; `@signalsafe/simulator-react` omits the extra region).

## Development

```bash
yarn install
yarn test
yarn build
```

## License

MIT
