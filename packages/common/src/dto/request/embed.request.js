import { z } from "zod";
const isFile = (val) => {
    return typeof File !== "undefined" && val instanceof File;
};
export const CreateEmbedDTOSchema = z.object({
    workspaceId: z.string(),
    fileType: z.string(),
    file: z.custom(isFile),
});
