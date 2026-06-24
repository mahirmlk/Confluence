"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold text-foreground mb-4">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
