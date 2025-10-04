export function formatContent(template: string, values: Record<string, string | number>) {
  return template.replace(/\{\{(.*?)\}\}/g, (_, rawKey) => {
    const key = rawKey.trim();
    if (!(key in values)) {
      return "";
    }
    const value = values[key];
    return typeof value === "number" ? String(value) : value;
  });
}
