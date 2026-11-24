# Current npm release: @signalsafe/simulator-device 0.22.1

The trusted-publishing migration prepares patch `0.22.1` under immutable
GitHub tag `v0.22.1`. Current release and authentication instructions are in
[RELEASING.md](../RELEASING.md); the migration uses GitHub Actions OIDC rather than
a permanent npm publishing token. Runtime exports and dependency ranges are
unchanged by this patch. Host adoption and Python releases remain independent.

The release workflow is the source of publication evidence. This documentation
follow-up does not reseal or republish an immutable package archive or move a tag.

## Historical release and state record

The previous snapshot below is retained for context; its version and publication
status statements apply to that earlier snapshot.

### Current state

## Published registry release — 0.22.0 (2026-11-15)

The immutable `v0.22.0` [tag workflow](https://github.com/SignalSafeSoftware/simulator-device/actions/runs/43801368251) passed all required verification and provenance publication. The actual npm archive has 149 files, all byte-identical to the reviewed candidate. SHA-256: `f7f0e197e265d484ec93da90d574150bd6d72eb56eacdc3d441da9c593b0f7de`; release commit `3b58decad1e609a83c85d507715383f3111c5cf1`.

Normal registry development and portable example locks use core 0.7.3, React 0.22.0, device 0.22.0, theme 0.13.5 and TreeSpec 0.4.5. The device retains host-owned time, data, actions and persistence. All 277 tests pass with 100% executable-source coverage, strict source/test types, lint/module/format/cycle/duplication checks, gallery builds and packed consumers. The production portable example passes all 16 Chromium cases against these public packages; its existing Pages [deployment workflow](https://github.com/SignalSafeSoftware/simulator-device/actions/runs/43802656902) also passed. The live [device demo](https://signalsafesoftware.github.io/simulator-device/) returns HTTP 200.

The normal-registry gallery additionally passes real 320px viewport/200% text contact-overlay acceptance: all nested controls fit horizontally, the body scrolls to its final content, and the footer remains fixed and reachable. Its explicit accessible gallery labels and contact-overlay action change only the development gallery.

## Historical local review — 2026-11-15

Keep scenario Forward/Dispose unavailable without a host action callback. Their reason remains connected through aria-describedby and visually hidden; full-device mailbox capabilities remain separate. Compose navigation uses the shared fields and one submission path.

Local review artifact: **0.21.5-mail-ui.0**. This is not an npm release or a package.json version bump. The coordinated set is core `0.7.3-mail-ui.0`, React `0.21.3-mail-ui.0`, device `0.21.5-mail-ui.0`, theme `0.13.5-mail-ui.0`; DeliveryPlus records their checksums in its opt-in vendor manifest. Production registry references remain separate.

273 tests passed at the implementation checkpoint; disabled-action accessibility assertions are strengthened in this follow-up.

Coordinated live verification covered administration lesson playback, the full simulator authoring editor, PhoneMe with an isolated synthetic database, and workspace's saved lesson reader. The gallery exercised 144 unique screen/state/width/text combinations. DeliveryPlus additionally passed 48 narrow layout cases after fixing its host wrapper (three sizes, two positions, four widths, editor and reader). No real messages or calls were sent. Existing test lessons were restored or archived.

For detailed receipts and limitations see DeliveryPlus `docs/quality/simulator-ui/verification.md` and the coordinated project summary dated 2026-11-15. Historical release coverage below belongs to the November 11 checkpoint; it is not a fresh coverage claim for these changes. Publication, registry adoption and release-gate reruns remain separate work.

### Documentation and regression follow-up

273 tests, with added assertions that both unavailable mail actions reference their visually hidden accessible reason; source/test strict types and lint pass.

The review archives were not rebuilt for these documentation/test-only changes. Rebuild and rerun publication gates before a release.

## Published checkpoint — 2026-11-11

Published npm version **0.21.4**, released through the fully gated GitHub tag workflow on November 11, 2026.

## Coordinated public references

| Package | Registry version |
| ------- | ---------------- |
| Core    | 0.7.2            |
| React   | 0.21.2           |
| Device  | 0.21.4           |
| Theme   | 0.13.4           |

Package manifests and examples select these public registry versions. The private editor example keeps only the editor itself as a checked archive. Historical candidate reports remain in the release/verification documents; they describe prior states, not current dependency requirements.

## Verification

273 executable-source tests pass with 100% statements, branches, functions and lines. Strict types, lint, formatting, build and packed-consumer checks pass where applicable. Theme additionally passes real Chromium layout checks. The device example passes 16 browser tests and the private editor example passes 4.

Device 0.21.3 was blocked by a stale local Yarn lock resolution; its tag was retained. Device 0.21.4 was verified from a fresh checkout and empty cache, and its release guard rejects file/link lock resolutions. Theme 0.13.4 preserves the existing scrollbar patch without reverting newer shared layout fixes.

## Links

- [Repository](https://github.com/SignalSafeSoftware/simulator-device)
- [Editor example](https://signalsafesoftware.github.io/simulator-editor-react/)
- [Device example](https://signalsafesoftware.github.io/simulator-device/)
- [Related packages](links.md)
