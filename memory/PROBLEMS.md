# Problems and verified solutions

Use sequential IDs (`PRB-001`, `PRB-002`, …). Do not remove unsuccessful
attempts: they prevent the same dead ends from being repeated.

## PRB-001 — Black screen in Electron development mode

**Status:** Resolved on 2026-09-09.

**Symptom:** Vite compiled successfully and Electron opened, but its window was
black. DevTools showed only `<div id="root"></div>` with no application UI.

**Root cause:** The desktop Vite server served
`packages/app-desktop/index.html`, which is only an empty shell and does not load
the React entry point. After switching the development root to
`packages/frontend`, the imported `@` alias was still evaluated relative to
`packages/app-desktop`, so frontend module imports could not be resolved.

**Attempts:**

1. Let `vite-plugin-electron` start Electron with its default `.` argument.
   Electron 44 exited after compilation, so this did not work.
2. Pass `dist-electron/main.js` explicitly to Electron. The window then opened,
   but remained black because the wrong HTML entry was served.
3. Use the frontend directory and frontend plugins for the development server.
   This selected the correct HTML, but the inherited `@` alias still pointed to
   the desktop source directory.
4. Define the frontend alias explicitly from the absolute `frontendRoot`.

**Verified solution:** In `packages/app-desktop/vite.config.ts`, start Electron
with `dist-electron/main.js`; during `vite serve`, use `packages/frontend` as the
root, include its plugins, and resolve `@` to `packages/frontend/src` using an
absolute path.

**Verification:** Desktop TypeScript and formatter checks passed. Electron was
launched and its accessibility tree contained the complete “Welcome to
Darkwrite” onboarding interface instead of an empty root element.

## PRB-002 — Project package-manager shim cannot start

**Status:** Resolved on 2026-09-14.

**Symptom:** Every `pnpm` command exits before running a script with `ENOEXEC`
while trying to switch to the repository-pinned pnpm 12.3.4 binary.

**Root cause:** The pnpm version-manager entry at
`~/Library/pnpm/.tools/pnpm/12.3.4/bin/pnpm` is missing or not executable. This
is a machine tooling problem, not a Darkwrite source-code failure.

**Attempts:** Running the repository scripts through pnpm failed consistently.

**Verified workaround:** Invoke the already installed local binaries directly,
for example `../../node_modules/.bin/tsc`, `vite`, and `vitest`, and run the i18n
build script with Node.

**Verification:** Common, frontend, and desktop type checks passed; all 264
tests passed; common, i18n, frontend, and desktop builds completed.

## PRB-003 — Frontend tests fail before collection on Node localStorage

**Status:** Workaround verified on 2026-09-09.

**Symptom:** Frontend Vitest suites importing the session store fail before
test collection because Node exposes `localStorage` without a backing file.

**Root cause:** The current Node runtime requires `--localstorage-file` for its
built-in localStorage implementation, while the test environment expects a
working storage object during module initialization.

**Attempts:** A normal `vitest run` reproduced the failure. Forwarding
jsdom's `window.localStorage` preserved Node's undefined value and still
failed before test collection. A temporary `--localstorage-file` initially
served as a command-line workaround.

**Verified solution:** Load a Storage-compatible in-memory implementation from
the frontend Vitest setup before test modules import session persistence. This
keeps tests isolated and removes the machine-specific command-line flag.

**Verification:** All 16 frontend test files and 156 tests pass without
`NODE_OPTIONS`. All 9 desktop test files and 65 tests also pass.

## PRB-004 — Sidebar folder drop highlight appears incomplete

**Status:** Resolved on 2026-09-09.

**Symptom:** While dragging one folder onto another in the sidebar, only part
of the destination highlight remained visible.

**Root cause:** The highlight was painted on the destination's outer wrapper,
below the folder button, while Electron's large native drag preview covered
most of the remaining visible border.

**Attempts:** Applying background and ring styles to the wrapper established
the correct drop area but could not keep the state visible above its child or
the oversized native preview.

