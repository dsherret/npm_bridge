export async function getPackageInstallVersion(packageName: string) {
  const response = await fetch(`https://registry.npmjs.org/${packageName}`, {
    headers: {
      "Accept": "application/vnd.npm.install-v1+json",
    },
  });
  if (!response.ok) {
    throw new Error(
      `Error requesting package information for '${packageName}'. ${response.statusText}`,
    );
  }
  const jsonData = await response.json();
  return jsonData["dist-tags"]["latest"];
}
