import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'danger-full';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  small?: boolean;
  block?: boolean;
  loading?: boolean;
}

const baseClass =
  'select-none touch-manipulation ' +
  'border-2 text-center text-base font-semibold leading-normal ' +
  'transition-all pointer-fine:duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ' +
  'active:translate-y-0.5 ' +
  'pointer-fine:hover:-translate-y-0.5 pointer-fine:active:translate-y-0 ' +
  'disabled:pointer-events-none';

type ButtonSize = 'small' | 'large';

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'border-accent bg-accent text-surface ' +
    'active:shadow-[0_0_25px_-5px_var(--color-accent)] ' +
    'pointer-fine:hover:bg-accent-hover pointer-fine:hover:shadow-[0_0_25px_-5px_var(--color-accent)]',
  secondary:
    'border-accent bg-transparent text-accent ' +
    'active:shadow-[0_0_25px_-10px_var(--color-accent)] ' +
    'pointer-fine:hover:bg-accent pointer-fine:hover:text-surface pointer-fine:hover:shadow-[0_0_25px_-10px_var(--color-accent)]',
  danger:
    'border-danger bg-transparent text-danger ' +
    'active:shadow-[0_0_25px_-5px_var(--color-danger)] ' +
    'pointer-fine:hover:bg-danger pointer-fine:hover:text-white pointer-fine:hover:shadow-[0_0_25px_-10px_var(--color-danger)]',
  'danger-full':
    'border-danger bg-danger text-white ' +
    'active:shadow-[0_0_25px_-5px_var(--color-danger)] ' +
    'pointer-fine:hover:bg-danger-hover pointer-fine:hover:shadow-[0_0_25px_-5px_var(--color-danger)]',
};

const sizeClass: Record<ButtonSize, string> = {
  small: 'px-6 py-2 rounded-lg',
  large: 'px-8 py-4 rounded-xl',
};

function Button({
  variant = 'primary',
  small = false,
  block = false,
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled === true || loading;
  const classes = [
    baseClass,
    variantClass[variant],
    block ? 'block' : 'inline-block',
    sizeClass[small ? 'small' : 'large'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button data-variant={variant} disabled={isDisabled} className={classes} {...rest}>
      {loading ? 'Folyamatban...' : children}
    </button>
  );
}

export default Button;