**Verified solution:** Render a non-interactive highlight overlay above the
entire destination card and replace the native full-card preview with a compact
label preview.

**Verification:** Frontend type checking, the folder drag validation tests, and
the production renderer build passed.

## PRB-005 — Notification close button has no press feedback

**Status:** Resolved on 2026-09-09.

**Symptom:** Clicking the close icon dismissed a notification correctly, but
the icon showed no mouse-down animation.

**Root cause:** The close button only defined a text-color hover state and had
no transition or active state.

**Attempts:** The dismissal handler was verified as functional, isolating the
problem to presentation rather than notification state.

**Verified solution:** Give the close button a fixed circular hit area, subtle
hover background, and a short scale-and-background transition while pressed.

**Verification:** Frontend type checking and the production renderer build
passed.

## PRB-006 — Folder navigation feels delayed in development

**Status:** Mitigated on 2026-09-10; awaiting interactive confirmation.

**Symptom:** Opening a document or navigating back felt slower than the pointer
interaction, and the development console repeatedly printed Redux selector
warnings during navigation.

**Root cause:** Two confirmed contributors were present. The move-dialog hook
created a new search-argument object on every selector invocation, causing
avoidable recomputation during unrelated navigation. The shared press effect
also took 150 ms to settle, exaggerating the perceived lag. Other pre-existing
Redux development warnings remain and must not be mistaken for proof of an
additional production delay.

**Attempts:** Navigation handlers were inspected for timers and asynchronous
delays; none were present. The repeated selector warning was then traced to
`useMoveNoteDialog` from the running Electron log.

**Applied solution:** Memoize the move-search arguments until their actual
values change, and reduce press-feedback transitions to 70 ms.

**Verification:** Frontend type checking, all 124 tests, and the production
renderer build passed. Interactive confirmation remains with the user.

## PRB-007 — Selected folder cards show a bright double outline

**Status:** Resolved on 2026-09-10 after a second correction.

**Symptom:** Selected cards had a bright accent ring plus a contrasting border.
The two outlines looked noisy in the main pane and visibly misaligned in the
compact sidebar grid.

**Root cause:** Selection combined the existing card border with an additional
inset primary-color ring. Theme contrast made the two independent edges appear
as a white-and-orange double outline.

**Attempts:** The screenshots were compared between the main and sidebar card
sizes, confirming that the ring was unnecessary because selection already had
a distinct background state. Removing the custom ring and border was
insufficient: a clean application restart showed that Electron still drew its
native focus outline around the focused button.

**Verified solution:** Remove the custom selection ring and visible border,
disable the native button outline on folder cards, and retain one neutral
`secondary` background at consistent opacity in both panes.

**Verification:** Frontend type checking, all 125 tests, and the production
renderer build passed. Interactive confirmation remains with the user.

## PRB-008 — Back and Forward ignore folder navigation

**Status:** Resolved on 2026-09-10.

**Symptom:** After entering or leaving folders, the title-bar Back and Forward
buttons did not restore the previously viewed folder.

**Root cause:** Folder navigation only changed persisted Zustand state. It did
not create a React Router/browser-history entry, so the history controls had no
folder transition to traverse.

**Attempts:** The title-bar handlers and their enabled-state calculation were
checked first; both already delegated to browser history correctly. Inspection
then showed that every folder control bypassed that history.

**Verified solution:** Represent active folders on the home route as a
`folder` query value, route every user-initiated folder transition through
`navigateToFolder`, and synchronize restored route values back into the folder
state.

**Verification:** Frontend type checking, all 128 tests, and the production
renderer build passed. Interactive confirmation remains with the user.

## PRB-009 — Scrollbars flash during grid-to-list animation

**Status:** Resolved and interactively confirmed on 2026-09-10.

**Symptom:** Switching the folder browser to list view briefly displayed thick
horizontal and vertical scrollbars in the sidebar.

