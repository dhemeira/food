import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled === true || loading;

  return (
    <button data-variant={variant} disabled={isDisabled} {...rest}>
      {loading ? 'Folyamatban...' : children}
    </button>
  );
}

export default Button;
