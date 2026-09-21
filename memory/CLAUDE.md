# Darkwrite Fork Development Guide

## Required memory workflow

- Read this file before starting work on the project.
- Use the index below to open the memory file relevant to the current task.
- Implement exactly one user-facing feature at a time.
- Do not start another feature until the current feature is implemented,
  tested, documented, and accepted by the user.
- Update `memory/CHANGELOG.md` under `Unreleased` for every user-visible change.
- When a new problem is diagnosed, add a uniquely numbered entry to
  `memory/PROBLEMS.md`. Record the symptom, root cause, attempted solutions,
  final solution, and verification result.
- Add every new Markdown memory file to the index in this file.
- Keep memory factual and concise; update an existing entry instead of creating
  contradictory duplicate guidance.

## Memory index

| ID | File | Purpose |
| --- | --- | --- |
| MEM-001 | [`CLAUDE.md`](./CLAUDE.md) | Durable development rules, project context, and memory index. |
| MEM-002 | [`CHANGELOG.md`](./CHANGELOG.md) | User-visible changes, maintained under `Unreleased`. |
| MEM-003 | [`PROBLEMS.md`](./PROBLEMS.md) | Numbered technical problems, attempted fixes, and verified solutions. |
| MEM-004 | [`IDEAS.md`](./IDEAS.md) | Deferred product ideas and their agreed constraints. |

## Product direction

Darkwrite Fork is a local-first desktop workspace for focused writing and
structured project documents. Preserve its calm interface, offline operation,
data portability, and user control.

## Planned, one feature at a time

- Diagnose the reported app-wide delay after user actions (PRB-026), then
  address the measured bottleneck; do not assume the earlier navigation fix
  covers this broader report.
- When the fork begins publishing releases, configure an independent update
  channel while retaining upstream attribution and license information.

## Settings organization

- In the main flex layout, the sidebar and its divider stay fixed-width while
  the content pane uses `min-w-0` and may shrink within a narrow window.
- Horizontal pixel-scroll gestures over the central content area navigate the
  same route history as the title-bar Back/Forward buttons. Trigger once per
  gesture; leave vertical scrolling, pinch zoom, and sidebar gestures alone.
- Keep one persistent `client.canvasWidthPx` for the main folder browser and
  standard document editor. Appearance and Cmd+Option side handles edit the
  same value; Wide page remains an explicit document-level override.
- Keep settings concise: a single color-theme selector follows the active
  light/dark mode and lists only compatible themes; HTML export, backup, and
  restore share one data-management block.
- The accent color is explicitly selected by the user and must not be silently
  replaced with the operating system accent color.

## Keyboard shortcuts

- Store every user-configurable application shortcut under
  `settings.client.shortcuts` using portable key identifiers such as
  `CmdOrCtrl`, `Alt`, and physical key codes. Fill missing entries from
  `DEFAULT_APP_SHORTCUTS` when loading older settings.
- Appearance exposes only Darkwrite's fixed application commands. Do not add
  editor-native or operating-system commands to the shortcut editor. Reject
  duplicate assignments, support per-command and complete reset, and rebuild
  the Electron application menu after settings change so native accelerators
  remain synchronized with renderer shortcuts.
- `Option+1` selects the shared folder grid and `Option+2` selects the shared
  folder list. Use physical digit codes so macOS keyboard-layout characters do
  not break the shortcuts, and never intercept them in editable controls.
- `CmdOrCtrl+D` duplicates a selected document, falling back to the currently
  open document. Object shortcuts must ignore navigation-only folders and must
  not intercept keystrokes in editable controls.
- With a multi-selection, `CmdOrCtrl+D` duplicates every selected document in
  selection order and ignores folders. Run copies sequentially so each new
  sibling receives a valid order key after the previous optimistic insertion.
- `CmdOrCtrl+P` toggles pinning for all folder-browser selections. A mixed
  selection becomes fully pinned without moving already pinned objects; when
  every selected object is pinned, the whole selection is unpinned. When a
  document is open, it takes precedence over stale folder-browser selection.