**Root cause:** FLIP transforms move cards from their previous grid coordinates.
During the 180 ms transition, those transformed bounds temporarily enlarge the
sidebar's scrollable overflow area.

**Attempts:** Permanently hiding the sidebar scrollbar was rejected because it
would remove useful scroll feedback when the folder list genuinely overflows.

**Verified solution:** Hide overflow only for the duration of a layout-change
animation, always clip horizontal overflow, then restore normal vertical
scrolling after the cards settle.

**Verification:** Frontend type checking, all 128 tests, and the production
renderer build passed. Interactive confirmation remains with the user.

## PRB-010 — A folder created in the main area only appears in the sidebar

**Status:** Resolved and interactively confirmed on 2026-09-10.

**Symptom:** Creating a folder from the main area's context menu at Home placed
it only in the sidebar. Dragging that folder back onto the main area did not
change its visible location, although a successful-move notification appeared.

**Root cause:** The root main-area query explicitly filtered out folders even
though creation correctly assigned them to the root. The main area's empty
space was not a drop destination, and dropping onto the existing Home target
executed and reported a no-op move from the root back to the root.

**Attempts:** Creation and persistence were checked first; both used the correct
active-folder parent. The mismatch was isolated to root rendering and drop-zone
semantics rather than folder creation itself.

**Verified solution:** Render both folders and documents in the root main area,
make empty space move objects into the currently open folder, and silently
ignore drops whose destination already equals the object's parent.

**Verification:** Covered by drop-location tests; frontend type checking and a
production renderer build passed. Interactive confirmation remains with the
user.

## PRB-011 — Main-area drop highlight remains after dragging

**Status:** Resolved on 2026-09-10; awaiting interactive confirmation.

**Symptom:** After dragging a folder, the blue inset outline could remain over
the entire main area after the drag had already completed.

**Root cause:** The main-area drop zone entered its highlighted state first,
then a nested folder card handled the final drop and stopped propagation. The
outer zone therefore received neither its own `drop` nor a reliable
`dragleave`, leaving its local state active.

**Attempts:** The screenshot and nested drop handlers were compared. Clearing
only in the outer `onDrop` was already present and could not cover a drop
consumed by a child zone.

**Verified solution:** While a drop zone is active, listen in the document
capture phase for every `drop` and `dragend`, and also reset on window blur.
This clears parent and child highlights regardless of which nested zone handles
the operation.

**Verification:** Frontend type checking, the complete test suite, and the
production renderer build passed. Interactive confirmation remains with the
user.

## PRB-012 — Blank window after a hook change during development

**Status:** Resolved on 2026-09-11.

**Symptom:** The Electron window showed only its background and macOS traffic
lights; the entire React interface disappeared.

**Root cause:** Vite hot module replacement applied a new `useEffect` inside
`useFolderDrop` while `FolderDropZone` was already mounted with the previous
hook sequence. React correctly stopped rendering with `Rendered more hooks
than during the previous render`. The source code itself had a stable hook
order on a clean mount.

**Attempts:** The running renderer logs were inspected before changing the
implementation. They identified the exact component and ruled out damaged
workspace data, persistence failures, and a production-build regression.

**Verified solution:** Stop the old project Electron processes and start the
desktop development server cleanly so React mounts the component with the new
hook sequence from the beginning.

**Verification:** After a clean restart, the main Darkwrite interface rendered
with its sidebar and root contents, and the hook-order error did not recur.

## PRB-013 — Folder-color circles animate but ignore clicks

**Status:** Resolved on 2026-09-14; awaiting interactive confirmation.

**Symptom:** Pressing a color circle showed its scale animation, but neither
changed the folder color nor opened the custom-color panel.

**Root cause:** The compact circles were Radix context-menu items nested inside
an additional flex layout container. Pointer press styles still applied, but
Radix's item-selection event was not emitted from that structure.

**Attempts:** Persistence and renderer logs were checked first. No update call
or runtime failure appeared, confirming that the interaction stopped before
the color thunk rather than failing while saving it.

