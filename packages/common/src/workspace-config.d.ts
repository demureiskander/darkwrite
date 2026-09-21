import z from "zod";
export declare const WorkspaceSyncModeSchema: z.ZodEnum<{
    cloud: "cloud";
    offline: "offline";
}>;
export type WorkspaceSyncMode = z.infer<typeof WorkspaceSyncModeSchema>;
export declare const WorkspaceConfigSchema: z.ZodObject<{
    syncMode: z.ZodEnum<{
        cloud: "cloud";
        offline: "offline";
    }>;
    defaultCodeLanguage: z.ZodString;
}, z.core.$strip>;
export type WorkspaceConfig = z.infer<typeof WorkspaceConfigSchema>;
export declare const getDefaultWorkspaceConfiguration: () => {
    syncMode: "offline";
    defaultCodeLanguage: string;
};
