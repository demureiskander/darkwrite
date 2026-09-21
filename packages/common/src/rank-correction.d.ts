import { type Note } from "./note";
/**
 * Regenerates order keys for given set of notes. **The set is assumed to live in the same tree layer.**
 * @param notes that live in the same tree layer, sorting not assumed
 * @param key which field to order by. `"orderHint"` or `"favoriteOrderHint"`
 * @returns a set of diffs that can be applied directly to notes, matching the key parameter
 */
export declare function rebalanceLayer(notes: Note[], key?: "orderHint"): Array<{
    id: string;
    orderHint: string;
}>;
export declare function rebalanceLayer(notes: Note[], key: "favoriteOrderHint"): Array<{
    id: string;
    favoriteOrderHint: string;
}>;
