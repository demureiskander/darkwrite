export type StructuralHistoryCommand = {
  redo: () => Promise<boolean>;
  undo: () => Promise<boolean>;
};

type WorkspaceHistory = {
  busy: boolean;
  redo: StructuralHistoryCommand[];
  undo: StructuralHistoryCommand[];
};

const histories = new Map<string, WorkspaceHistory>();
let replayDepth = 0;
const MAX_HISTORY_LENGTH = 100;

const historyFor = (workspaceId: string) => {
  const existing = histories.get(workspaceId);
  if (existing) return existing;
  const history: WorkspaceHistory = { busy: false, redo: [], undo: [] };
  histories.set(workspaceId, history);
  return history;
};

export const recordStructuralAction = (
  workspaceId: string,
  command: StructuralHistoryCommand,
) => {
  if (replayDepth > 0) return;
  const history = historyFor(workspaceId);
  history.undo.push(command);
  if (history.undo.length > MAX_HISTORY_LENGTH) history.undo.shift();
  history.redo = [];
};

const replay = async (workspaceId: string, source: "undo" | "redo") => {
  const history = historyFor(workspaceId);
  if (history.busy) return false;
  const command = history[source].pop();
  if (!command) return false;

  history.busy = true;
  replayDepth += 1;
  let succeeded = false;
  try {
    succeeded = await command[source]();
  } catch {
    succeeded = false;
  } finally {
    replayDepth -= 1;
    history.busy = false;
  }

  if (succeeded) history[source === "undo" ? "redo" : "undo"].push(command);
  else history[source].push(command);
  return succeeded;
};

export const undoStructuralAction = (workspaceId: string) =>
  replay(workspaceId, "undo");

export const redoStructuralAction = (workspaceId: string) =>
  replay(workspaceId, "redo");

export const clearStructuralHistory = () => {
  histories.clear();
  replayDepth = 0;
};
