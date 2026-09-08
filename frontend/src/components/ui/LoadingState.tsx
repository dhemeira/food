interface LoadingStateProps {
  label?: string;
}

function LoadingState({ label = 'Betöltés…' }: LoadingStateProps) {
  return <p>{label}</p>;
}

export default LoadingState;
