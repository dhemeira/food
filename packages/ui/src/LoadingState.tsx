interface LoadingStateProps {
  label?: string;
}

/**
 * LoadingState shows a muted loading label.
 *
 * ```tsx
 * <LoadingState />
 * <LoadingState label="Uploading…" />
 * ```
 */
function LoadingState({ label = 'Loading…' }: LoadingStateProps) {
  return <p className="text-ui-text/60">{label}</p>;
}

export default LoadingState;
