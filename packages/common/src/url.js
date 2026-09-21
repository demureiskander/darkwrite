export var DarkwriteResource;
(function (DarkwriteResource) {
    DarkwriteResource["Note"] = "note";
    DarkwriteResource["Workspace"] = "workspace";
    DarkwriteResource["Embed"] = "embed";
})(DarkwriteResource || (DarkwriteResource = {}));
export function getResourceRefFromUrl(url) {
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== "darkwrite:")
            return null;
        const objectType = parsedUrl.hostname;
        if (!Object.values(DarkwriteResource).includes(objectType))
            return null;
        const id = parsedUrl.pathname.slice(1);
        if (!id)
            return null;
        return { type: objectType, id };
    }
    catch {
        return null;
    }
}
export function resourceRefToUrl(ref) {
    if (!ref.id)
        throw new Error("Object reference must have an id");
    return `darkwrite://${ref.type}/${ref.id}`;
}
export const getEmbedUrl = (id) => `embed://${id}`;
