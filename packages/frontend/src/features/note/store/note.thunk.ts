import {
  type DwError,
  dwErr,
  dwErrAsync,
  isDescendant,
  Note,
  NoteKind,
  type NotePartial,
  type NoteProperty,
  type ParentId,
  PropertyUpdater,
  Rank,
  rebalanceLayer,
  stableSortByOrderKeyFn,
} from "@darkwrite/common";
import { errAsync, okAsync, type ResultAsync } from "neverthrow";
import { DarkwriteAPIClient } from "@/api/api-client";
import { ensureNoteContent } from "@/features/editor/store/editor.thunk";
import { recordStructuralAction } from "@/features/history/structural-history";
import {
  navigateOutOfNote,
  navigateOutOfNotes,
  navigateToNote,
} from "@/features/navigation/navigator";
import type { AppDispatch, AppGetState } from "@/features/store/types";
import { getCurrentWorkspaceId } from "@/features/workspaces/store/workspace.thunk";
import { KeyedDebouncedUpdater } from "@/lib/debounced-updater";
import {
  selectAllNotesAsMap,
  selectFavorites,
  selectNoteById,
  selectNoteIdsInTrash,
  selectNotesByParentId,
} from "./note-selectors";
import { notesSlice, removeNote, removeNotes, upsertNotes } from "./note-slice";
import { notesUiSlice } from "./notes-ui-slice";

export interface CreateNoteArgs {
  parentId?: ParentId;
  navigateAfter?: boolean;
  renameAfter?: boolean;
  overrides?: Partial<Note>;
}

const act = notesSlice.actions;

/**
 * Eagerly load all note metadata in a given workspace
 * @param workspaceId
 * @returns either the loaded notes or an error
 */
export const fetchNotesInWorkspace =
  (workspaceId: string) => (dispatch: AppDispatch) =>
    DarkwriteAPIClient.note
      .getAllByWorkspaceId(workspaceId)
      .andTee(({ notes }) => dispatch(act.upsertNotes(Object.values(notes))));

/**
 * Load all notes in the currently active workspace.
 * @returns either the loaded notes or an error
 */
export const loadNotesInCurrentWorkspace =
  () => (dispatch: AppDispatch, getState: AppGetState) => {
    const workspaceId = getCurrentWorkspaceId(getState);
    if (!workspaceId) return dwErr("Workspace not ready yet.");
    return dispatch(fetchNotesInWorkspace(workspaceId));
  };

/**
 * Derives the order key for a note appended to the end of its layer. The
 * result sorts strictly after every sibling; input order is not assumed.
 */
export const getCreationRank = (siblings: Note[]) => {
  if (siblings.length === 0) return Rank.default();

  // sort defensively
  const sorted = siblings.toSorted((a, b) =>
    Rank.sorter(a.orderHint, b.orderHint),
  );

  const last = sorted[sorted.length - 1];
  return new Rank(last.orderHint).next();
};

/** Creates a new note with given parent ID.
 * No parent id, or null parent id, creates at the root.
 * @param navigateAfter optionally navigate to the new note once it's successfully created
 * */
export const createNote =
  ({
    parentId = null,
    navigateAfter,
    renameAfter,
    overrides,
  }: CreateNoteArgs) =>
  (dispatch: AppDispatch, getState: AppGetState) => {
    const workspaceId = getCurrentWorkspaceId(getState);
    if (!workspaceId) return dwErrAsync("Workspace not ready yet.");

    const siblings = selectNotesByParentId(getState(), workspaceId, parentId);
    const note: Note = Note.new({
      id: crypto.randomUUID(),
      parentId: parentId,
      workspaceId,
      orderHint: getCreationRank(siblings).get(),
      ...overrides,
    });

    dispatch(act.upsertNotes([note]));

    return DarkwriteAPIClient.note
      .create(note)
      .map(() => note)
      .andTee(() => {
        if (navigateAfter) navigateToNote(note.id);
        if (renameAfter)
          dispatch(
            notesUiSlice.actions.showRenameNoteDialog({ noteId: note.id }),
          );
      })
      .orTee(() => dispatch(act.removeNote(note.id)));
  };

