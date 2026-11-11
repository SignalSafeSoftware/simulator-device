# simulator-device current-state summary

Prepared source version: **0.21.3** (2026-11-10). This is not a claim of npm publication.

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
