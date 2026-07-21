// Dismissible inline error. Renders nothing when there's no message.
export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="mb-4 flex items-start justify-between gap-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" className="text-red-400 hover:text-red-700">
          ✕
        </button>
      )}
    </div>
  );
}
