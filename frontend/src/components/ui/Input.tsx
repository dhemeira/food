import { useId, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

function Input({ label, error, hint, id, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label htmlFor={inputId}>
      <span>{label}</span>
      <input id={inputId} {...rest} />
      {hint ? <p>{hint}</p> : null}
      {error ? <p>{error}</p> : null}
    </label>
  );
}

export default Input;
