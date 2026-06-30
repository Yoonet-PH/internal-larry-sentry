function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function getServerEnv(name: string): string | undefined {
  const fromProcess = typeof process !== 'undefined' ? process.env[name] : undefined;
  const fromImportMeta = (import.meta.env as Record<string, string | undefined>)[name];
  const value = fromProcess ?? fromImportMeta;
  return value ? stripQuotes(value) : undefined;
}
