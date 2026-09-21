export declare class Rank {
    private _rank;
    static default(): Rank;
    /**
     * Narrows the type of a rank to a string.
     * @param rank
     */
    static stringify(rank: string | Rank): string;
    /** @deprecated this method can throw on collision */
    static between(a: string | Rank, b: string | Rank): Rank;
    /**
     * Checks if a rank is valid or malformed.
     * @param val candidate string to check
     * @returns true if valid, false if invalid
     */
    static isValid(val: string): boolean;
    static safe(val: string): Rank;
    static midpoint(a: Rank, b: Rank): {
        collided: true;
    } | {
        collided: false;
        midpoint: Rank;
    };
    midpoint(other: Rank): {
        collided: true;
    } | {
        collided: false;
        midpoint: Rank;
    };
    /** @deprecated this method can throw */
    between(other: string | Rank): Rank;
    constructor(_rank: string);
    get(): string;
    next(): Rank;
    prev(): Rank;
    static lt(a: string | Rank, b: string | Rank): boolean;
    static gt(a: string | Rank, b: string | Rank): boolean;
    lt(rank: string | Rank): boolean;
    gt(rank: string | Rank): boolean;
    static eq(a: Rank, b: Rank): boolean;
    static greaterOne(a: string | Rank, b: string | Rank): string | null;
    static lesserOne(a: string | Rank, b: string | Rank): string | null;
    static sorter(a: string | Rank, b: string | Rank): 0 | 1 | -1;
    toString(): string;
}
