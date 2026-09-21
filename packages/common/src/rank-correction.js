import { stableSortByOrderKeyFn } from "./note";
import { Rank } from "./rank";
export function rebalanceLayer(notes, key = "orderHint") {
    let current = Rank.default();
    return notes.toSorted(stableSortByOrderKeyFn(key)).map((n) => {
        const entry = { id: n.id, [key]: current.get() };
        current = current.next();
        return entry;
    });
}