**Verified solution:** Render each Radix item through a native `button` and
handle its native click event directly. Defer opening the custom dialog by one
animation frame so the context menu can close first.

**Verification:** In the running Electron app, a preset changed the folder icon
in both panes, the default option restored it, and the custom option opened the
HEX/RGB dialog. Frontend type checking, the production renderer build, and the
complete frontend test suite pass. Interactive confirmation remains with the
user.

## PRB-014 — Blank window after reloading an active folder

**Status:** Resolved on 2026-09-14.

**Symptom:** The Electron window retained its background and traffic lights,
but the complete Darkwrite interface disappeared after a development reload.

**Root cause:** The renderer mounted before note metadata finished loading.
With a folder ID in both the URL and persisted local state, one effect restored
the URL value while another treated the temporarily missing folder as invalid
and cleared it. Those synchronous updates repeated until React stopped the
tree with `Maximum update depth exceeded`.

**Attempts:** Renderer output was inspected before restarting the app. It ruled
out persistence loss and identified `useFolderLocation` as the update loop.

**Verified solution:** Wait for a route folder to exist in loaded metadata
before adopting it, reject known invalid route objects, and only clear a local
folder when metadata contains that object and proves it invalid.

**Verification:** Frontend type checking and the production renderer build
passed. A clean desktop restart restored the complete interface, and a second
renderer reload kept the active folder visible without repeating the update
loop.

## PRB-015 — Production verification blanks the development window

**Status:** Resolved on 2026-09-14.

**Symptom:** The running Electron development window retained its background
and traffic lights but lost the complete renderer after a successful frontend
production build.

**Root cause:** The desktop Vite server used the frontend package as its root
and watched the generated `dist` directory as though it contained source
files. A production build rewrote `dist/index.html`, triggering duplicate page
reloads and occasionally leaving Electron on an empty document.

**Attempts:** A normal renderer reload could not recover the empty document.
The desktop logs contained no React exception, while the Vite log showed two
reloads caused specifically by `dist/index.html`. A clean dev-process restart
restored the renderer and confirmed that workspace data was intact.

**Verified solution:** Exclude `**/dist/**` from the desktop development
server's file watcher so production verification cannot reload the live
renderer. The generated Electron main-process output remains watched normally.

**Verification:** A clean development restart restored the live renderer. A
subsequent frontend production build completed without emitting a
`dist/index.html` reload, and the Electron diagnostic endpoint still reported
the Darkwrite window on its active folder URL. The desktop type check also
passes after its outdated note fixture was updated with the required
`folderColor` field.

## PRB-016 — Settings migration tests ignore updated TypeScript defaults

**Status:** Resolved on 2026-09-14.

**Symptom:** New migration tests reported that `client.shortcuts` was missing
even though the field and its defaults were present in `settings.ts`.

**Root cause:** The common package keeps generated JavaScript beside its
TypeScript source. In this test path, module resolution selected the older
`src/settings.js`, so the tests executed stale settings defaults.

**Attempts:** Updating only the TypeScript source and rerunning the focused
migration tests reproduced the same missing-shortcuts result.

**Verified solution:** Rebuild the common package and synchronize its generated
JavaScript and declaration artifacts whenever shared settings types or defaults
change.

**Verification:** The focused settings-migration tests pass, including both
default insertion for old settings and preservation of a customized shortcut.
On 2026-09-16 the same stale-source issue recurred when adding the one-click
preference; synchronizing `settings.js` and `settings.d.ts` restored the test.
All 178 common-package tests now pass.

## PRB-017 — Editor hides the document's folder path

**Status:** Resolved on 2026-09-14; placement unified on 2026-09-15.

**Symptom:** Opening a document replaced the folder breadcrumb with only the
document title. The user could not directly return to its containing folder or
another ancestor from the editor. The initial correction then left folder and
document paths in different parts of the interface: folders inside the main
area and documents in the permanent title bar.

