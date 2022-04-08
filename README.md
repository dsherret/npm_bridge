# npm_bridge

**This is a proof of concept I threw together in a few hours. DO NOT USE THIS AS
IT LIKELY WON'T WORK. I haven't implemented a lot.**

Proof of concept for a bridge between Deno and npm packages.

Works similarly to using npm in Node.

### Step 1: Setup - Install dependencies

In the root of your application:

1. Define your dependencies in a `npm_deps.json`
   ```json
   {
     "npmDependencies": {
       "ts-morph": "^14.0.0"
     }
   }
   ```
   Note: Include dependencies and dev dependencies
2. Run `deno run -A --no-check --reload https://deno.land/npm_bridge/main.ts`

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

## What this does

1. Runs `npm install` with the dependencies you specified.
2. Analyzes the `node_modules` folder and creates wrapper ESM modules around the
   CJS code.
3. Creates an import map to map bare specifiers to the wrapper ESM modules and
   to map import specifiers with no extensions to extensions.
4. Updates or adds the import map to your _deno.json_ file.