- Pinned objects remain visibly marked with an animated star on their main-pane
  cards; pin and unpin feedback must respect reduced-motion preferences.
- Newly pinned objects use the shared insertion/reordering animation when they
  enter the sidebar quick-access block; already pinned rows move rather than
  jump when the list changes.
- Outside editable controls, `Space` opens a read-only quick preview for the
  selection anchor and pressing it again closes the preview. Folder previews
  show immediate children; document previews never execute stored markup.
- Outside editable controls, `CmdOrCtrl+Up` navigates from an open document to
  its containing folder, or from the current folder to its parent. It is a
  no-op when the folder browser is already at the workspace root.
- `CmdOrCtrl+,` opens Settings even when an editor field has focus; it remains
  an application shortcut configurable in Appearance.
- The permanent title bar is the single location-path surface in every view.
  Folder browsing displays `Home → active folder chain`; editing displays
  `Home → parent folders → current document`. Never duplicate this path
  inside the main content area. Home and every parent are direct navigation and
  folder drop targets; folder ancestors must use `navigateToFolder`, never
  `navigateToNote`.

## Selection interactions

- In Trash, right-click enters a dedicated checkbox selection mode. Shift
  selects a range in the currently visible sorted order. Bulk actions include
  trashed descendants of selected folders, ignore unselected items, and ask
  for confirmation before permanent deletion. Exiting Trash clears selection.
- Keep the Trash popover within the viewport. Its header, search, and Clear
  trash action remain visible while only the item list scrolls; clearing all
  items continues to require confirmation.
- Folder and document selection stores an ordered ID set plus a stable anchor.
  Plain click replaces the selection and anchor; CmdOrCtrl-click toggles only
  the clicked object and preserves the first modifier anchor; Shift-click
  redraws the contiguous range from that anchor in current visual order.
- If the anchor is not present in the current pane after navigation, sorting,
  or filtering, Shift-click starts a new one-object selection. Right-clicking
  an already selected object preserves the full selection.
- Outside editable controls, Backspace/Delete opens a confirmation dialog for
  the complete folder-browser selection. Confirmed folder deletion includes
  descendants, deduplicates overlapping selections, and moves items to Trash
  together rather than deleting them permanently.
- Dragging from empty space in either folder pane draws a selection rectangle
  and selects every intersected card. `CmdOrCtrl`-drag toggles those hits
  against the selection captured at drag start. Starting on a card or control
  leaves its normal click and drag-and-drop behavior intact. The rectangle uses
  theme `ring` and `secondary` colors, not the separate user-selected accent.

## Structural undo history

- Application-level `CmdOrCtrl+Z` undo and `CmdOrCtrl+Shift+Z` redo structural
  actions outside editable controls. Current commands cover moving selections
  and folder descendants to Trash, document duplication, and pin changes.
- History is kept independently per workspace, clears the redo branch after a
  new action, suppresses nested recording during replay, and retains at most
  100 commands. Persistence failures leave the command available for retry.
- Editable controls keep their native/editor text undo history; structural
  shortcuts must never intercept those keystrokes.

## Folder colors

- The `Folder color` row in the folder context menu provides macOS-like preset
  circles, a default-color reset, and a visible current selection.
- The final circular `+` control opens a compact color panel supporting direct
  HEX entry, RGB values, and a visual color picker.
- Store colors in the folder's persisted `folderColor` field and render them
  consistently in the sidebar, main pane, breadcrumbs, pinned items, and quick
  switcher. Color changes participate in structural undo and redo.

## Folder navigation decisions

- Folders are navigation-only tree nodes; documents remain editable content.
- The left pane shows the active folder among its siblings. The main pane shows
  the active folder's children, so the same folder is not duplicated in both.
- Folder and document views share one persistent grid/list preference.
- The sidebar is resizable from 120 to 320 pixels. Its folder grid adapts to one,
  two, or at most three folders per row.
- Folder and document cards use one click for selection and double-click for
  navigation by default; Workspace can switch all folder panes and pinned items
  to one-click opening. In that mode, plain clicks clear stale selection before
  opening; modifier clicks and selection rectangles still select objects.
  Enter opens the focused card. Breadcrumbs remain one-click navigation.
