import Button from './Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div>
      <p>{message}</p>
      {onRetry ? (
        <Button type="button" variant="secondary" onClick={onRetry}>
          Újra
        </Button>
      ) : null}
    </div>
  );
}

export default ErrorState;
