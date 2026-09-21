import path from "node:path";
import { build, defineConfig, type InlineConfig } from "vite";
import electron from "vite-plugin-electron";
import frontendConfig from "../frontend/vite.config";

const desktopRoot = path.resolve(".");
const frontendRoot = path.resolve("../frontend");

const frontendResolve = {
  alias: {
    "@": path.resolve(frontendRoot, "src"),
  },
};

const desktopResolve = {
  alias: {
    "@": path.resolve("src/"),
    "font-list": path.resolve("node_modules/font-list/index.js"),
  },
};

const DISTDIR = path.resolve("dist-electron");

const preloadConfig: InlineConfig = {
  resolve: desktopResolve,
  configFile: false,
  build: {
    outDir: DISTDIR,
    lib: {
      entry: path.resolve("src/preload/preload.ts"),
      formats: ["cjs"],
      fileName: () => "preload.js",
    },
    rollupOptions: {
      external: ["electron"],
    },
    license: {
      fileName: "thirdparty.preload.md",
    },
  },
};

export default defineConfig(({ command }) => ({
  root: command === "serve" ? frontendRoot : desktopRoot,
  server:
    command === "serve"
      ? {
          watch: {
            ignored: ["**/dist/**"],
          },
        }
      : undefined,
  plugins: [
    ...(command === "serve" ? (frontendConfig.plugins ?? []) : []),
    {
      name: "build-preload",
      async buildStart() {
        await build(preloadConfig);
      },
    },
    electron([
      {
        entry: "src/main.ts",
        onstart({ startup }) {
          startup(["dist-electron/main.js"]);
        },
        vite: {
          root: desktopRoot,
          resolve: desktopResolve,
          build: {
            outDir: path.resolve(DISTDIR),
            rollupOptions: {
              platform: "node",
              external: [
                "electron",
                /^node:/,
                "typeorm",
                "better-sqlite3",
                "@libsql/client",
                /^@libsql\/.*/,
              ],
            },
            license: {
              fileName: "thirdparty.main.md",
            },
          },
        },
      },
    ]),
  ],
  resolve: command === "serve" ? frontendResolve : desktopResolve,
  build: {
    outDir: path.resolve("dist_discarded"),
  },
}));
