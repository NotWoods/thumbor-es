import { build, emptyDir } from "jsr:@deno/dnt";
import { rollup, type RollupBuild } from "npm:rollup";
import manifest from "../deno.json" with { type: "json" };

await emptyDir("./npm");

await build({
  entryPoints: Object.entries(manifest.exports).map(([name, path]) => ({
    name,
    path,
  })),
  outDir: "./npm",
  shims: {
    deno: { test: "dev" },
  },
  declaration: "separate",
  importMap: "./deno.json",
  package: {
    // package.json properties
    name: "thumbor-es",
    version: manifest.version,
    description: "TypeScript Thumbor client for Node, Deno, Bun, & browsers",
    license: "Apache-2.0",
    repository: "github:NotWoods/thumbor-es",
    author: {
      name: "Tiger Oakes",
      email: "contact@tigeroakes.com",
      url: "https://tigeroakes.com",
    },
    bugs: {
      url: "https://github.com/NotWoods/thumbor-es/issues",
    },
    homepage: "https://jsr.io/@notwoods/thumbor-es/doc",
    keywords: [
      "thumbor",
      "cloudinary",
      "image",
      "resize",
      "crop",
      "filter",
      "transform",
      "modern",
    ],
  },
  async postBuild() {
    // steps to run after building and before running the tests
    await Promise.all([
      Deno.copyFile("LICENSE", "npm/LICENSE"),
      Deno.copyFile("README.md", "npm/README.md"),
    ]);

    await bundleJsrDeps("npm/esm/url.js");
  },
});

async function bundleJsrDeps(file: string) {
  await using bundle = disposableBundle(
    await rollup({
      input: file,
      external: (id, parentId) =>
        !id.includes("deps") && !parentId?.includes("deps"),
    }),
  );

  return await bundle.write({ format: "es", file });
}

function disposableBundle(bundle: RollupBuild): RollupBuild & AsyncDisposable {
  return {
    ...bundle,
    async [Symbol.asyncDispose]() {
      await bundle.close();
    },
  };
}
