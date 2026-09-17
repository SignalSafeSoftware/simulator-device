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

### Runtime passthrough (preview/run without manual session)

`SimulatorDevice` owns session state from `value`. Pass runtime props at the top level — they
forward to `SimulatorPhoneDevice` → `SimulatorWithSession`. You do **not** need `state` / `dispatch`.

| Prop | Purpose |
| --- | --- |
| `onSimulatorEvent` | Structured interaction events (clicks, screen views, etc.) |
| `developerTools` | Developer/QA panel configuration |
| `developerToolsTimelineEntries` | Timeline entries for the developer panel |
| `developerToolsRuntimeIssues` | Runtime lint/warning issues for the developer panel |
| `initialContactsSearch` | Seed contacts search from deep-link query params |
| `exitLink`, `exitTo`, `exitLabel` | Exit chrome |
| `compact` | Embedded preview layout |
| `renderChoice`, `renderFeedback`, `renderContactsOverlay` | Custom render slots |

Phone shell options (`phone.className`, `phone.contactDetail`, etc.) remain under `phone`.

```tsx
import { SimulatorDevice } from '@signalsafe/simulator-device';
import type { SimulatorDevicePayload } from '@signalsafe/simulator-device';

function RunPreview({ simulatorJson }: { simulatorJson: SimulatorDevicePayload }) {
  return (
    <SimulatorDevice
      value={simulatorJson}
      onSimulatorEvent={(event) => console.log(event)}
      developerTools={{ enabled: true, sections: { timeline: true } }}
      exitTo="/courses"
      exitLabel="Exit"
      initialContactsSearch="helpdesk"
      phone={{ contactDetail: { mode: 'editable' } }}
    />
  );
}
```

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
| `SimulatorDeviceRuntimePassthroughProps` | Runtime props forwarded to `SimulatorWithSession` (events, dev tools, deep-link search) |
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

## Navigation interception

`SimulatorDevice`, `SimulatorPhoneDevice`, and standalone `SimulatorPhoneNav`
accept the additive synchronous `onNavigation` callback and observational
`onNavigationEvent`. Return `'handled'` to leave the package state/back stack
untouched and display a host-owned destination; return `'delegate'` or nothing
for package navigation. Composed devices apply the boundary once across their
menu and nested session. Existing `onSimulatorEvent` remains analytics only.
Secondary Contacts Back now returns to the primary menu consistently with
simulator-react, without artificial history/contacts screen hops.

The full contract and release sequence are in simulator-react's
`docs/navigation-contract.md`. Release simulator-react first and raise this
package's dependency minimum to that new version before releasing device.
This release requires simulator-react 0.16.3 and simulator-core 0.3.2. No host-specific Settings implementation is included.

### Host screen content