export const duplicateNote =
  (noteId: string) => (dispatch: AppDispatch, getState: AppGetState) => {
    const note = selectNoteById(getState(), noteId);
    if (!note) return dwErrAsync("Note not found.");
    return dispatch(ensureNoteContent(noteId))
      .andThen((doc) =>
        dispatch(
          createNote({
            parentId: note.parentId,
            navigateAfter: false,
            overrides: Note.duplicate(note),
          }),
        ).map((note) => ({
          doc,
          note,
        })),
      )
      .andThen(({ doc, note }) =>
        DarkwriteAPIClient.note
          .setDocument(note.id, JSON.stringify(doc))
          .map(() => note),
      );
  };

export const duplicateNotes =
  (noteIds: readonly string[]) =>
  (dispatch: AppDispatch, getState: AppGetState) => {
    const documentIds = Array.from(new Set(noteIds)).filter((id) => {
      const note = selectNoteById(getState(), id);
      return note?.kind === NoteKind.Document && !note.isTrashed;
    });

    const result = documentIds.reduce<ResultAsync<Note[], DwError>>(
      (result, id) =>
        result.andThen((copies) =>
          dispatch(duplicateNote(id)).map((copy) => [...copies, copy]),
        ),
      okAsync<Note[], DwError>([]),
    );
    const workspaceId = documentIds[0]
      ? selectNoteById(getState(), documentIds[0])?.workspaceId
      : undefined;
    if (!workspaceId) return result;

    let copyIds: string[] = [];
    return result.andTee((copies) => {
      copyIds = copies.map((copy) => copy.id);
      recordStructuralAction(workspaceId, {
        undo: async () => {
          for (const id of copyIds) {
            const deletion = await dispatch(permanentlyDeleteNote(id));
            if (deletion.isErr()) return false;
          }
          return true;
        },
        redo: async () => {
          const duplication = await dispatch(duplicateNotes(documentIds));
          if (duplication.isErr()) return false;
          copyIds = duplication.value.map((copy) => copy.id);
          return true;
        },
      });
    });
  };

/**
 * Recover from a failed note update by reloading the entire workspace.
 * @param error captured from the result chain
 * @param dispatch
 * @returns the original error
 */
const reconcileOnFailedUpdate = (error: DwError, dispatch: AppDispatch) => {
  dispatch(loadNotesInCurrentWorkspace());
  return errAsync(error);
};

/**
 * Patch the given set of notes.
 * @param patches a list of changes to apply
 * @returns the result of the update
 */
export const updateManyNotes =
  (patches: NotePartial[]) => (dispatch: AppDispatch) => {
    dispatch(act.updateMany(patches.map((p) => ({ id: p.id, changes: p }))));
    return DarkwriteAPIClient.note
      .patchAll(patches)
      .orElse((e) => reconcileOnFailedUpdate(e, dispatch));
  };

/**
 * Patch a single note. (delegates to {@link updateManyNotes})
 * @param patch changes to apply
 * @returns the result of the update
 */
export const updateNote = (patch: NotePartial) => updateManyNotes([patch]);

/**
 * Moves a note to the start or end of a tree layer.
 * @param sourceId the note we are moving
 * @param destinationId the new parent id
 * @param placement start or end
 * @returns nothing on success, error on failure
 */
