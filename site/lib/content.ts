import { prisma } from "./prisma";

export async function getContent(key: string, fallback = ""): Promise<string> {
  try {
    const row = await prisma.content.findUnique({ where: { key } });
    return row?.value ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getManyContent(keys: { key: string; fallback?: string }[]) {
  const results: Record<string, string> = {};
  for (const k of keys) {
    results[k.key] = await getContent(k.key, k.fallback ?? "");
  }
  return results;
}
