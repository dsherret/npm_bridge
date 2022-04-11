export class DepsFile {
  #jsonData: any;

  constructor() {
    let text: string;
    try {
      text = Deno.readTextFileSync("./npm_deps.json");
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        text = "{}";
      } else {
        throw err;
      }
    }
    this.#jsonData = JSON.parse(text);
  }

  addDependency(name: string, versionText: string) {
    this.#jsonData.dependencies = this.#jsonData.dependencies ?? {};
    this.#jsonData.dependencies[name] = versionText;
  }

  addDevDependency(name: string, versionText: string) {
    this.#jsonData.devDependencies = this.#jsonData.devDependencies ?? {};
    this.#jsonData.devDependencies[name] = versionText;
  }

  getDependencies() {
    return parseDependencies(this.#jsonData.dependencies);
  }

  getDevDependencies() {
    return parseDependencies(this.#jsonData.devDependencies);
  }

  async save() {
    await Deno.writeTextFile(
      "./npm_deps.json",
      JSON.stringify(this.#jsonData, undefined, 2) + "\n",
    );
  }
}

function parseDependencies(jsonDeps: any) {
  const dependencies: { [name: string]: string } = {};
  if (typeof jsonDeps === "object") {
    for (const [key, value] of Object.entries(jsonDeps)) {
      if (typeof value !== "string") {
        throw new Error(
          `The type of the ${key} dependency must be an object.`,
        );
      }
      dependencies[key] = value;
    }
  }
  return dependencies;
}
