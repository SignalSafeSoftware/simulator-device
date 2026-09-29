# Local apps without PhoneMe

This React 18 example imports only the four public simulator packages. Its small
in-memory host adapter demonstrates ownership of data; reload clears the demo.
It has no IndexedDB, API routes, credentials, imported records or real calls.
Vault uses the default plain-text notes editor. Maps are omitted unless a host
supplies a map renderer. Send changes only local records.

After the matching package versions are released, run `npm install`, `npm run build`
and `npm run dev`. Before release, install all four locally packed artifacts
explicitly in an isolated copy of this directory; do not publish file dependencies.

Run `npx playwright install chromium`, then `npm run test:browser` for the synthetic
Vault/mail/photo/password/browser/call-overlay workflow. It starts and stops its
own loopback Vite server on port 5191. No real email or call is sent.
