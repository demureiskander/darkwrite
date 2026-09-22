# Changelog

All notable user-facing changes to this fork are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
The project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The upstream Darkwrite release history remains available in `../CHANGES.md`.

## [Unreleased]

### Fixed

- Restore all document context-menu actions when they are selected with a
  mouse click, while retaining keyboard activation and preventing duplicate
  execution.
- Keep workspace details and its action buttons on separate responsive rows in
  Settings, preventing the Edit workspace button from overlapping metadata at
  wide window sizes or with localized text.
- Make the "Check for updates on launch" preference work. When enabled,
  Darkwrite checks this fork's public GitHub releases after startup and shows
  a non-blocking notification linking to the newer release.
- Keep the application available if macOS font discovery fails during startup.
  Installed font families are now queried from a small isolated Node process,
  while the font controls safely fall back to their system defaults on error.
- Stop opening detached DevTools automatically when the fork runs in
  development mode, and stabilize shared Redux selectors to avoid avoidable
  recomputation and state-heavy development warnings during ordinary actions.
  Verified interactively on 2026-09-21.
- Open Rename from folder and document context menus after the menu finishes
  closing, and keep the dialog open if saving fails.
- Restrict canvas-width resize handles to Cmd+Option on macOS and Ctrl+Alt on
  Windows/Linux, so Ctrl+Option no longer reveals them on Mac.

### Added

- Publish macOS, Windows, and Linux installers automatically from GitHub when
  a version tag is pushed. Add a Homebrew cask template and `brew install`
  quick-start documentation for macOS.
- Bundle Inter for the app interface, Manrope for writing, and JetBrains Mono
  for code blocks. They are the new defaults on every supported desktop
  platform and remain available alongside installed system fonts.
- Let `Space` and `Tab` apply the highlighted command in the editor's `/`
  palette, alongside Enter. Add a multi-paragraph Callout block with a
  theme-aware styled surface and localized slash command in all supported
  languages.
- Apply common Markdown while typing: `**bold**`, `*italic*`, and `# ` through
  `#### ` become formatted text or headings immediately.
- Keep Tab inside the text editor, while letting it apply the selected—or first
  available—`/` command; code-block indentation remains unchanged. Verified
  interactively on 2026-09-21.
- Let the current folder or document title be renamed directly from the
  title bar; the folder browser heading is editable the same way. Enter saves,
  Escape cancels, and leaving the field saves a changed name.
- Add Russian to Language and translate the renderer, editor, onboarding,
  date picker, Electron menu, and backup/restore dialogs. Replace several
  hard-coded English labels with catalog translations.
- Show a theme-colored edge gradient and direction arrow as a two-finger
  Back/Forward swipe progresses; fade it after the gesture ends.
- Add Trash multi-selection: right-click enters checkbox mode, Shift selects
  the visible range, and selected items can be restored or permanently deleted
  together. Selected folders include their trashed descendants, and bulk
  permanent deletion requires confirmation.
- Add two-finger horizontal trackpad history navigation over the central
  workspace: swipe right for Back and left for Forward, once per gesture.
- Add persistent application zoom from 50% to 200% in 10% steps.
- Add application menu actions and `CmdOrCtrl++`, `CmdOrCtrl+-`, and
  `CmdOrCtrl+0` shortcuts to increase, decrease, and reset zoom.
- Add a durable project-memory index and a problem/solution journal.
- Add nested folders for organizing documents, including creation, renaming,
  moving, recursive trashing, double-click navigation, and breadcrumbs.
- Add shared grid and list views for folders and documents; the selected view
  persists between launches.
- Add a compact pinned-items section for quick access to folders and documents,
  with pin and unpin actions in their context menus and the document toolbar.
- Add drag-and-drop for moving documents and folders into folders, ancestor
  breadcrumbs, or the workspace root, with clear drop highlighting and
  protection against circular folder nesting.
- Add a `CmdOrCtrl+K` quick switcher for folders and documents with fuzzy path
  search, keyboard selection, type indicators, and parent-path context.
- Add persistent folder-content sorting by manual order, natural name order in
  both directions, or modification date in both directions. Manual mode
  supports drag reordering in grid and list views.
- Add a right-click menu to the main folder area for creating a document or
  folder in the current location and switching between grid and list views.
- Add transient folder-item selection: one click selects a folder or document,
  double-click opens it, and Enter opens a keyboard-focused item.
