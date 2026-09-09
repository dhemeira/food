import { Link, type LinkProps } from 'react-router-dom';
import { buttonClass, type ButtonStyleProps } from './buttonClass';

interface LinkButtonProps extends LinkProps, ButtonStyleProps {}

function LinkButton({
  variant = 'primary',
  small = false,
  block = false,
  className,
  ...rest
}: LinkButtonProps) {
  return <Link className={buttonClass({ variant, small, block, className })} {...rest} />;
}

export default LinkButton;