`SimulatorPhoneDevice` inherits `screenOverrides` from `SimulatorWithSession`.
For example, `{ home: { settings: HostSettings } }` replaces Settings content
inside the existing shell and navigation, without intercepting action variants.
Stable component types receive typed session/location, intercepted dispatch,
Back and lazy default rendering. See sibling simulator-react
[`docs/screen-overrides.md`](https://github.com/SignalSafeSoftware/simulator-react/blob/main/docs/screen-overrides.md) for
fallback, lifecycle, accessibility and ordered release/adoption requirements.
Existing contact-detail slots retain their precedence; host integration remains application-owned.

## Datasource entry point (0.4)

```tsx
import { createSimulatorDatasource } from '@signalsafe/simulator-react';
import { SimulatorDevice } from '@signalsafe/simulator-device';
const datasource = createSimulatorDatasource(jsonSource);
<SimulatorDevice datasource={datasource} />;
// Existing consumers remain valid:
<SimulatorDevice value={jsonSource} />;
```

Supply exactly one source. Both properties are a type error and throw at runtime. Datasource replacement preserves navigation and mounted drafts, reconciling removed email selections. Replacing legacy `value` retains its session-reset behavior. `SimulatorPhoneDevice` also accepts an optional datasource alongside its existing controlled state/onAction contract; the host remains responsible for session actions and resets. JSON-only consumers require no transport or callbacks. See the React package's datasource contract for source validation, full-device conventions, readonly snapshots and API ownership.

### Datasource conversion ownership (0.5)

`SimulatorDevice` and `SimulatorPhoneDevice` memoize the mutable session copy by datasource identity. Keep that identity stable while navigating and replace it when content changes. Controlled hosts that already compose `state.payload` should pass `state` without an additional datasource overlay. JSON-only consumers retain their existing normalization and replacement/reset behavior. Datasource snapshots now use simulator-react 0.4 deeply readonly types; edit a mutable session copy or create a replacement snapshot.

### Labeled contact values

Session contacts accept `phoneNumbers` and `emailAddresses` arrays of
`{ label, value, number? }`. `value` is display/original text; `number` is an
optional canonical dialing value supplied by the host. Empty labels display as
“Unlabeled”. Existing `number` and `email` fields remain supported when arrays
are absent. Editable contact details support adding, editing, and removing rows;
changing a phone value clears its canonical number until the host normalizes it.
`contactDetail.renderPhoneAction(phone, contact)` supplies an optional action for
each phone row. The simulator does not place external calls itself.
Full-device payloads use `phone_numbers` and `email_addresses`; adapters preserve
these arrays when saving and reopening a contact.

### Appearance settings

`SimulatorAppearanceSettings` provides a controlled appearance editor with presets,
background/accent pickers, and an isolated preview. Hosts supply `value`, `presets`,
`onApply`, and `onReset`, and own persistence and token mapping. Draft changes do
not apply until the user presses Apply. Color inputs use opaque six-digit hex
values; `appearanceTextColor` chooses a contrasting black/white foreground.

Appearance also accepts optional `backgroundImage` (a raster image data URL).
The image picker reads local PNG/JPEG/WebP files up to 2 MiB, previews them,
and supports removal. The host persists the image alongside colors and maps it
to `--simulator-background-image`; the theme centers and covers the screen.

## Controlled workflows and availability

`SimulatorPhoneDevice` accepts `emailCompose`, `messageCompose`, `dialDraft`, and
`capabilities`. Drafts remain host-owned when supplied. Email and new-message
callbacks may return a promise: rejection preserves the draft, successful acceptance
clears it, and duplicate submission is blocked while pending. These callbacks do
not configure an external provider.

`capabilities` uses `SimulatorActionCapabilities` from simulator-react. Each action
is either `{ state: 'enabled' }` or `{ state: 'unsupported' | 'unavailable', reason }`.
Reasons are visible in the screen/navigation. Contact save/delete callbacks also
support promises and preserve the draft on rejection. Closing contact details
restores keyboard focus to the originating row when it is still present.

## Synthetic UI gallery

Run `npm run preview:gallery`, then open `http://127.0.0.1:5176`.
`npm run build:gallery` produces a static gallery; `tsc -p tsconfig.gallery.json`
checks its fixtures. The gallery uses the installed shared React package and theme, without
PhoneMe APIs or external providers. It covers populated, empty, loading, unavailable,
and error states; light/dark/high-contrast tokens; 320–520 pixel widths; and 100–200%
text size. Screen controls cover contacts, contact editing, history, dialing,
messages, and email compose. Error-mode email submission deliberately rejects.
These fixtures supplement real host, browser, device and live-provider acceptance.

The npm archive includes `gallery-dist/`, a self-contained static build that can be served without sibling repositories. Gallery development commands above run from this source repository.

## Release records

See [CHANGELOG.md](CHANGELOG.md) and [RELEASING.md](RELEASING.md). Current runtime dependencies are simulator-core 0.3.2 and simulator-react 0.16.3, with React 18 peers. The gallery and release smoke tests use declared registry dependencies; no sibling source checkout is required.

Development tooling requires Node 22.22.2+ or Node 24.15+ (jsdom 30); CI selects current Node 22/24. The published runtime retains its Node >=19.0.0 contract and React 18 peers. TypeScript 7, Vite 8 and Vitest 5 are build/test tools, not runtime dependencies.

## Node runtime compatibility

The runtime requirement is Node >=19.0.0. Build, unit-test and coverage tools use
Node 22/24 (use Node 24.16+ locally). A separate CI job installs packed artifacts
with strict engine checks and tests runtime behavior on Node 19.0.0 and 19–24.

The compatibility job builds this package and installs its declared dependencies
from npm with strict engine checks. Release core 0.3.2 first, then React 0.16.3,
then device 0.16.3; regenerate each downstream lockfile after its upstream release
is available. No sibling source overrides are used in the runtime matrix.

### Dependency revisions and coverage

This release requires simulator-core `0.3.2` and simulator-react `0.16.3`.
The runtime matrix installs these registry releases through the packed device
manifest, including their TreeSpec dependency.

Run `yarn test:coverage` to check the unit suite. CI requires 100% statements,
branches, functions, and lines across the existing source coverage scope.
