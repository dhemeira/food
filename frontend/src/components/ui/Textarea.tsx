import { useId, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

function Textarea({ label, error, id, ...rest }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <label htmlFor={textareaId}>
      <span>{label}</span>
      <textarea id={textareaId} {...rest} />
      {error ? <p>{error}</p> : null}
    </label>
  );
}

export default Textarea;
