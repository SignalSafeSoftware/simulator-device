# @signalsafe/simulator-device

Reusable full phone/device simulator UI for hosts building on
[`@signalsafe/simulator-react`](https://www.npmjs.com/package/@signalsafe/simulator-react) and
[`@signalsafe/simulator-core`](https://www.npmjs.com/package/@signalsafe/simulator-core).

This package provides the complete reusable device UI composition:

- **`SimulatorDevice`** — JSON-driven entry point (`value={simulatorJson}`)
- **`SimulatorPhoneDevice`** — shell + bottom nav + runtime + default incoming-call history (state/dispatch API)
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

### JSON-driven rendering (recommended)

Pass stored simulator JSON directly — the same full-device shape used in database/API
`simulator_json` (`entry_point`, `device`, `contacts`, `phone`, `email`, `messages`, `internet`, `home`).

```tsx
import { SimulatorDevice } from '@signalsafe/simulator-device';
import type { SimulatorDevicePayload } from '@signalsafe/simulator-device';

function Preview({ simulatorJson }: { simulatorJson: SimulatorDevicePayload }) {
  return <SimulatorDevice value={simulatorJson} />;
}
```

**DeliveryPlus-style flow:**

1. Load `simulator_json` from the database/API.
2. Render `<SimulatorDevice value={json} />`.
3. Wire `onChange` to persist contact edits back to the database (see editable contact detail below).

Future desktop simulator support can use the same entry point with a discriminated JSON shape;
unsupported values render `renderUnsupported` or a safe built-in fallback.

### Editable contact detail (package-owned form)

Use `phone.contactDetail` for the generic package form. The host owns persistence via
`onChange` and optional `onSave` / `onDelete` callbacks — the package does not call APIs or databases.

When `onChange` is provided, contact save/delete updates `value.contacts` immutably and calls
`onChange(nextValue)` **before** host `onSave` / `onDelete` callbacks. If `onChange` is omitted,
callbacks still fire but no JSON persistence occurs inside the package.

Omit `contactDetail` to keep the built-in `@signalsafe/simulator-react` contact detail view.
Use `renderContactDetail` as a full escape hatch when you need completely custom UI (it takes
precedence over `contactDetail` when both are set).

```tsx
import { SimulatorDevice } from '@signalsafe/simulator-device';
import type { SimulatorDevicePayload } from '@signalsafe/simulator-device';

function Preview({
  simulatorJson,
  setSimulatorJson,
}: {
  simulatorJson: SimulatorDevicePayload;
  setSimulatorJson: (next: SimulatorDevicePayload) => void;
}) {
  return (
    <SimulatorDevice
      value={simulatorJson}
      onChange={setSimulatorJson}
      phone={{
        contactDetail: {
          mode: 'editable',
          onSave: (contact) => console.log('saved', contact),
          onDelete: (contact) => console.log('deleted', contact),
        },
      }}
    />
  );
}
```

### Custom fields via `renderExtraFields`

```tsx
import { SimulatorDevice } from '@signalsafe/simulator-device';
import type {
  SimulatorDevicePayload,
  SimulatorPhoneContactDetailContext,
  SimulatorPhoneContactDetailValues,
} from '@signalsafe/simulator-device';

function ExtraFields({
  contact,
  updateContact,
}: {
  contact: SimulatorPhoneContactDetailValues;
  updateContact: (patch: Partial<SimulatorPhoneContactDetailValues>) => void;
  context: SimulatorPhoneContactDetailContext;
}) {
  return (
    <label>
      Notes
      <input
        value={contact.displayName}
        onChange={(event) => updateContact({ displayName: event.target.value })}
      />
    </label>
  );
}

function Preview({ value, onChange }: { value: SimulatorDevicePayload; onChange: (v: SimulatorDevicePayload) => void }) {
  return (
    <SimulatorDevice
      value={value}
      onChange={onChange}
      phone={{
        contactDetail: {
          mode: 'editable',
          renderExtraFields: (props) => <ExtraFields {...props} />,
        },
      }}
    />
  );
}
```

### Fully custom contact detail (`renderContactDetail`)

```tsx
import { SimulatorDevice } from '@signalsafe/simulator-device';
import type { SimulatorDevicePayload } from '@signalsafe/simulator-device';

function Preview({
  simulatorJson,
  onSave,
}: {
  simulatorJson: SimulatorDevicePayload;
  onSave: (next: SimulatorDevicePayload) => void;
}) {
  return (
    <SimulatorDevice
      value={simulatorJson}
      onChange={onSave}
      phone={{
        renderContactDetail: ({ contact, onBack }) => (
          <div>
            <button type="button" onClick={onBack}>Back</button>
            <h1>{contact.displayName}</h1>
          </div>
        ),
      }}
    />
  );
}
```

### Advanced phone-only state/dispatch usage

When you already manage session state (preview hosts, timeline tooling, deep links), use
`SimulatorPhoneDevice` directly with `getInitialSessionState` and `simulatorSessionReducerWithLogging`
from `@signalsafe/simulator-react`.

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

**Option A — package generic form (`contactDetail`):**

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
      contactDetail={{
        mode: 'editable',
        onSave: (contact) => console.log('save', contact),
        onDelete: (contact) => console.log('delete', contact),
      }}
    />
  );
}
```

**Option B — full escape hatch (`renderContactDetail`):**

Pass `renderContactDetail` to replace the contact detail view with your own UI.
The device shell applies `simulator-phone-shell--screen-phone-contact-detail` while the overlay is active.
When both `renderContactDetail` and `contactDetail` are set, `renderContactDetail` wins.

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
| `SimulatorDevice` | JSON-driven entry point; owns session from `SimulatorDevicePayload` |
| `SimulatorDeviceProps` | Props for JSON-driven device rendering |
| `SimulatorDevicePhoneOptions` | Optional phone overrides passed through to `SimulatorPhoneDevice` |
| `resolveSimulatorDeviceKind` | Classify supported vs future/unsupported JSON shapes |
| `SimulatorPhoneDevice` | Composed phone shell + nav + runtime + optional host contact detail |
| `SimulatorPhoneDeviceProps` | Props for the composed phone device |
| `SimulatorPhoneDeviceContactDetailRenderProps` | `renderContactDetail` callback context |
| `SimulatorPhoneContactDetailForm` | Generic contact detail form (displayName, number, email) |
| `SimulatorPhoneContactDetailFormProps` | Props for the contact detail form |
| `SimulatorPhoneContactDetailValues` | Contact value shape for save/delete callbacks |
| `SimulatorPhoneDeviceContactDetailOptions` | `contactDetail` options for `SimulatorPhoneDevice` / `SimulatorDevice` |
| `SimulatorPhoneContactDetailContext` | Save/delete callback context (`state`, `dispatch`, `originalContact`) |
| `contactSnapshotFromSessionContact` | Map session contact → contact detail values |
| `splitContactDisplayName` | Split display name into first/last parts |
| `patchContactInDevicePayload` | Immutably update one contact in `SimulatorDevicePayload` |
| `removeContactFromDevicePayload` | Immutably remove one contact from `SimulatorDevicePayload` |
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
