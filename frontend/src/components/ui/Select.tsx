import { useId, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

function Select({ label, error, id, children, ...rest }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <label htmlFor={selectId}>
      <span>{label}</span>
      <select id={selectId} {...rest}>
        {children}
      </select>
      {error ? <p>{error}</p> : null}
    </label>
  );
}

export default Select;
