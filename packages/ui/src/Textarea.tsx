import { useId, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

/**
 * Textarea renders a labeled native `<textarea>` with an optional error.
 *
 * ```tsx
 * <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
 * ```
 *
 * Native textarea props are forwarded. If no `id` is given, one is generated
 * and linked to the label.
 */
function Textarea({ label, error, id, className, ...rest }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = error ? `${textareaId}-error` : undefined;

  return (
    <label htmlFor={textareaId} className="block">
      <span className="text-ui-text block text-sm font-medium">{label}</span>
      <textarea
        id={textareaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={`bg-ui-surface text-ui-text border-ui-border focus:border-ui-border-focus mt-1 block w-full rounded-lg border-2 px-3 py-2 outline-none transition-colors ${error ? 'border-ui-danger' : ''} ${className ?? ''}`}
        {...rest}
      />
      {error ? (
        <p id={errorId} className="text-ui-danger mt-1 text-sm">
          {error}
        </p>
      ) : null}
    </label>
  );
}

export default Textarea;
