import { z } from "zod";
export declare const CreateWorkspaceDTOSchema: z.ZodObject<{
    name: z.ZodString;
    iconUrl: z.ZodOptional<z.ZodString>;
    config: z.ZodObject<{
        syncMode: z.ZodEnum<{
            cloud: "cloud";
            offline: "offline";
        }>;
        defaultCodeLanguage: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export interface CreateWorkspaceDTO extends z.infer<typeof CreateWorkspaceDTOSchema> {
}
export declare const UpdateWorkspaceDTOSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    iconUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    config: z.ZodOptional<z.ZodObject<{
        syncMode: z.ZodOptional<z.ZodEnum<{
            cloud: "cloud";
            offline: "offline";
        }>>;
        defaultCodeLanguage: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export interface UpdateWorkspaceDTO extends z.infer<typeof UpdateWorkspaceDTOSchema> {
}