**Root cause:** The title-bar control kept the ancestor chain inside a hidden
dropdown and rendered only the current note as its trigger. Its parent action
also used document navigation regardless of whether the parent was a folder.

**Attempts:** The existing title-bar control, parent selector, and folder
browser breadcrumb were compared so the editor could reuse the established
navigation model without introducing a second path state. Keeping both visual
implementations was rejected because identical navigation changed position
when a document opened.

**Verified solution:** Use one shared `LocationPath` in the permanent title bar
for both folder and document views, and remove the duplicate breadcrumb from
the main folder area. Route folder ancestors through `navigateToFolder`, keep
Home and folders as drop targets, and retain document navigation only for
legacy document ancestors.

**Verification:** Frontend type checking passes. Folder and editor layouts both
render the same path component, while no stale breadcrumb component or old
translation key remains in the frontend source.

## PRB-018 — Electron and detached DevTools both become blank

**Status:** Resolved on 2026-09-14.

**Symptom:** After several live reloads and a production verification build,
both the Darkwrite window and its detached DevTools window rendered as blank
surfaces.

**Root cause:** The long-running development Electron process entered a stale
renderer/compositor state after repeated HMR and build cycles. The diagnostic
endpoint still reported the correct document URL, and no React exception was
emitted; the failure was confined to the live development process rather than
workspace data or the document-path component.

**Attempts:** The Vite terminal, Electron process state, local diagnostic
endpoint, application accessibility tree, and detached DevTools surface were
checked before restarting. Both windows were blank while the main process and
development server remained alive.

**Verified solution:** Stop the stale Vite/Electron session and start the
desktop development server cleanly.

**Verification:** The restarted renderer mounted the complete Darkwrite UI,
including sidebar, folder contents, navigation controls, and the existing
workspace data. The updated document-path module loads without a runtime
error.

## PRB-019 — Opening Settings blanks the interface after adding a shortcut

**Status:** Resolved on 2026-09-16.

**Symptom:** An existing profile showed an empty application surface after
opening Settings. The renderer logged `Cannot read properties of undefined
(reading 'split')` in shortcut formatting; key handling also logged the same
error while matching shortcuts.

**Root cause:** The common package build resolved an older generated
`src/settings.js` instead of the updated TypeScript source. Its published
defaults therefore omitted `openSettings`, and the Settings screen assumed
every saved shortcut was present.

**Attempts:** The live Electron diagnostic endpoint confirmed the window and
route were still running. Renderer logs isolated the failure to the missing
shortcut; source, generated JavaScript, and bundled exports were compared.

**Verified solution:** Synchronize generated common-package JavaScript and
declarations, rebuild the common package, and fall back to default shortcuts
both while handling keys and while rendering the shortcut editor. Folder-click
settings also retain their default if an older profile omits the new field.

**Verification:** The common package export now returns the new shortcut and
one-click preference, including after migration of an older settings object.
The full frontend and common test suites, type checks, and renderer build pass.

## PRB-020 — Folder and editor content have different widths

**Status:** Code and build verified on 2026-09-16; awaiting visual confirmation.

**Symptom:** At the same window size, folder contents occupy a wider central
area than the document editor. The editor's title/body and the folder browser
do not share a width control.

**Root cause:** The folder browser used `max-w-5xl` (1024 px), while the editor
used a separate 960 px cap and subtracted another 128 px from its inner text
maximum. The editor also calculated a second, unused width in its view hook.

**Attempts:** The folder wrapper, document header, ProseMirror wrapper, and
viewport-width hook were inspected to distinguish content width from sidebar
width and the per-document Wide page override.

**Applied solution:** Both standard views use `client.canvasWidthPx` through a
centered width container. Appearance exposes the saved value, and Cmd+Option
reveals symmetric drag handles; the editor's extra inner-width subtraction is
removed. A document's explicit Wide page mode still fills the available area.

**Verification:** Settings migration and width-limit tests pass; frontend and
desktop type checks and the renderer production build pass. Visual and pointer
interaction confirmation remains with the user.

