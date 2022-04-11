# npm_bridge

**This is a proof of concept I threw together in a few hours. DO NOT USE THIS AS
IT LIKELY WON'T WORK. I haven't implemented a lot.**

Proof of concept for a bridge between Deno and npm packages.

Works similarly to using npm in Node.

### Step 1: Setup

In the root of your application:

1. Create a deno.json file and add a "npm" task:
   ```json
   {
     "tasks": {
       "npm": "deno run -A --no-check --reload https://deno.land/x/npm_bridge/main.ts"
     }
   }
   ```

Now run these commands similarly to as you would with npm:

1. Run `deno task npm init` to initialize a _npm_deps.json_ file.
1. Add dependencies (ex. `deno task npm install ts-morph`,
   `deno task npm i --save-dev mkdirp`)

### Step 2: Use dependencies

1. Import and use the package via a bare specifier:
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

To use a binary dependency, create a new entry in your deno.json that references
the `./npm_deps/<package-name>.bin.js` file:

```jsonc
{
  "tasks": {
    // ...
    "mkdirp": "deno run -A --unstable ./npm_deps/mkdirp.bin.js"
  }
  // ...
}
```

Now try it out:

```shell
deno task mkdirp subdir/newdir
```

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
