import { type Result, ResultAsync } from "neverthrow";
import type z from "zod";
export interface DwError {
    message: string;
    cause?: string;
}
export declare const buildDwError: (message: string, cause?: string) => {
    message: string;
    cause: string | undefined;
};
export declare const dwErr: <T = never>(message: string, cause?: string) => import("neverthrow").Err<T, DwError>;
export declare const dwErrAsync: <T = never>(message: string, cause?: string) => ResultAsync<T, DwError>;
export type DwResult<T> = Result<T, DwError>;
export type DwResultAsync<T> = ResultAsync<T, DwError>;
export declare function errOnUndefined<E>(error: E): <T>(predicate: T | undefined) => import("neverthrow").Ok<T & ({} | null), never> | import("neverthrow").Err<T, E>;
export declare function firstOrErr<E>(error: E): <T>(arr: T[]) => import("neverthrow").Ok<T, never> | import("neverthrow").Err<T, E>;
export declare function okVoid(): import("neverthrow").Ok<void, never>;
export type SerializedResult<T, E> = {
    isOk: true;
    value: T;
} | {
    isOk: false;
    error: E;
};
export declare function serializeResult<T, E>(result: Result<T, E>): SerializedResult<T, E>;
export declare function serializeResultAsync<T, E>(resultAsync: ResultAsync<T, E>): Promise<SerializedResult<T, E>>;
export declare function hydrateResult<T, E>(serialized: SerializedResult<T, E>): Result<T, E>;
export declare function hydrateResultAsync<T, E>(serialized: Promise<SerializedResult<T, E>>): ResultAsync<T, E>;
export type ExtractResultTypes<F extends (...args: any[]) => any> = Awaited<ReturnType<F>> extends Result<infer T, infer E> ? [T, E] : never;
export declare function validateSchema<T extends z.ZodType>(schema: T): (data: unknown) => import("neverthrow").Ok<z.core.output<T>, never> | import("neverthrow").Err<never, DwError>;
/** Use for irrecoverable programming errors. (eg. service got an undefined db instance) */
export declare function panic(message: string): never;
