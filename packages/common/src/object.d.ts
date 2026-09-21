import type { Predicate } from "./ts-util";
/**
 * Retrieves the value of a given nested key in an object.
 * @param obj
 * @param keys key names sorted from the top to bottom
 * @returns the value of the key. Value may be a reference and is not copied.
 */
export declare function find(obj: object, keys: string[]): unknown;
/**
 * Recursively traverses an object to get every possible key path.
 * @param obj
 * @param predicate function to filter values.
 * @returns A 2-dimensional array containing key paths.
 */
export declare function recursiveKeys(obj: object, predicate?: Predicate): string[][];
export type AnyObject = {
    [key: string]: any;
};
export declare function deepAssign<DestType extends object, ValueType>(dest: DestType, keyPath: string[], value: ValueType): DestType;