export const moveNote =
  (
    sourceId: string,
    destinationId: ParentId,
    placement: "start" | "end" = "end",
  ) =>
  (dispatch: AppDispatch, getState: AppGetState) => {
    const sourceNote = selectNoteById(getState(), sourceId);
    if (!sourceNote) return dwErrAsync(`Note ${sourceId} does not exist.`);

    // block moving a note into itself or one of its descendants
    if (
      destinationId !== null &&
      isDescendant(destinationId, sourceId, selectAllNotesAsMap(getState()))
    )
      return dwErrAsync("Cannot move a note into its own subtree.");

    const layer = selectNotesByParentId(
      getState(),
      sourceNote.workspaceId,
      destinationId,
    )
      .toSorted(stableSortByOrderKeyFn())
      .filter((n) => n.id !== sourceId);

    const last =
      layer.length > 0
        ? layer[placement === "start" ? 0 : layer.length - 1]
        : null;
    const order = last ? Rank.safe(last.orderHint) : Rank.default();

    return dispatch(
      updateNote({
        id: sourceId,
        parentId: destinationId,
        orderHint:
          placement === "start" ? order.prev().get() : order.next().get(),
      }),
    );
  };

export type RelativePlacement = "above" | "below";

/**
 * Reorders a note in the tree.
 * @param sourceId the note we are moving
 * @param anchorId the note we are moving relative to
 * @param placement side of the anchor note we should place it against
 * @returns nothing on success, error on failure
 */
export const reorderNote =
  (sourceId: string, anchorId: string, placement: RelativePlacement) =>
  (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();

    const sourceNote = selectNoteById(state, sourceId);
    if (!sourceNote) return dwErrAsync("Source note does not exist.");

    const anchorNote = selectNoteById(state, anchorId);
    if (!anchorNote) return dwErrAsync("Neighboring note does not exist.");

    // the source adopts the anchor's parent; block if that parent is the
    // source itself or one of its descendants (would create a cycle)
    if (
      anchorNote.parentId !== null &&
      isDescendant(anchorNote.parentId, sourceId, selectAllNotesAsMap(state))
    )
      return dwErrAsync("Cannot move a note into its own subtree.");

    const siblings = selectNotesByParentId(
      state,
      anchorNote.workspaceId,
      anchorNote.parentId,
    )
      .toSorted(stableSortByOrderKeyFn())
      .filter((n) => n.id !== sourceId);

    const anchorIdx = siblings.findIndex((n) => n.id === anchorId);
    if (anchorIdx === -1) return dwErrAsync("Neighboring note does not exist.");

    const otherNeighborIdx = anchorIdx + (placement === "above" ? -1 : 1);

    const otherNeighbor =
      otherNeighborIdx < 0 || otherNeighborIdx >= siblings.length
        ? null
        : siblings[otherNeighborIdx];

    // no midpoint, equivalent to moving to list bounds. delegate to other handler
    if (!otherNeighbor)
      return dispatch(
        moveNote(
          sourceId,
          anchorNote.parentId,
          placement === "above" ? "start" : "end",
        ),
      );

    // collision/corrupt case
    if (
      otherNeighbor.orderHint === anchorNote.orderHint ||
      !Rank.isValid(otherNeighbor.orderHint) ||
      !Rank.isValid(anchorNote.orderHint)
    ) {
      const rebalanced = rebalanceLayer(siblings);

      // access by position directly, sort is stable
      const anchorOrder = rebalanced[anchorIdx].orderHint;
      const neighborOrder = rebalanced[otherNeighborIdx].orderHint;

      // no need for additional validation
      const result = Rank.midpoint(
        new Rank(anchorOrder),
        new Rank(neighborOrder),
      );
      if (result.collided)
        return dwErrAsync(
          "Layer reconciliation is broken: please report this issue.",
        );

      return dispatch(
        updateManyNotes([
          ...rebalanced,
          {
            id: sourceId,
            parentId: anchorNote.parentId,
            orderHint: result.midpoint.get(),
          },
        ]),
      );
    }

    // no problems beyond this point
    const newOrder = Rank.midpoint(
      new Rank(anchorNote.orderHint),
      new Rank(otherNeighbor.orderHint),
    );

    if (newOrder.collided)
      return dwErrAsync("Note reordering is broken: please report this issue.");

    return dispatch(
      updateNote({
        id: sourceId,
        parentId: anchorNote.parentId,
        orderHint: newOrder.midpoint.get(),
      }),
    );
  };