- Animate folder and document cards into their new positions after manual
  drag reordering, while respecting reduced-motion preferences.
- Add `Option+1` and `Option+2` shortcuts for switching the shared folder view
  to grid and list without intercepting keystrokes inside text fields.
- Add `CmdOrCtrl+D` for duplicating the selected document, or the open document
  when there is no folder-browser selection.
- Extend `CmdOrCtrl+D` to duplicate every selected document in visual selection
  order while safely ignoring selected folders.
- Add `CmdOrCtrl+P` for pinning or unpinning the selected folder/document, or
  the currently open document when the folder browser is not visible.
- Animate a duplicated document into the folder view with a short fade-and-scale
  reveal while existing cards move smoothly to their new positions.
- Animate folder and document cards between their grid and list positions when
  the shared view changes, including changes made with `Option+1/Option+2`.
- Mark pinned folders and documents with a star on their main-pane cards, with
  a short scale-and-fade transition when `CmdOrCtrl+P` toggles the state.
- Animate newly pinned folders and documents into the sidebar quick-access
  block while existing pinned rows move smoothly to make room.
- Add desktop-style multiple selection in both folder panes: plain click
  selects one object, Cmd/Ctrl-click toggles individual objects, and Shift-click
  selects a contiguous range in the current visual order.
- Add `Backspace`/`Delete` confirmation for moving the current folder-browser
  selection to Trash, including multiple objects and folder descendants.
- Add mouse-drag rectangle selection from empty space in both folder panes;
  `CmdOrCtrl`-drag toggles intersected items against the existing selection.
- Extend `CmdOrCtrl+P` to pin every selected folder and document, or unpin the
  whole selection when every selected object is already pinned.
- Add workspace-scoped `CmdOrCtrl+Z` and `CmdOrCtrl+Shift+Z` history for moving
  objects to Trash, duplicating documents, and pinning or unpinning objects.
- Add persistent folder colors from the folder context menu, with seven
  presets, a default-color reset, and a custom HEX/RGB color picker. Colors
  appear consistently in both folder panes, breadcrumbs, pinned items, and
  quick search, and changes support structural undo and redo.
- Add a Finder-style `Space` quick preview for the selected object. Documents
  open in a safe read-only preview, while folders show their immediate contents;
  pressing `Space` again or Escape closes the preview.
- Add one shared rename action to folder and document context menus. Newly
  created folders and documents now open this rename dialog automatically.
- Add `CmdOrCtrl+Up` navigation to open the containing folder from a document
  or move from the current folder to its parent.
- Add a compact shortcut editor to Appearance for Darkwrite's fixed
  application commands. Shortcuts persist per user, reject conflicts, support
  individual or complete reset, and immediately update native menu actions.
- Add one persistent workspace content width for folder browsing and document
  editing, adjustable in Appearance or by dragging side handles while holding
  Cmd+Option (Ctrl+Alt on Windows/Linux). Per-document Wide page mode remains
  an explicit full-width override.
- Add `CmdOrCtrl+,` to open Settings from anywhere in the app, including the
  editor; the shortcut can be reassigned in Appearance.
- Show the complete clickable folder path in the editor title bar, from Home
  through every parent folder to the current document.

### Changed

- Simplify Fonts to three useful choices—interface, text, and code—and remove
  the separate serif option. macOS now lists installed font families just like
  the other desktop platforms, filtering sans-serif and monospaced choices by
  their intended use. The interface font now has its own full-width row above
  the two text and code choices, with clearer labels and no redundant reset
  buttons: App, Writing, and Code font.
- Remove inherited system-frame, startup-update, RTL toolbar, and linked-file
  click preferences from Settings. The fork no longer checks the upstream
  update feed at launch while it has no independent release channel.
- Simplify Data management to Export and Import data. Import keeps the existing
  archive-replacement behavior and now states that clearly; remove the
  redundant backup button and shorten the export label.
- Keep Workspace-profile actions on their own line until there is enough room,
  preventing them from overlapping the workspace identity in narrow windows.
- Reorganize Workspace and Appearance settings into responsive, semantic
  sections with a clearer workspace summary, compact grouped controls, calmer
  theme selection, font cards, and visually separated data actions. Existing
  settings and their behavior are unchanged.
- Replace the application, installer, onboarding, settings, and website logo
  assets with the transparent-background Darkwrite fork mark across macOS,
  Windows, and Linux.