## PRB-021 — Wheel-gesture tests lack a browser event environment

**Status:** Resolved on 2026-09-16.

**Symptom:** The new trackpad-gesture tests failed with `WheelEvent is not
defined` even though the feature compiled.

**Root cause:** Frontend Vitest runs in Node by default; native browser wheel
events are not present there.

**Attempts:** Ran the focused gesture test suite in the default environment,
which exposed the missing browser API before any assertion ran.

**Verified solution:** Run only this test file in jsdom using its Vitest
environment directive. All four gesture tests then passed, and frontend type
checking and production build also passed.

## PRB-022 — Drag-selection rectangle clashes with the color theme

**Status:** Code updated on 2026-09-16; awaiting visual confirmation.

**Symptom:** The selection rectangle is bright blue in the folder browser even
when the surrounding theme uses muted colors.

**Root cause:** Its border and fill used `primary`, which ThemeHandler replaces
with the independent user-selected accent color.

**Attempts:** Compared the rectangle classes with the theme variables and
the existing selected-card background in both folder panes.

**Applied solution:** Use theme-controlled `ring` for the border and
`secondary` for the translucent fill. The shared rectangle component updates
the main and sidebar folder panes together.

**Verification:** Frontend tests, type checking, and production build pass;
visual acceptance remains with the user.

## PRB-023 — Trash popover clips a long item list

**Status:** Code updated on 2026-09-16; awaiting visual confirmation.

**Symptom:** When Trash contains many items, its compact popover runs into the
bottom of the window. The search and unlabeled menu icon crowd the first row,
while the destructive Clear trash action is hidden in that menu.

**Root cause:** The popover used a minimum height and a two-row grid without a
dedicated bounded scroll region; its placement near the bottom of the sidebar
left too little room for the list.

**Attempts:** Inspected the popover, virtualized list, item actions, and the
existing Clear trash confirmation flow before changing their layout.

**Applied solution:** Bound the popover height to the viewport, give its item
list the only scrollable grid row, and keep a clear title, search, count, and
confirmed Clear trash action visible. Distinguish an empty Trash from a search
with no matches.

**Verification:** All 167 frontend tests, frontend type checking, i18n build,
and renderer production build pass. Visual acceptance remains with the user.

## PRB-024 — Folder content is clipped in a narrow window

**Status:** Code updated on 2026-09-16; awaiting visual confirmation.

**Symptom:** The folder header and empty-state panel extend beyond the right
edge of the central area when the desktop window is not maximized.

**Root cause:** The root flex layout applied `shrink-0` to every direct child,
including the main pane. Its fixed-width descendants therefore could not
reduce the pane's width as the window narrowed, and overflow was clipped.

**Attempts:** Compared the screenshot's fixed 960 px content width with the
shared width container and traced the parent flex sizing rules. The width
container already had `max-w-full`, so changing its saved width would only
hide the underlying layout constraint.

**Applied solution:** Keep only the sidebar and divider non-shrinking; allow
the main pane and its scroll surface to shrink with `min-w-0`. The existing
shared content-width cap can then fit within the available area.

**Verification:** Frontend tests, type checking, and production build pass;
visual confirmation at a narrow window size remains with the user.

## PRB-025 — Batch Trash actions can leave folder descendants behind

**Status:** Code and tests verified on 2026-09-16; awaiting user acceptance.

**Symptom:** A selected trashed folder may contain child items that are not
individually checked. Acting only on the visible selection would restore an
empty folder or delete its parent while leaving trashed children behind.

**Root cause:** Trash lists notes individually, while folder hierarchy is
stored through `parentId`; the existing single-item operations do not expand
a folder selection to its descendants.

**Attempts:** Inspected the note persistence and trash thunks, including their
failure handling, before choosing a batch order.

**Applied solution:** Expand selected folders to their trashed descendants,
deduplicate targets, and order children before parents for permanent deletion.
Restore the batch with one note patch, and delete sequentially. If a child
deletion fails, keep its selected ancestors so no orphan is created; failed
items remain visible and are reported.

