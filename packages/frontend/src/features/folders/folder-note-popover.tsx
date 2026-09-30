import type { JSONContent } from "@tiptap/core";
import { PenLine } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { ensureNoteContent } from "@/features/editor/store/editor.thunk";
import { selectEditorContent } from "@/features/editor/store/editor-selectors";
import { editorSlice } from "@/features/editor/store/editor-slice";
import { openFolderNote } from "@/features/note/store/note.thunk";
import { selectAllNotes } from "@/features/note/store/note-selectors";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";

const textFromNode = (node: JSONContent): string => {
  if (node.type === "hardBreak") return "\n";
  if (node.text) return node.text;
  return node.content?.map(textFromNode).join("") ?? "";
};

const textFromDocument = (content: JSONContent | undefined) =>
  content?.content?.map(textFromNode).join("\n") ?? "";

const documentFromText = (text: string): JSONContent => ({
  type: "doc",
  content: text.split("\n").map((line) => ({
    type: "paragraph",
    content: line ? [{ type: "text", text: line }] : [],
  })),
});

export function FolderNotePopover({ folderId }: { folderId: string }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const folderNote = useAppSelector((state) =>
    selectAllNotes(state).find(
      (note) => note.parentId === folderId && note.isFolderNote,
    ),
  );
  const content = useAppSelector((state) =>
    folderNote ? selectEditorContent(state, folderNote.id) : undefined,
  );
  const [text, setText] = useState("");

  useEffect(() => {
    if (open) setText(textFromDocument(content));
  }, [content, open]);

  const handleOpenChange = async (nextOpen: boolean) => {
    if (!nextOpen) {
      setOpen(false);
      return;
    }

    setOpen(true);
    setLoading(true);
    const result = await dispatch(openFolderNote(folderId));
    if (result.isOk()) await dispatch(ensureNoteContent(result.value.id));
    setLoading(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <PenLine size={16} />
          {t("folders.folderNote")}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(24rem,calc(100vw-2rem))] bg-view-2 p-3"
      >
        <label className="mb-2 flex items-center gap-2 text-sm font-medium">
          <PenLine size={16} className="text-muted-foreground" />
          {t("folders.folderNote")}
        </label>
        <textarea
          value={text}
          onChange={(event) => {
            const nextText = event.target.value;
            setText(nextText);
            if (folderNote)
              dispatch(
                editorSlice.actions.updateDocumentContent({
                  noteId: folderNote.id,
                  content: documentFromText(nextText),
                }),
              );
          }}
          placeholder={t("folders.folderNotePlaceholder")}
          disabled={loading || !folderNote}
          autoFocus
          className="min-h-32 w-full resize-y rounded-lg border border-border/60 bg-secondary/25 px-3 py-2 text-sm leading-6 outline-none placeholder:text-muted-foreground focus:border-primary/70 focus:ring-2 focus:ring-primary/20 disabled:cursor-wait disabled:opacity-60"
        />
      </PopoverContent>
    </Popover>
  );
}
