export function notTrashed(note) {
    return !note.isTrashed;
}
export function notTrashedAndIsFavorite(note) {
    return !note.isTrashed && note.isFavorite;
}
export function withParent(parentId) {
    return (note) => note.parentId === parentId;
}
export function byUpdateTime(mode) {
    return (a, b) => mode === "asc"
        ? new Date(a.modifiedAt).valueOf() - new Date(b.modifiedAt).valueOf()
        : new Date(b.modifiedAt).valueOf() - new Date(a.modifiedAt).valueOf();
}