**Verification:** Six focused selection/target tests, the frontend suite,
type checking, and the renderer production build pass. Physical interaction
and dialog flow await user confirmation.

## PRB-026 — App-wide actions respond slowly

**Status:** Resolved and interactively confirmed on 2026-09-21.

**Symptom:** The user reports a noticeable delay in the application's response
to many different actions, not only folder navigation. This may be broader
than the earlier development-mode navigation issue in PRB-006. On 2026-09-17
the user clarified that it affects essentially all scenarios in the fork,
while the original application does not feel delayed.

**Root cause:** Two shared development-mode contributors were confirmed. The
fork automatically opened a detached DevTools window for every development
launch. Meanwhile, shared Redux selectors returned either their input
unchanged or a new reference for identical state, which triggers development
checks and repeated, state-heavy console warnings. Those selectors are used
across themes, workspaces, settings, and sidebar navigation, so the overhead
is not limited to one feature.

**Attempts:** On 2026-09-17, temporarily enabled a local Electron debugging
port and measured five document opens and Back actions without editing user
data. Opening changed the route in 1–11 ms and reached two animation frames in
12–33 ms. Back changed the route in 31–42 ms and reached two frames in 60–133
ms. A 1.55-second CPU profile during opening was mostly idle (1,028 of 1,201
samples); no persistent renderer CPU bottleneck appeared. Development-console
Redux selector warnings were observed, but their relationship to the user
report is unproven. The temporary debugging port was removed afterward. The
fork was tested with the Vite development launcher, which opens detached
DevTools automatically. The original is installed at `/Applications/Darkwrite.app`
as a packaged 1.1.0-beta.1 release, while the fork source reports
1.3.0-beta.1. Desktop and renderer production bundles build successfully with
the local Vite binary; they were not launched because the user asked to keep
the application closed. Comparing a development fork with a packaged,
different-version original does not establish a fork-specific regression.

**Applied solution:** Removed automatic DevTools opening from the development
launcher. Replaced identity selectors for settings with direct selectors,
memoized the theme and workspace arrays from their source maps, and used one
stable empty children map for the closed sidebar tree. The remaining selector
warning was traced to the workspace list; it disappeared after that list was
memoized.

**Verification:** Frontend and desktop type checks and production builds pass.
The user confirmed that the fork is now noticeably faster. Future performance
work should be driven by a newly observed, reproducible regression.

## PRB-027 — Ctrl+Option reveals canvas-width handles on macOS

**Status:** Code and tests verified on 2026-09-16; awaiting user acceptance.

**Symptom:** Holding Ctrl+Option on a Mac revealed the canvas-width handles,
although this platform should use Cmd+Option.

**Root cause:** The keyboard listener accepted either `metaKey` or `ctrlKey`
with `altKey` on every platform.

**Attempts:** Traced the handle-visibility listener and checked existing
platform-specific shortcut conventions.

**Applied solution:** On macOS accept Cmd+Option only; on Windows/Linux accept
Ctrl+Alt only. Reject the other primary modifier in either case.

**Verification:** 177 frontend tests, type checking, and the renderer build
pass. Physical interaction confirmation remains with the user.

## PRB-028 — Language selection leaves some dialogs in English

**Status:** Code and tests verified on 2026-09-16; awaiting user acceptance.

**Symptom:** Creating a workspace, loading an editor image, closing a dialog,
and using native backup dialogs could display English text after a language
change.

**Root cause:** Those labels were hard-coded rather than read from the shared
translation catalog. Russian was also absent from the catalog builder,
renderer language list, main-process resources, and date-picker locales.

**Attempts:** Audited the existing English catalog and the visible literal
labels in renderer and main-process dialogs.

**Applied solution:** Added a Russian catalog covering every existing English
key, registered it across renderer and Electron, selected the Russian date
locale, and moved the affected hard-coded labels into translated keys.

