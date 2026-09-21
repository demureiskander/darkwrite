import { getEmbedUrl } from "@darkwrite/common";
import { use } from "react";
import { useLocalStore } from "@/context/local-state";
import { useNoteFromURL } from "@/features/note/hooks/use-note-from-url";
import { CanvasWidthContainer } from "@/features/layout/canvas-width-container";
import { navigateToNote } from "../navigation/navigator";
import { useEditorSettings } from "../settings/hooks/use-settings";
import { useAppSelector } from "../store/hooks";
import DarkwriteEditor from ".";
import ConstrainedWidth from "./constrained-width";
import { useSlashCommand } from "./extensions";
import EditorHeader from "./header";
import { useDocumentById } from "./hooks/use-document";
import { useEditorOptions, useEditorView } from "./hooks/use-editor-options";
import { EditorContext } from "./store/editor-context";
import {
  selectEditorContent,
  selectEditorCustomizations,
  selectIsWidePage,
} from "./store/editor-selectors";

export function EditorViewRouteHandler() {
  const noteId = useNoteFromURL();
  const { document } = useDocumentById(noteId ?? "");
  if (!noteId) return null;
  return (
    document && <EditorView key={`editor-root-${noteId}`} noteId={noteId} />
  );
}

export function EditorViewport({
  unconstrainedWidth,
  onNavigate,
}: {
  unconstrainedWidth?: boolean;
  onNavigate?: (id: string) => void;
}) {
  const { noteId } = use(EditorContext);

  const options = useEditorOptions();
  const customizations = useAppSelector((s) =>
    selectEditorCustomizations(s, noteId),
  );
  const content = useAppSelector((s) => selectEditorContent(s, noteId));
  const settings = useEditorSettings();
  const { items } = useSlashCommand(options.imageConfig);
  if (!content || !customizations) return null;
  return (
    <ConstrainedWidth noConstrain={unconstrainedWidth}>
      <DarkwriteEditor
        content={content}
        noteId={noteId}
        commandItems={items}
        onContentChange={options.handleContentChange}
        onUpdate={options.onUpdate}
        onCreate={options.onCreate}
        imageUploadConfig={options.imageConfig}
        showTextDirectionControls={settings.showTextDirectionControls}
        openFilesOnDoubleClick={settings.openFilesOnDoubleClick}
        codeBlockIndentSize={settings.codeIndentSize}
        embedSourceResolver={async (id) => getEmbedUrl(id)}
        key={noteId}
        onNavigateToNote={onNavigate ?? navigateToNote}
      />
    </ConstrainedWidth>
  );
}

export function EditorView({ noteId }: { noteId: string }) {
  const spellcheck = useLocalStore((s) => s.useSpellcheck);
  const widePage = useAppSelector((s) => selectIsWidePage(s, noteId));
  const { style } = useEditorView(noteId, true);

  return (
    <div
      data-editor-boundary="true"
      className="flex flex-col px-6 md:px-10 editor-fade-in min-h-full relative"
      style={style}
      spellCheck={spellcheck}
    >
      <CanvasWidthContainer fill={widePage} className="flex flex-col gap-2">
        <EditorHeader />
        <EditorViewport />
      </CanvasWidthContainer>
    </div>
  );
}