const addFavoriteToEnd =
  (noteId: string) => (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const note = selectNoteById(state, noteId);
    if (!note) return dwErrAsync("Note does not exist.");

    const favorites = selectFavorites(state, note.workspaceId).filter(
      (n) => n.id !== noteId,
    );

    if (favorites.length === 0)
      return dispatch(
        updateNote({
          id: noteId,
          favoriteOrderHint: Rank.default().get(),
          isFavorite: true,
        }),
      );

    const last = favorites[favorites.length - 1];

    return dispatch(
      updateNote({
        id: noteId,
        isFavorite: true,
        favoriteOrderHint: Rank.safe(last.favoriteOrderHint).next().get(),
      }),
    );
  };

export const reorderFavorite =
  (
    noteId: string,
    anchorNoteId?: string,
    placement: RelativePlacement = "below",
  ) =>
  (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const note = selectNoteById(state, noteId);
    if (!note) return dwErrAsync("Note does not exist.");

    const favorites = selectFavorites(state, note.workspaceId).filter(
      (n) => n.id !== noteId,
    );

    if (!anchorNoteId) return dispatch(addFavoriteToEnd(noteId));

    const anchor = selectNoteById(state, anchorNoteId);
    if (!anchor) return dwErrAsync("Anchor note does not exist.");

    const neighborIdx =
      favorites.findIndex((n) => n.id === anchorNoteId) +
      (placement === "below" ? 1 : -1);

    if (neighborIdx >= favorites.length)
      return dispatch(addFavoriteToEnd(noteId));

    if (neighborIdx < 0) {
      const rank = Rank.safe(anchor.favoriteOrderHint);
      return dispatch(
        updateNote({
          id: noteId,
          isFavorite: true,
          favoriteOrderHint: rank.prev().get(),
        }),
      );
    }

    const neighbor = favorites[neighborIdx];

    // collision case
    if (
      !Rank.isValid(neighbor.favoriteOrderHint) ||
      !Rank.isValid(anchor.favoriteOrderHint) ||
      anchor.favoriteOrderHint === neighbor.favoriteOrderHint
    ) {
      const rebalanced = rebalanceLayer(favorites, "favoriteOrderHint");
      const anchorIdx = favorites.findIndex((n) => n.id === anchorNoteId);
      const rank = Rank.midpoint(
        new Rank(rebalanced[anchorIdx].favoriteOrderHint),
        new Rank(rebalanced[neighborIdx].favoriteOrderHint),
      );

      if (rank.collided)
        return dwErrAsync(
          "Favorites reconciliation is broken: please report this issue.",
        );

      return dispatch(
        updateManyNotes([
          ...rebalanced,
          {
            id: noteId,
            isFavorite: true,
            favoriteOrderHint: rank.midpoint.get(),
          },
        ]),
      );
    }

    const midpoint = Rank.midpoint(
      new Rank(neighbor.favoriteOrderHint),
      new Rank(anchor.favoriteOrderHint),
    );
    if (midpoint.collided)
      return dwErrAsync(
        "Favorite reordering is broken: please report this issue.",
      );

    return dispatch(
      updateNote({
        id: noteId,
        favoriteOrderHint: midpoint.midpoint.get(),
        isFavorite: true,
      }),
    );
  };

