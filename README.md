# npm_bridge

**This is a proof of concept I threw together in a few hours. DO NOT USE THIS AS
IT LIKELY WON'T WORK. I haven't implemented a lot.**

Proof of concept for a bridge between Deno and npm packages.

Works similarly to using npm in Node.

### Step 1: Setup

In the root of your application, create a deno.json file and add a `npm` & `npx`
task:

```json
{
  "tasks": {
    "npm": "deno run -A --no-check https://deno.land/x/npm_bridge@{VERSION}/npm.ts",
    "npx": "deno run -A --no-check https://deno.land/x/npm_bridge@{VERSION}/npx.ts"
  }
}
```

### Step 2: Initialize

Now run these commands similarly to as you would with npm:

1. `deno task npm init` - Initialize a _npm_deps.json_ file (similar to
   _package.json_).
1. `deno task npm install <package-name>` - Add a dependency.
   - Alternatively: `deno task npm i <package-name>`
   - For dev dependency: `deno task npm i --save-dev <package-name>`

### Step 2: Use dependencies

1. Import and use the package via a bare specifier.

   For example, if we did `deno task npm i ts-morph` above:
   ```ts
   // main.ts
   import { Project } from "ts-morph";

   const project = new Project();
   const sourceFile = project.createSourceFile("test.ts", "class MyClass {}");
   console.log(sourceFile.getClassOrThrow("MyClass").getName());
   ```
2. Run it:
   ```shell
   deno run --allow-read --allow-env --unstable main.ts
   ```

#### Use Binary Dependencies

To use a binary dependency, run `deno task npx <binary-name>`.

For example:

```shell
deno task npx --allow-write=. mkdirp subdir/newdir
```

You may wish to alias these in another deno task.

## What this does

1. Runs `npm install` with the dependencies you specified.
1. Analyzes the `node_modules` folder and creates wrapper ESM modules around the
   CJS code.
1. Creates an import map to map bare specifiers to the wrapper ESM modules and
   to map import specifiers with no extensions to extensions.
1. Updates or adds the import map to your _deno.json_ file.

## Subcommands

### `deno task npm init`

Initializes a _npm_deps.json_ file.

### `deno task npm install`

Installs the packages specified in _npm_deps.json_ into a _npm_deps_ folder.

### `deno task npm install <package-name>`

Adds a package to the _npm_deps.json_ `dependencies` and installs it.

### `deno task npm install --save-dev <package-name>`

Adds a package to the _npm_deps.json_ `devDependencies` and installs it.

### `deno task npx <...deno-args> <sub-command> <...sub-command-args>`

For running a sub command.
