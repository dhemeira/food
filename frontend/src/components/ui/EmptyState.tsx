interface EmptyStateProps {
  message: string;
}

function EmptyState({ message }: EmptyStateProps) {
  return <p>{message}</p>;
}

export default EmptyState;
