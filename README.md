# @signalsafe/simulator-device

Reusable full phone/device simulator UI for hosts building on
[`@signalsafe/simulator-react`](https://www.npmjs.com/package/@signalsafe/simulator-react) and
[`@signalsafe/simulator-core`](https://www.npmjs.com/package/@signalsafe/simulator-core).

This package provides the complete reusable device UI composition:

- **`SimulatorPhoneDevice`** — shell + bottom nav + runtime + default incoming-call history
- `SimulatorPhoneShell` / `SimulatorPhoneNav` — lower-level primitives for custom layouts
- Nav, screen-class, host-mode, and incoming-call history helpers

It does **not** include routing, API calls, template management, auth, or CSS. Hosts style the
semantic classes from this package and `@signalsafe/simulator-react` in their own stylesheets.

## Install

```bash
yarn add @signalsafe/simulator-device @signalsafe/simulator-react react react-dom
```

Peer dependencies: `react`, `react-dom`.

## Usage

### Basic full phone UI

`SimulatorPhoneDevice` is the default entry point for a complete phone simulator preview or embed.
No CSS framework is included — target semantic classes in your host CSS.

```tsx
import {
  SimulatorPhoneDevice,
  SIMULATOR_DEVICE_CLASS_NAMES,
  SIMULATOR_DEVICE_SCREEN_CLASS_NAMES,
} from '@signalsafe/simulator-device';
import {
  getInitialSessionState,
  type SimulatorDispatchAction,
  type SimulatorSessionState,
} from '@signalsafe/simulator-react';

/** Host CSS targets `.simulator-device-shell`, `.simulator-device-nav`, etc. */
void SIMULATOR_DEVICE_CLASS_NAMES;
void SIMULATOR_DEVICE_SCREEN_CLASS_NAMES;

function PhonePreview({
  state,
  dispatch,
}: {
  state: SimulatorSessionState;
  dispatch: (action: SimulatorDispatchAction) => void;
}) {
  return <SimulatorPhoneDevice state={state} dispatch={dispatch} />;
}

const state = getInitialSessionState(templatePayload);
```

### Custom host-owned contact detail

Pass `renderContactDetail` to replace the package contact detail view with your own UI.
The device shell applies `simulator-phone-shell--screen-phone-contact-detail` while the overlay is active.

```tsx
import { SimulatorPhoneDevice } from '@signalsafe/simulator-device';
import type { SimulatorDispatchAction, SimulatorSessionState } from '@signalsafe/simulator-react';

function PhonePreview({
  state,
  dispatch,
}: {
  state: SimulatorSessionState;
  dispatch: (action: SimulatorDispatchAction) => void;
}) {
  return (
    <SimulatorPhoneDevice
      state={state}
      dispatch={dispatch}
      className="my-simulator-root"
      screenClassNames={['my-simulator-root--embedded']}
      renderContactDetail={({ contact, onBack }) => (
        <div className="my-contact-detail">
          <button type="button" onClick={onBack}>
            Back
          </button>
          <h1>{contact.displayName}</h1>
          <p>{contact.number}</p>
        </div>
      )}
    />
  );
}
```

`onBack` clears the host selection and returns to the simulator runtime.

### Manual shell composition

For lower-level control, compose primitives directly:

```tsx
import {
  SimulatorPhoneShell,
  SimulatorPhoneNav,
  shouldHideHostPhoneNav,
  SIMULATOR_DEVICE_CLASS_NAMES,
} from '@signalsafe/simulator-device';
import { SimulatorWithSession, type SimulatorSessionState } from '@signalsafe/simulator-react';

void SIMULATOR_DEVICE_CLASS_NAMES;

function DevicePreview({ state, dispatch }: { state: SimulatorSessionState; dispatch: DispatchFn }) {
  return (
    <SimulatorPhoneShell
      useHostNav={!shouldHideHostPhoneNav(state)}
      nav={shouldHideHostPhoneNav(state) ? null : <SimulatorPhoneNav state={state} dispatch={dispatch} />}
    >
      <SimulatorWithSession state={state} dispatch={dispatch} />
    </SimulatorPhoneShell>
  );
}
```

## Public API

| Export | Description |
| --- | --- |
| `SimulatorPhoneDevice` | Composed phone shell + nav + runtime + optional host contact detail |
| `SimulatorPhoneDeviceProps` | Props for the composed phone device |
| `SimulatorPhoneDeviceContactDetailRenderProps` | `renderContactDetail` callback context |
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

`SimulatorPhoneDevice` passes `renderPhoneIncomingCallHistoryExtra` to `SimulatorWithSession` by default.
Override with `renderIncomingCallExtra` when needed.

The history table uses the semantic class `simulator-phone__incoming-call-history` from `@signalsafe/simulator-react`.
**Host apps style that class in their own CSS** — this package does not ship stylesheets.

When no matching recent calls exist for the active caller, the slot returns `null` (no empty wrappers).

## Development

```bash
yarn install
yarn typecheck
yarn test
yarn build
yarn smoke:package
```

## License

MIT
