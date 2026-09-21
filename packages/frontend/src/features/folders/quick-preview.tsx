import { NoteKind } from "@darkwrite/common";
import type { JSONContent } from "@tiptap/core";
import { FileImage, FileText } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { FolderIcon } from "@/components/folder-icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui";
import { useDocumentById } from "@/features/editor/hooks/use-document";
import {
  selectAllNotes,
  selectNoteById,
} from "@/features/note/store/note-selectors";
import { useAppSelector } from "@/features/store/hooks";
import { useFolderSelection } from "./use-folder-selection";

const renderChildren = (node: JSONContent, path: string) =>
  node.content?.map((child, index) => (
    <PreviewNode key={`${path}-${index}`} node={child} path={`${path}-${index}`} />
  ));

function PreviewNode({ node, path }: { node: JSONContent; path: string }) {
  if (node.type === "text") {
    let text: ReactNode = node.text ?? "";
    for (const mark of [...(node.marks ?? [])].reverse()) {
      if (mark.type === "bold") text = <strong>{text}</strong>;
      else if (mark.type === "italic") text = <em>{text}</em>;
      else if (mark.type === "underline") text = <u>{text}</u>;
      else if (mark.type === "strike") text = <s>{text}</s>;
      else if (mark.type === "code")
        text = <code className="rounded bg-secondary px-1 py-0.5">{text}</code>;
    }
    return text;
  }

  const children = renderChildren(node, path);
  switch (node.type) {
    case "doc":
      return <>{children}</>;
    case "paragraph":
      return <p className="min-h-6 leading-7">{children}</p>;
    case "heading":
      return (
        <div
          role="heading"
          aria-level={
            typeof node.attrs?.level === "number" ? node.attrs.level : 2
          }
          className="mt-5 mb-2 text-xl font-semibold first:mt-0"
        >
          {children}
        </div>
      );
    case "bulletList":
      return <ul className="list-disc space-y-1 pl-6">{children}</ul>;
    case "orderedList":
      return <ol className="list-decimal space-y-1 pl-6">{children}</ol>;
    case "listItem":
    case "taskItem":
      return <li>{children}</li>;
    case "blockquote":
      return (
        <blockquote className="my-3 border-l-2 border-border pl-4 text-muted-foreground">
          {children}
        </blockquote>
      );
    case "codeBlock":
      return (
        <pre className="my-3 overflow-x-auto rounded-lg bg-secondary/50 p-3 font-mono text-sm">
          {children}
        </pre>
      );
    case "hardBreak":
      return <br />;
    case "horizontalRule":
      return <hr className="my-5 border-border" />;
    case "image":
      return (
        <div className="my-3 flex min-h-24 items-center justify-center rounded-lg bg-secondary/30 text-muted-foreground">
          <FileImage size={28} />
        </div>
      );
    default:
      return <>{children}</>;
  }
}

function DocumentPreview({ noteId }: { noteId: string }) {
  const { t } = useTranslation();
  const { document, error } = useDocumentById(noteId);

  if (error)
    return (
      <div className="grid h-full place-items-center text-sm text-destructive">
        {t("quickPreview.loadError")}
      </div>
    );
  if (!document)
    return (
      <div className="grid h-full place-items-center text-sm text-muted-foreground">
        {t("quickPreview.loading")}
      </div>
    );
  if (!document.contents.content?.length)
    return (
      <div className="grid h-full place-items-center text-sm text-muted-foreground">
        {t("quickPreview.emptyDocument")}
      </div>
    );

  return (
    <article className="mx-auto w-full max-w-2xl space-y-3 text-base">
      <PreviewNode node={document.contents} path="root" />
    </article>
  );
}

function FolderPreview({ noteId }: { noteId: string }) {
  const { t } = useTranslation();
  const notes = useAppSelector(selectAllNotes);
  const children = notes.filter(
    (note) => note.parentId === noteId && !note.isTrashed,
  );

  if (children.length === 0)
    return (
      <div className="grid h-full place-items-center text-sm text-muted-foreground">
        {t("quickPreview.emptyFolder")}
      </div>
    );

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] content-start gap-2">
      {children.map((child) => (
        <div
          key={child.id}
          className="flex min-w-0 flex-col items-center gap-2 rounded-xl bg-secondary/30 p-4 text-center"
        >
          {child.kind === NoteKind.Folder ? (
            <FolderIcon size={32} folderColor={child.folderColor} />
          ) : (
            <FileText size={30} className="text-muted-foreground" />
          )}
          <span className="w-full truncate text-sm">
            {child.title || t("defaults.pageTitle")}
          </span>
        </div>
      ))}
    </div>
  );
}

export function QuickPreview() {
  const { t } = useTranslation();
  const previewItemId = useFolderSelection((state) => state.previewItemId);
  const closePreview = useFolderSelection((state) => state.closePreview);
  const note = useAppSelector((state) =>
    previewItemId ? selectNoteById(state, previewItemId) : undefined,
  );
  const typeLabel =
    note?.kind === NoteKind.Folder
      ? t("folders.itemType")
      : t("quickSwitch.documentType");

  return (
    <Dialog
      open={Boolean(note && previewItemId)}
      onOpenChange={(open) => !open && closePreview()}
    >
      <DialogContent
        className="grid h-[min(78vh,720px)] max-w-3xl! grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0"
        onKeyDownCapture={(event) => {
          if (
            event.code === "Space" ||
            event.key === " " ||
            event.key === "Spacebar" ||
            event.key.toLowerCase() === "space"
          ) {
            event.preventDefault();
            event.stopPropagation();
            closePreview();
          }
        }}
      >
        <header className="flex items-center gap-3 border-b border-border/60 px-6 py-4 pr-14">
          {note?.kind === NoteKind.Folder ? (
            <FolderIcon size={28} folderColor={note.folderColor} />
          ) : (
            <FileText size={26} className="text-muted-foreground" />
          )}
          <div className="min-w-0">
            <DialogTitle className="truncate">
              {note?.title || t("defaults.pageTitle")}
            </DialogTitle>
            <DialogDescription className="mt-1">{typeLabel}</DialogDescription>
          </div>
        </header>
        <div className="min-h-0 overflow-auto p-6">
          {note?.kind === NoteKind.Document && previewItemId && (
            <DocumentPreview noteId={previewItemId} />
          )}
          {note?.kind === NoteKind.Folder && previewItemId && (
            <FolderPreview noteId={previewItemId} />
          )}
        </div>
        <footer className="border-t border-border/60 px-6 py-3 text-center text-xs text-muted-foreground">
          {t("quickPreview.closeHint")}
        </footer>
      </DialogContent>
    </Dialog>
  );
}
