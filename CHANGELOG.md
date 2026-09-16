# Changelog

## 0.16.2 — 2026-09-16

- Refresh release tooling to Vitest 5, Vite 8, TypeScript 7, jsdom 30 and current Testing Library patches; preserve React 18 compatibility.
- Adopt simulator-react 0.16.2 and simulator-core 0.3.1.
- Compose controlled drafts and action capabilities; support labeled contact values and asynchronous contact edits.
- Add controlled appearance settings with local raster preview and host-owned persistence.
- Ship a rebuilt synthetic gallery covering contact, call, message and email states, built from declared registry dependencies without sibling source aliases.


## 0.5.0 — 2026-09-11

- Adopt simulator-react 0.4 deeply readonly datasource contracts.
- Convert datasource content once per replacement; reconcile navigation without repeated full-payload clones.
- Remove the redundant clone/freeze round trip from tolerant legacy JSON conversion.
- Preserve JSON behavior, datasource refresh navigation and mounted contact drafts.

## 0.4.0 — 2026-09-11

- Add optional datasource composition and refresh behavior while retaining legacy JSON value consumers.
- Depend on simulator-react ^0.3.0; keep React 18 compatibility.
- Include reviewed portable navigation, Settings and contact composition previously adopted through PhoneMe local prereleases.
- Verify equivalent JSON/datasource rendering across calls, contacts, SMS and email, and preservation of contact drafts on refresh.
