export type TokenLeaf = string | number | [number, number, number, number];

export function walkTokenLeaves(
  obj: Record<string, unknown>,
  visit: (dottedPath: string, value: TokenLeaf) => void,
  prefix: string[] = [],
): void {
  for (const [key, value] of Object.entries(obj)) {
    const path = [...prefix, key];
    if (Array.isArray(value) && value.length === 4 && value.every((v) => typeof v === "number")) {
      visit(path.join("."), value as [number, number, number, number]);
    } else if (typeof value === "object" && value !== null) {
      walkTokenLeaves(value as Record<string, unknown>, visit, path);
    } else {
      visit(path.join("."), value as string | number);
    }
  }
}

export function cssVarName(dottedPath: string): string {
  return `--token-${dottedPath.replace(/\./g, "-")}`;
}

export function cssVarValue(leaf: TokenLeaf): string {
  return Array.isArray(leaf) ? `cubic-bezier(${leaf.join(", ")})` : String(leaf);
}
