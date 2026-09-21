import { z } from "zod";
export declare const CreateEmbedDTOSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    fileType: z.ZodString;
    file: z.ZodCustom<File, File>;
}, z.core.$strip>;
export type CreateEmbedDTO = z.infer<typeof CreateEmbedDTOSchema>;
