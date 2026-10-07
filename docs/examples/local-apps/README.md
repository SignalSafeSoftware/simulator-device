# SignalSafe simulator demo

A React 18 demo using the four simulator packages and their shared
default PhoneMe theme. Settings, Vault and Photos launch from the shared Home
screen. Phone, Email, Internet, Messages and Home use the device bottom menu.
Home includes the shared live clock by default. All screens and navigation controls come from the packages.

Fictional records live in memory. Reset demo or reload restores the starting data.
There is no backend, account, credential, IndexedDB or real call/email integration.
Uploaded photos and newly composed mail stay in this tab. Vault uses the package's
plain-text notes editor; Maps are omitted because no map provider is configured.
Email uses the editable in-memory mailbox. Phone uses fictional scenario records,
and the demo host keeps separate in-memory message conversations. The shared
device composition owns app routing. SMS replies and new conversations update
only this session, with recipient matching based on the selected country.

The starting data includes six contacts (with multiple and international numbers; add, edit and delete them with the same contact editor PhoneMe uses),
ten saved calls plus incoming-call/voicemail examples, six conversations with
40 messages, ten emails across Inbox/Drafts/Sent/Trash with a local text attachment,
five gallery photos (in `photos/`) with capture dates and locations, and six vault entries
across three folders. Vault examples include notes, secrets and dummy credentials.
The fixture modules are grouped by app beside `demoData.ts`; `useDemoSession.ts`
projects the selected conversation into the shared UI and delegates navigation
and simulator actions to the package reducer.

## Run locally

Use Node 24:

```sh
npm ci
npm run dev
```

`npm run build` checks strict types (including tests) and writes a static site to
`dist/`. `npm run preview` serves that production build locally. Relative asset
URLs support both a GitHub Pages project path and a custom domain root.

## Verify

```sh
npx playwright install chromium
npm run test:browser
```

The tests build the site, start a temporary preview server on port 5191 at
`/simulator-device/`, and exercise package screens, draft preservation during a
simulated call, starter data, reset and narrow widths. No real email or call is sent.

Verification on October 7, 2026: strict types and the production build passed,
and the Chromium suite (`npm run test:browser`) passes. It covers local message
replies and new conversations, recipient matching, reset, all seeded mail
folders, attachments, photo capture details, contact add/edit/delete with the
shared editor, readable incoming-call times, readable vault notes, shared
call/contact screens and 320/430px layouts at 100/200% text. Default-data and
gallery checks observed no external HTTP requests. The build still reports the
existing large-chunk and Lucide `use client` warnings; these do not prevent this
client-only build.

Other browser engines and a complete package gallery/DeliveryPlus/PhoneMe visual
matrix are tracked in DeliveryPlus docs/quality/simulator-ui/home-default.md.

## GitHub Pages

The repository's `Simulator demo` workflow checks the production example on pull
requests touching the demo or workflow. It deploys only on a manual run from `main`.
Package publication and the package CI workflow remain separate.

To publish it, an owner can:

1. Push the demo and workflow to `main`.
2. In the repository's **Settings → Pages**, choose **GitHub Actions** as Source.
3. In **Actions → Simulator demo**, choose **Run workflow** on `main`.
4. Open the URL returned by the deployment job. With the default organization
   domain, the expected address is `https://signalsafesoftware.github.io/simulator-device/`.

The demo depends on the released package versions pinned in `package.json`
(core 0.7.0, react 0.21.0, theme-bootstrap 0.13.0 and device 0.21.0), which the
workflow installs from npm with `npm ci`. After releasing new packages, update
the pins, run `npm install` to regenerate `package-lock.json`, and re-run the
workflow. This setup does not publish packages by itself. The demo starts with the original blue layered-wave wallpaper in `wallpaper-strata.webp` (generated artwork, no third-party image) on the Night palette, plus the shared clock and layout. Reset demo restores it; Settings > Appearance can replace it with a PNG, JPEG or WebP up to 2 MiB.
Never add credentials or real user records to a public demo.

### Settings

The Home Settings tile opens the package-owned Appearance, Region and formats, and Screen password sections. Appearance and regional choices stay in the current demo session and reset on reload or Reset demo. The shared regional form receives a representative country list from this demo; PhoneMe supplies its complete country list. Time-zone/time-format changes update the Home clock; date-format changes apply to device-app timestamps and call history. Call-history numbers use the selected country, and both lists and details use the selected date order, timezone and time format. The starter history includes a fictional 184-second call. Simulated device data (email identity, backup/restore/reset), blocked numbers and contact merging are PhoneMe-only settings sections. There are no Twilio credentials, microphone requests or server imports in the static demo.
