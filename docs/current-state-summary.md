# simulator-device current-state summary

Prepared source version: **0.21.3** (updated 2026-11-11). This is not a claim of npm publication.

- Own default mailbox route initialization and email selection callbacks so hosts need no duplicate mailbox composition.
- Load authored starting targets through the shared store, including photos and Vault folders/entries.
- Synchronize appearance settings when authored values change while retaining unapplied local edits on unrelated renders.
- Preserve unified call history, contact routing and scenario Home widgets.
- Retain the merged public email-layout/demo lock fixes.

## Coordinated versions

| Package | Prepared version |
| --- | --- |
| `@signalsafe/simulator-core` | `0.7.2` |
| `@signalsafe/simulator-react` | `0.21.2` |
| `@signalsafe/simulator-device` | `0.21.3` |
| `@signalsafe/simulator-theme-bootstrap` | `0.13.3` |
| `@signalsafe/simulator-editor-react` | `0.1.0` |

The source includes the current GitHub main branch plus the reviewed local simulator work. Existing merged release fixes are preserved. Source manifests and packaged declarations use the coordinated version set. See [release preparation](release-2026-11-10.md) for dependency and verification status.

## Current verification and examples

273 package tests pass; all four executable-source coverage metrics are 100%. See [November 11 verification](verification-2026-11-11.md) for the coordinated 1,465-test result, public examples and remaining registry-release gates.


### CI and demo dependency verification — November 11

Frozen CI installs now use checksum-verified candidate archives through the existing artifact validator. The standalone demo also uses the matching four candidates: its unified `phone.calls` fixture was incompatible with its old registry-pinned core. Browser assertions follow grouped history and related informational rows; browser search covers the real address flow and Back/Forward rather than assuming a search form on the authored welcome page. Shared Home prop declarations reuse the existing contract to remove duplication without changing behavior.

Clean-checkout package validation passes lint, formatting, module boundaries, import cycles, zero duplication, strict source/test types, builds, all 273 tests at 100% statements/branches/functions/lines, and packed runtime/type smoke checks. Release validation still rejects candidate file references until registry publication migration.