- Rework About into a compact product card: show a development-build badge
  instead of Electron's version, separate update checking from project links,
  hide update checking for unpackaged builds, and use clearer interactive link
  rows with consistent icons. Remove operating-system and runtime metadata from
  the user-facing screen.
- Add a prominent, theme-colored support button to About that opens the
  project's Tribute page.
- Update About for this independently maintained fork: source-code and license
  links now lead to `demureiskander/darkwrite`, while the original Darkwrite
  project and site remain explicitly credited.
- Redesign the Trash popover with a fixed header and search, a viewport-sized
  scrollable list, clearer item actions, distinct empty states, and a visible
  Clear trash button that keeps its existing confirmation dialog.
- Use the active theme's neutral selection colors for the mouse-drag
  rectangle instead of the separate bright application accent color.
- Add a Workspace switch for opening folders and documents with one click or
  two clicks, consistently across the main pane, sidebar, and pinned items.
  One-click mode keeps modifier and rectangle selection available but no longer
  selects an item with a plain click.
- Unify folder and document location paths in the permanent title bar and
  remove the duplicate breadcrumb from the main folder area. Home and folder
  ancestors remain clickable navigation controls and drag-and-drop targets.
- Creating a document now keeps the current folder view open instead of
  immediately navigating into the new document.
- Creating a folder now inserts an untitled folder directly in the current
  location instead of asking for its name before creation.
- Existing version 2 settings now receive newly introduced defaults without
  losing their saved values.
- Move the fork's working documentation into `memory/`.
- Replace the sidebar note tree and welcome page with a unified folder browser:
  sibling folders appear on the left and active-folder contents on the right.
- Make the sidebar resizable from 120 to 320 pixels, with an adaptive folder
  grid showing one, two, or at most three items per row.
- Limit search and recent notes to documents and move destinations to folders,
  so folders behave as containers rather than editable documents.
- Make main-pane grid cards more compact, with narrower fixed columns, smaller
  padding, and content-sized labels.
- Shorten press-feedback animations so navigation controls feel immediate.
- Give selected cards a persistent visual state distinct from hover and the
  currently open folder.
- Replace separate light and dark color-theme fields with one context-aware
  selector that only lists themes matching the active appearance mode, and
  group HTML export, backup, and restore into one data-management block.
- Remove the system accent-color option so the explicitly selected accent is
  always applied consistently.

### Fixed

- Keep the folder browser and editor inside a narrowed desktop window by
  allowing the main pane to shrink while preserving the sidebar width.
- Prevent a blank Settings screen when an existing profile lacks a newly added
  shortcut: fill missing shortcuts from defaults at render and key handling,
  and synchronize generated common-package artifacts before bundling.
- Restore the complete frontend and desktop test runs on Node 24 by providing
  deterministic in-memory `localStorage` in Vitest and updating a desktop note
  fixture for the persisted `folderColor` field.
- Prevent frontend production builds from blanking the running development
  window by excluding generated `dist` output from Vite's source watcher.
- Prevent a blank development window when folder metadata is briefly empty
  during reload by stopping URL and local-state folder synchronization from
  repeatedly overwriting each other.
- Fix the Electron 44 development launch by using the explicit main-process
  entry point.
- Fix the development window loading an empty desktop shell instead of the
  React renderer.
- Fix incomplete folder drop highlighting in the sidebar by drawing the state
  above the folder card and using a compact drag preview that does not obscure
  the destination.
- Add visible hover and press feedback to notification close buttons.
- Stabilize the move-dialog search arguments to avoid repeated selector work
  and development warnings during unrelated navigation.
- Replace the bright double-outline selection state with a single neutral
  background that aligns correctly in both folder panes.
- Record folder changes as routes so the Back and Forward buttons restore
  folder navigation as well as document navigation.
- Prevent transient horizontal and vertical scrollbars from flashing in the
  sidebar while cards animate between grid and list layouts.
- Show root folders in the main folder area, accept drops onto the main area's
  empty space as moves into the open folder, and suppress false success toasts
  when an object is dropped onto the folder it already belongs to.
- Clear every active folder drop highlight when a drag is dropped, cancelled,
  or loses window focus, even when a nested card handles the final drop.
- Make the folder-color circles respond to pointer clicks when laid out in
  their compact horizontal context-menu row.
