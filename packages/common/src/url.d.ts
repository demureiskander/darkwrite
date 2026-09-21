export declare enum DarkwriteResource {
    Note = "note",
    Workspace = "workspace",
    Embed = "embed"
}
export type DarkwriteResourceRef = {
    type: DarkwriteResource;
    id: string;
};
export declare function getResourceRefFromUrl(url: string): DarkwriteResourceRef | null;
export declare function resourceRefToUrl(ref: DarkwriteResourceRef): string;
export declare const getEmbedUrl: (id: string) => string;
