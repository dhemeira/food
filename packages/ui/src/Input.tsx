import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
}

/**
 * Input renders a labeled native `<input>` with an optional hint and error.
 *
 * ```tsx
 * <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
 * <Input label="Title" error={titleError} />
 * ```
 *
 * Native input props are forwarded (`type`, `placeholder`, …). If no `id` is
 * given, one is generated and linked to the label.
 */
function Input({ label, error, hint, id, className, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <label htmlFor={inputId} className="block">
      <span className="text-ui-text block text-sm font-medium">{label}</span>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hintId}
        className={`bg-ui-surface text-ui-text border-ui-border focus:border-ui-border-focus mt-1 block w-full rounded-lg border-2 px-3 py-2 outline-none transition-colors ${error ? 'border-ui-danger' : ''} ${className ?? ''}`}
        {...rest}
      />
      {hint ? (
        <p id={hintId} className="text-ui-text/60 mt-1 text-sm">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-ui-danger mt-1 text-sm">
          {error}
        </p>
      ) : null}
    </label>
  );
}

export default Input;