**Verification:** Catalog key and placeholder parity tests, Russian selection
tests, frontend and desktop suites, type checking, and both builds pass.
Visual and language-switching confirmation remain with the user.

## PRB-029 — Rename does not open from a context menu

**Status:** Code and tests verified on 2026-09-17; awaiting user acceptance.

**Symptom:** Selecting Rename from a folder's context menu can appear to do
nothing. The current folder and document title in the title bar also cannot
be renamed by clicking it.

**Likely cause:** The rename dialog was opened synchronously inside the menu's
selection event, while Radix was still dismissing its focus layer; this may
immediately steal focus from the new dialog. The title-bar current item was
rendered as plain text. Physical confirmation is still needed.

**Attempts:** Compared the working custom-color dialog, which already defers
its opening until the context menu closes, and inspected the shared rename
dialog and breadcrumb title rendering.

**Applied solution:** Defer context-menu rename opening to the next animation
frame. Add one inline title editor for the current breadcrumb and folder
heading, with Enter, Escape, blur, and persistence-error feedback. Keep the
shared rename dialog open on a failed save.

**Verification:** 182 frontend tests, type checking, and the renderer build
pass. Physical interaction remains for user confirmation.

## PRB-030 — Font discovery can prevent macOS startup

**Status:** Fixed on 2026-09-21; runtime confirmation pending.

**Symptom:** The development app opened a blank window immediately after the
font picker was changed to show installed font families on macOS.

**Root cause:** Importing and running `font-list` directly in Electron's main
process can fail on macOS. That rejection interrupted the renderer's initial
font-settings request, leaving the application without its initial UI state.

**Attempts:** Verified that the same `font-list` query returns 180 fonts when
Electron is launched in Node mode. Direct main-process use remained unsafe.

**Applied solution:** Run the macOS query in a short-lived Electron Node-mode
child process, validate its JSON response, and return an empty list with a
logged warning if discovery fails. The renderer then keeps the system defaults
instead of blocking startup.

**Verification:** Desktop type checking and production build pass. The running
development application still needs visual confirmation.

## PRB-031 — macOS release build did not fail at the failing step

**Status:** Fix queued for verification.

**Symptom:** The first GitHub release attempt reported a missing artifact
instead of the macOS packaging failure that caused it.

**Root cause:** `tools/darkwrite-builder.js` logged the child
`electron-builder` failure but did not propagate its non-zero exit code.
Additionally, the pinned `macos-14` runner had Xcode 15.4 while the current
electron-builder requires `actool` 26 or later.

**Applied solution:** Use `macos-latest` for release builds and set the parent
process exit code when the platform packager fails.

**Verification:** Pending the rerun of `v1.3.0-beta.1` on GitHub Actions.

## PRB-032 — Release artifacts were not attached to GitHub Release

**Status:** Fix queued for verification.

**Symptom:** The cross-platform jobs completed successfully, but the published
GitHub Release contained no installer assets.

**Root cause:** Downloaded GitHub Actions artifacts retain their nested
directory structure. The release action matched only `release-files/*`, which
does not include the installers inside those directories.

**Applied solution:** Match `release-files/**/*` so every downloaded installer
is attached to the release.

**Verification:** Pending the rerun of `v1.3.0-beta.1` on GitHub Actions.

## PRB-033 — Launch update preference did not start a check

**Status:** Fixed; verification pending.

**Symptom:** The onboarding and Settings toggle for checking updates at launch
was visible and persisted, but opening Darkwrite never requested the release
feed or showed an available-update notification.

**Root cause:** The reusable `checkForUpdate` thunk existed but was never
dispatched during the application's initialization sequence.

**Applied solution:** After the application root is rendered, dispatch the
check only when `client.autoUpdateCheck` is enabled. Treat a failed network
request as non-fatal so it cannot interrupt application startup.

**Verification:** Frontend type checking and production build passed on
2026-09-22. Physical confirmation requires installing the next release.
