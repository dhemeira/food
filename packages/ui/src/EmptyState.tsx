interface EmptyStateProps {
  message: string;
}

/**
 * EmptyState shows a muted message for empty content areas.
 *
 * ```tsx
 * <EmptyState message="No recipes yet." />
 * ```
 */
function EmptyState({ message }: EmptyStateProps) {
  return <p className="text-ui-text/60">{message}</p>;
}

export default EmptyState;
