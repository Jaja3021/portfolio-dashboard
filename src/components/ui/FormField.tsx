export function inputClass(hasError: boolean) {
  return `w-full rounded-xl border px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent ${
    hasError ? "border-red-400" : "border-border"
  }`;
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground/80">{label}</span>
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  );
}