export const toggleFavorites =
  (noteIds: readonly string[]) =>
  (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const notes = Array.from(new Set(noteIds))
      .map((id) => selectNoteById(state, id))
      .filter((note): note is Note => note !== undefined && !note.isTrashed);
    if (notes.length === 0) return dwErrAsync("No selected items were found.");

    const before = notes.map((note) => ({
      favoriteOrderHint: note.favoriteOrderHint,
      id: note.id,
      isFavorite: note.isFavorite,
    }));
    const shouldFavorite = notes.some((note) => !note.isFavorite);
    let result: ResultAsync<void, DwError>;
    if (!shouldFavorite) {
      result = dispatch(
        updateManyNotes(
          notes.map((note) => ({ id: note.id, isFavorite: false })),
        ),
      );
    } else {
      const nextRankByWorkspace = new Map<string, Rank>();
      const patches: NotePartial[] = [];
      for (const note of notes) {
        if (note.isFavorite) continue;

        let rank = nextRankByWorkspace.get(note.workspaceId);
        if (!rank) {
          const favorites = selectFavorites(state, note.workspaceId);
          const last = favorites.at(-1);
          rank = last
            ? Rank.safe(last.favoriteOrderHint).next()
            : Rank.default();
        }
        patches.push({
          id: note.id,
          favoriteOrderHint: rank.get(),
          isFavorite: true,
        });
        nextRankByWorkspace.set(note.workspaceId, rank.next());
      }
      result = dispatch(updateManyNotes(patches));
    }

    const after = notes.map((note) => {
      const updated = selectNoteById(getState(), note.id);
      return {
        favoriteOrderHint: updated?.favoriteOrderHint ?? note.favoriteOrderHint,
        id: note.id,
        isFavorite: updated?.isFavorite ?? note.isFavorite,
      };
    });
    return result.andTee(() => {
      for (const workspaceId of new Set(
        notes.map((note) => note.workspaceId),
      )) {
        const workspaceIds = new Set(
          notes
            .filter((note) => note.workspaceId === workspaceId)
            .map((note) => note.id),
        );
        recordStructuralAction(workspaceId, {
          undo: async () =>
            (
              await dispatch(
                updateManyNotes(before.filter((p) => workspaceIds.has(p.id))),
              )
            ).isOk(),
          redo: async () =>
            (
              await dispatch(
                updateManyNotes(after.filter((p) => workspaceIds.has(p.id))),
              )
            ).isOk(),
        });
      }
    });
  };

export const unfavorite = (noteId: string) => (dispatch: AppDispatch) =>
  dispatch(updateNote({ id: noteId, isFavorite: false }));

export const moveManyToTrash =
  (noteIds: readonly string[]) =>
  (dispatch: AppDispatch, getState: AppGetState) => {
    const notes = selectAllNotesAsMap(getState());
    const selectedNotes = Array.from(new Set(noteIds))
      .map((id) => notes[id])
      .filter((note) => note !== undefined);
    if (selectedNotes.length === 0)
      return dwErrAsync("No selected items were found.");

    const ids = Object.values(notes)
      .filter((candidate) =>
        selectedNotes.some(
          (selected) =>
            candidate.id === selected.id ||
            (selected.kind === NoteKind.Folder &&
              isDescendant(candidate.id, selected.id, notes) === true),
        ),
      )
      .map((candidate) => candidate.id);
    const before = ids.map((id) => ({
      id,
      isTrashed: notes[id].isTrashed,
      trashedAt: notes[id].trashedAt,
    }));
    const trashedAt = new Date().toISOString();
    const after = ids.map((id) => ({ id, isTrashed: true, trashedAt }));
    return dispatch(updateManyNotes(after)).andTee(() => {
      for (const workspaceId of new Set(
        selectedNotes.map((n) => n.workspaceId),
      )) {
        const workspaceIds = new Set(
          Object.values(notes)
            .filter((note) => note.workspaceId === workspaceId)
            .map((note) => note.id),
        );
        recordStructuralAction(workspaceId, {
          undo: async () =>
            (
              await dispatch(
                updateManyNotes(before.filter((p) => workspaceIds.has(p.id))),
              )
            ).isOk(),
          redo: async () =>
            (
              await dispatch(
                updateManyNotes(after.filter((p) => workspaceIds.has(p.id))),
              )
            ).isOk(),
        });
      }
    });
  };

export const moveToTrash = (noteId: string) => (dispatch: AppDispatch) =>
  dispatch(moveManyToTrash([noteId]));

export const restoreFromTrash = (noteId: string) => (dispatch: AppDispatch) =>
  dispatch(updateNote({ id: noteId, isTrashed: false, trashedAt: null }));

