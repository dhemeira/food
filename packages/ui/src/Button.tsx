import { type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react';
import { buttonClass, type ButtonStyleProps } from './buttonClass';

export type ButtonProps<T extends ElementType = 'button'> = ButtonStyleProps & {
  as?: T;
  loading?: boolean;
  loadingLabel?: ReactNode;
} & ComponentPropsWithoutRef<T>;

/**
 * Button renders a styled native `<button>`, or any element/component via `as`.
 *
 * ```tsx
 * <Button onClick={handleSave}>Save</Button>
 * <Button loading>Save</Button>
 * <Button as={Link} to="/recipes">View recipes</Button>
 * ```
 *
 * Native props are forwarded to the rendered element. The style props are
 * `variant` (`primary` | `secondary` | `danger` | `danger-full`), `small`,
 * and `block`.
 */
function Button<T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  small = false,
  block = false,
  loading = false,
  loadingLabel = 'Loading…',
  className,
  children,
  ...rest
}: ButtonProps<T>) {
  const Component: ElementType = as ?? 'button';
  const disabled = (rest as { disabled?: boolean }).disabled;
  const isDisabled = disabled === true || loading;

  return (
    <Component
      data-variant={variant}
      disabled={isDisabled}
      className={buttonClass({ variant, small, block, className })}
      {...rest}
    >
      {loading ? loadingLabel : children}
    </Component>
  );
}

export default Button;
