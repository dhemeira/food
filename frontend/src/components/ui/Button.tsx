import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-surface hover:opacity-90',
  secondary: 'border-border hover:bg-background border',
  ghost: 'hover:bg-background',
  danger: 'bg-accent text-surface hover:opacity-90',
};

function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${variantStyles[variant]} ${className}`}
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      disabled={disabled || loading}
      {...rest}>
      {loading ? 'Folyamatban...' : children}
    </button>
  );
}

export default Button;
