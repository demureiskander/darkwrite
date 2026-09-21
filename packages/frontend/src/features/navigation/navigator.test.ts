// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { useLocalStore } from "@/context/local-state";
import { folderRoute, navigateToFolder, NavigationEventBus } from "./navigator";

describe("folder navigation history", () => {
  beforeEach(() => {
    window.location.hash = "#/";
    useLocalStore.setState({ activeFolderId: null });
  });

  it("builds routes for folders and the workspace root", () => {
    expect(folderRoute("folder one")).toBe("/?folder=folder%20one");
    expect(folderRoute(null)).toBe("/?folder=root");
  });

  it("updates the active folder and emits a history route", () => {
    const routes: string[] = [];
    const unsubscribe = NavigationEventBus.subscribe(
      "onRouteChanged",
      ({ data }) => routes.push(data),
    );

    navigateToFolder("folder-1");

    expect(useLocalStore.getState().activeFolderId).toBe("folder-1");
    expect(routes).toEqual(["/?folder=folder-1"]);
    unsubscribe();
  });
});