export const permanentlyDeleteNote =
  (noteId: string) => (dispatch: AppDispatch, getState: AppGetState) => {
    const note = selectNoteById(getState(), noteId);
    dispatch(removeNote(noteId));
    return DarkwriteAPIClient.note
      .delete(noteId)
      .andTee(() => navigateOutOfNote(noteId))
      .orTee(() => note && dispatch(upsertNotes([note])));
  };

export const clearTrash =
  () => (dispatch: AppDispatch, getState: AppGetState) => {
    const workspaceId = getCurrentWorkspaceId(getState);
    if (!workspaceId) return dwErrAsync("Workspace not ready yet.");
    const trashedNoteIds = selectNoteIdsInTrash(getState(), workspaceId);
    navigateOutOfNotes(trashedNoteIds);
    dispatch(removeNotes(trashedNoteIds));
    return DarkwriteAPIClient.note
      .clearTrash(workspaceId)
      .orElse((err) => reconcileOnFailedUpdate(err, dispatch));
  };

const propertyDebouncer = KeyedDebouncedUpdater(
  (dispatch: AppDispatch, noteId: string) =>
    dispatch(persistNoteProperties(noteId)),
);

export const persistNoteProperties =
  (noteId: string) => (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const note = selectNoteById(state, noteId);
    if (!note) return dwErrAsync("Note not found.");
    const { properties, propertyOrder } = note;
    return DarkwriteAPIClient.note
      .patchAll([{ id: noteId, properties, propertyOrder }])
      .orElse((err) => reconcileOnFailedUpdate(err, dispatch))
      .orTee(console.error);
  };

export const setNoteProperty =
  (
    noteId: string,
    propertyName: string,
    property: NoteProperty,
    debounce = false,
  ) =>
  (dispatch: AppDispatch, getState: AppGetState) => {
    const note = selectNoteById(getState(), noteId);
    if (!note) return dwErrAsync("Note not found.");

    const diff = PropertyUpdater.setNoteProperty(note, propertyName, property);
    dispatch(act.updateNote({ id: noteId, changes: diff }));

    if (debounce) {
      propertyDebouncer.for(noteId).update(dispatch, noteId);
      return okAsync();
    }

    return dispatch(persistNoteProperties(noteId));
  };

export const deleteNoteProperty =
  (noteId: string, propertyName: string) =>
  (dispatch: AppDispatch, getState: AppGetState) => {
    const note = selectNoteById(getState(), noteId);
    if (!note) return dwErrAsync("Note not found.");

    return PropertyUpdater.deleteNoteProperty(note, propertyName).asyncAndThen(
      (diff) => {
        dispatch(act.updateNote({ id: noteId, changes: diff }));
        return dispatch(persistNoteProperties(noteId));
      },
    );
  };

export const renameNoteProperty =
  (noteId: string, src: string, dest: string) =>
  (dispatch: AppDispatch, getState: AppGetState) => {
    const note = selectNoteById(getState(), noteId);
    if (!note) return dwErrAsync("Note not found.");
    return PropertyUpdater.renameNoteProperty(note, src, dest).asyncAndThen(
      (diff) => {
        dispatch(act.updateNote({ id: noteId, changes: diff }));
        return dispatch(persistNoteProperties(noteId));
      },
    );
  };

export const reorderNoteProperty =
  (
    noteId: string,
    source: string,
    dest: string,
    placement: "before" | "after",
  ) =>
  (dispatch: AppDispatch, getState: AppGetState) => {
    const note = selectNoteById(getState(), noteId);
    if (!note) return dwErrAsync("Note not found");
    return PropertyUpdater.reorderNoteProperty(
      note,
      source,
      dest,
      placement,
    ).asyncAndThen((diff) => {
      dispatch(act.updateNote({ id: noteId, changes: diff }));
      return dispatch(persistNoteProperties(noteId));
    });
  };
