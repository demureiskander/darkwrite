import { generateKeyBetween } from "fractional-indexing";
export class Rank {
    _rank;
    static default() {
        return new Rank(generateKeyBetween(null, null));
    }
    /**
     * Narrows the type of a rank to a string.
     * @param rank
     */
    static stringify(rank) {
        return rank instanceof Rank ? rank.get() : rank;
    }
    /** @deprecated this method can throw on collision */
    static between(a, b) {
        const first = Rank.lesserOne(a, b);
        const second = Rank.greaterOne(a, b);
        if (first == null || second == null)
            throw new Error("`Rank.between()` requires two ranks that are not equal.");
        return new Rank(generateKeyBetween(first, second));
    }
    /**
     * Checks if a rank is valid or malformed.
     * @param val candidate string to check
     * @returns true if valid, false if invalid
     */
    static isValid(val) {
        try {
            generateKeyBetween(null, val);
            return true;
        }
        catch {
            return false;
        }
    }
    static safe(val) {
        if (Rank.isValid(val))
            return new Rank(val);
        else
            return Rank.default();
    }
    static midpoint(a, b) {
        if (Rank.eq(a, b))
            return { collided: true };
        const first = Rank.lesserOne(a, b);
        const second = Rank.greaterOne(a, b);
        return {
            collided: false,
            midpoint: new Rank(generateKeyBetween(first, second)),
        };
    }
    midpoint(other) {
        return Rank.midpoint(this, other);
    }
    /** @deprecated this method can throw */
    between(other) {
        const _other = Rank.stringify(other);
        return Rank.between(this, _other);
    }
    constructor(_rank) {
        this._rank = _rank;
    }
    get() {
        return this._rank;
    }
    next() {
        return new Rank(generateKeyBetween(this._rank, null));
    }
    prev() {
        return new Rank(generateKeyBetween(null, this._rank));
    }
    static lt(a, b) {
        const _a = Rank.stringify(a);
        const _b = Rank.stringify(b);
        return _a < _b;
    }
    static gt(a, b) {
        const _a = Rank.stringify(a);
        const _b = Rank.stringify(b);
        return _a > _b;
    }
    lt(rank) {
        return Rank.lt(this, rank);
    }
    gt(rank) {
        return Rank.gt(this, rank);
    }
    static eq(a, b) {
        return a.get() === b.get();
    }
    static greaterOne(a, b) {
        const _a = Rank.stringify(a);
        const _b = Rank.stringify(b);
        if (_a === _b)
            return null;
        return _a < _b ? _b : _a;
    }
    static lesserOne(a, b) {
        const _a = Rank.stringify(a);
        const _b = Rank.stringify(b);
        if (_a === _b)
            return null;
        return _a < _b ? _a : _b;
    }
    static sorter(a, b) {
        const _a = Rank.stringify(a);
        const _b = Rank.stringify(b);
        return _a < _b ? -1 : _a > _b ? 1 : 0; // https://github.com/rocicorp/fractional-indexing/blob/main/README.md#sorting
    }
    toString() {
        return this._rank;
    }
}