- Pinned folders and documents share one ordered quick-access block at the top
  of the sidebar. A pinned folder is omitted from the sibling-folder grid to
  avoid duplicate entries in the same pane.
- Documents and folders are draggable. Folders and breadcrumb ancestors accept
  drops; the Home breadcrumb and Home sidebar item move objects to the root.
  Circular folder moves must always remain blocked.
- `CmdOrCtrl+K` opens the shared quick switcher. It searches both folders and
  documents, displays their parent paths, and synchronizes the active sidebar
  folder when opening a result.
- Folder contents use one persistent sort mode across the main and sidebar
  views: manual order, name ascending/descending, or modification date
  newest/oldest. Manual mode supports before/after drag reordering while the
  center of a folder remains the drop target for nesting.
- Right-clicking the main folder area opens creation actions scoped to the
  active folder plus the shared grid/list view controls. Item-specific context
  menus take precedence when the pointer is over a folder or document card.
- Creating a document adds it to its destination without opening the editor;
  opening remains an explicit double-click or Enter action.
- Folder and document context menus use one shared rename dialog. Interactive
  creation requests that dialog only after persistence succeeds, so a failed
  creation cannot leave a rename prompt pointing at a rolled-back object.
- Folder-card selection is transient and shared between the main and sidebar
  views so object-level keyboard commands can target it without persisting UI
  state between launches.
- Manual reordering animates surviving cards from their previous layout
  positions in both folder panes and respects the operating system's reduced
  motion preference.
- Newly inserted folder-browser cards use a short fade-and-scale reveal; this
  provides visible feedback when duplication creates a document copy.
- Grid/list changes animate existing cards from their previous positions in
  both folder panes and respect reduced-motion preferences.
- Folder navigation is represented by the `folder` query value on the home
  route. All user-initiated folder changes must use `navigateToFolder` so
  browser Back and Forward can restore them; direct state updates are reserved
  for route synchronization and validation.

## Definition of done

A feature is complete only when its acceptance criteria are implemented,
relevant tests and type checks pass, a production build succeeds when
practical, migration and failure paths are considered, and the memory files are
current.

The desktop development server must ignore `packages/frontend/dist`. Running
a frontend production build while Electron is open must not trigger a renderer
reload; `dist-electron` remains watched for intentional main-process rebuilds.

Frontend Vitest uses `src/test/setup.storage.ts` to replace Node 24's
uninitialized experimental `localStorage` with isolated in-memory storage.
Keep this setup active for tests that import session persistence.

When a development-only blank screen appears immediately after adding,
removing, or reordering React hooks, inspect the renderer error first. If React
reports a hook-order mismatch during Vite HMR, perform a clean Electron/dev
server restart before treating it as a persistent application defect.

## Architecture

- `packages/frontend`: React renderer, Redux state, and TipTap editor.
- `packages/app-desktop`: Electron main process, IPC, persistence, and OS APIs.
- `packages/common`: shared types, API contracts, and domain utilities.
- `packages/i18n`: gettext translation sources compiled to i18next JSON.
- `packages/website`: Astro marketing and documentation site.

SQLite stores note metadata. Note documents and embeds are stored as files.
Redux is the runtime source of truth; Electron provides persistence and OS
integration through the typed IPC bridge.

## Project constraints

- Add dependencies only after explicit approval.
- Preserve compatibility with existing Darkwrite user data.
- Use TypeScript without `any` or double casts.
- Prefer factory functions and closures over new classes.
- Use `Result` and `ResultAsync` for recoverable errors.
- Renderer code accesses desktop APIs through `DarkwriteAPIClient`.
- Never enable Electron `nodeIntegration`.
- Treat rich editor content and imported data as untrusted.
- Add translation keys to every `.po` locale and rebuild `@darkwrite/i18n`.
- Database migrations are append-only and require statement breakpoints.

See `../AGENTS.md` and package-level guides for detailed coding conventions.
