import { err, ok } from "neverthrow";
export function parseJson(str) {
    try {
        return ok(JSON.parse(str));
    }
    catch (e) {
        if (!(e instanceof Error))
            return err({ type: "invalid-json-string" });
        return err({ type: "invalid-json-string", message: e.message });
    }
}
