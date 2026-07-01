interface FullscreenLoaderProps {
  label?: string;
}

export function FullscreenLoader({
  label = 'A carregar interface.',
}: FullscreenLoaderProps) {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-muted">{label}</p>
      </div>
    </div>
  );
}
