import Button from './Button';

interface ErrorStateProps {
  message: string;
  title?: string;
  retryLabel?: string;
  onRetry?: () => void;
}

/**
 * ErrorState shows an error message with an optional retry action.
 *
 * ```tsx
 * <ErrorState message={error.message} onRetry={reload} />
 * ```
 */
function ErrorState({
  message,
  title = 'Something went wrong',
  retryLabel = 'Retry',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <p className="text-ui-text text-lg font-semibold">{title}</p>
      <p className="text-ui-accent">{message}</p>
      {onRetry ? (
        <Button type="button" variant="primary" block onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default ErrorState;
