import { err, errAsync, ok, ResultAsync } from "neverthrow";
export const buildDwError = (message, cause) => ({ message, cause });
export const dwErr = (message, cause) => err(buildDwError(message, cause));
export const dwErrAsync = (message, cause) => errAsync(buildDwError(message, cause));
export function errOnUndefined(error) {
    return (predicate) => predicate !== undefined ? ok(predicate) : err(error);
}
export function firstOrErr(error) {
    return (arr) => (arr.at(0) ? ok(arr[0]) : err(error));
}
export function okVoid() {
    return ok();
}
export function serializeResult(result) {
    return result.isOk()
        ? { isOk: true, value: result.value }
        : { isOk: false, error: result.error };
}
export async function serializeResultAsync(resultAsync) {
    return serializeResult(await resultAsync);
}
export function hydrateResult(serialized) {
    return serialized.isOk
        ? ok(serialized.value)
        : err(serialized.error);
}
export function hydrateResultAsync(serialized) {
    const r = ResultAsync.fromPromise((async () => {
        const result = await serialized;
        if (result.isOk)
            return result.value;
        else
            throw result.error;
    })(), (e) => e);
    return r;
}
export function validateSchema(schema) {
    return (data) => {
        const result = schema.safeParse(data);
        if (result.success)
            return ok(result.data);
        else
            return dwErr("Schema validation failed.", result.error.issues.map((issue) => issue.message).join("\n"));
    };
}
/** Use for irrecoverable programming errors. (eg. service got an undefined db instance) */
export function panic(message) {
    throw new Error(`PANIC: ${message}`);
}
