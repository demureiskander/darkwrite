import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearStructuralHistory,
  recordStructuralAction,
  redoStructuralAction,
  undoStructuralAction,
} from "./structural-history";

describe("structural history", () => {
  beforeEach(clearStructuralHistory);

  it("undoes and redoes the latest command", async () => {
    const undo = vi.fn(async () => true);
    const redo = vi.fn(async () => true);
    recordStructuralAction("workspace", { redo, undo });

    expect(await undoStructuralAction("workspace")).toBe(true);
    expect(undo).toHaveBeenCalledOnce();
    expect(await redoStructuralAction("workspace")).toBe(true);
    expect(redo).toHaveBeenCalledOnce();
  });

  it("clears redo after a new action", async () => {
    const first = {
      redo: vi.fn(async () => true),
      undo: vi.fn(async () => true),
    };
    const second = {
      redo: vi.fn(async () => true),
      undo: vi.fn(async () => true),
    };
    recordStructuralAction("workspace", first);
    await undoStructuralAction("workspace");
    recordStructuralAction("workspace", second);

    expect(await redoStructuralAction("workspace")).toBe(false);
  });

  it("keeps independent history for each workspace", async () => {
    const firstUndo = vi.fn(async () => true);
    const secondUndo = vi.fn(async () => true);
    recordStructuralAction("first", {
      redo: async () => true,
      undo: firstUndo,
    });
    recordStructuralAction("second", {
      redo: async () => true,
      undo: secondUndo,
    });

    await undoStructuralAction("first");

    expect(firstUndo).toHaveBeenCalledOnce();
    expect(secondUndo).not.toHaveBeenCalled();
  });

  it("does not record commands produced while replaying", async () => {
    const nestedUndo = vi.fn(async () => true);
    recordStructuralAction("workspace", {
      redo: async () => true,
      undo: async () => {
        recordStructuralAction("workspace", {
          redo: async () => true,
          undo: nestedUndo,
        });
        return true;
      },
    });

    await undoStructuralAction("workspace");
    expect(await undoStructuralAction("workspace")).toBe(false);
    expect(nestedUndo).not.toHaveBeenCalled();
  });
});
