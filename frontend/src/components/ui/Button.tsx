import type { ButtonHTMLAttributes } from 'react';
import { buttonClass, type ButtonStyleProps } from './buttonClass';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {
  loading?: boolean;
}

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
  const classes = buttonClass({ variant, small, block, className });

  return (
    <button data-variant={variant} disabled={isDisabled} className={classes} {...rest}>
      {loading ? 'Folyamatban...' : children}
    </button>
  );
}

export default Button;
