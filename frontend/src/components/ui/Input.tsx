import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  hintError?: boolean;
}

function Input({ label, error, hint, hintError = false, id, className = '', ...rest }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label htmlFor={inputId} className="flex flex-col gap-1">
      <span className="text-text text-sm">{label}</span>
      <input
        id={inputId}
        className={`border-border bg-background rounded-xl border px-3 py-2 focus:outline-none ${className}`}
        {...rest}
      />
      {hint && (
        <p className={hintError ? 'text-accent text-sm' : 'text-text-muted text-sm'}>{hint}</p>
      )}
      {error && <p className="text-accent text-sm">{error}</p>}
    </label>
  );
}

export default Input;
