import { useId, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

/**
 * Select renders a labeled native `<select>` with an optional error.
 *
 * ```tsx
 * <Select label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
 *   <option value="g">g</option>
 *   <option value="ml">ml</option>
 * </Select>
 * ```
 *
 * Native select props are forwarded. If no `id` is given, one is generated
 * and linked to the label.
 */
function Select({ label, error, id, className, children, ...rest }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <label htmlFor={selectId} className="block">
      <span className="text-ui-text block text-sm font-medium">{label}</span>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={`bg-ui-surface text-ui-text border-ui-border focus:border-ui-border-focus mt-1 block w-full rounded-lg border-2 px-3 py-2 outline-none transition-colors ${error ? 'border-ui-danger' : ''} ${className ?? ''}`}
        {...rest}
      >
        {children}
      </select>
      {error ? (
        <p id={errorId} className="text-ui-danger mt-1 text-sm">
          {error}
        </p>
      ) : null}
    </label>
  );
}

export default Select;
