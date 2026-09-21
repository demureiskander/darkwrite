import z from "zod";
export const WorkspaceSyncModeSchema = z.enum(["cloud", "offline"]);
export const WorkspaceConfigSchema = z.object({
    syncMode: WorkspaceSyncModeSchema,
    defaultCodeLanguage: z.string(),
});
export const getDefaultWorkspaceConfiguration = () => ({
    syncMode: "offline",
    defaultCodeLanguage: "plaintext",
});
