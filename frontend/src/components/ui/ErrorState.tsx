import Button from './Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <p className="text-text text-lg font-semibold">Hiba történt</p>
      <p className="text-accent">{message}</p>
      {onRetry ? (
        <Button type="button" variant="primary" block onClick={onRetry}>
          Újra
        </Button>
      ) : null}
    </div>
  );
}

export default ErrorState;
