import { type Result } from "neverthrow";
export type JsonParseError = {
    type: "invalid-json-string";
    message?: string;
};
export declare function parseJson<T>(str: string): Result<T, JsonParseError>;
