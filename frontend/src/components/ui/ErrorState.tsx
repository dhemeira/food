import Button from './Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 p-10 text-center">
      <p className="text-accent">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Újra
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
