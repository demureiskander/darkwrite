import type { Note } from "./note";
export declare function notTrashed(note: Note): boolean;
export declare function notTrashedAndIsFavorite(note: Note): boolean | null;
export declare function withParent(parentId: string | null | undefined): (note: Note) => boolean;
export declare function byUpdateTime(mode: "asc" | "desc"): (a: Note, b: Note) => number;
