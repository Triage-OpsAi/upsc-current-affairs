export function AppLoader({
  label = "Preparing your study workspace",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 text-center ${compact ? "min-h-36" : "min-h-[280px]"}`} role="status" aria-live="polite">
      <div className="voice-loader" aria-hidden="true"><span /><span /><span /><span /></div>
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="mt-1 text-xs text-zinc-500">Syncing practice, progress, and reports</p>
      </div>
    </div>
  );
}

export function LoadingOverlay({ show, label = "Working" }: { show: boolean; label?: string }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-[#08090d]/75 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-sm p-6"><AppLoader label={label} compact /></div>
    </div>
  );
}

export function InlineSpinner({ label }: { label?: string }) {
  return <span className="inline-flex items-center gap-2"><span className="inline-spinner" aria-hidden="true" />{label}</span>;
}
