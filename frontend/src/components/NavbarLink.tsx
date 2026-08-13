import { NavLink, type NavLinkRenderProps } from 'react-router-dom';

interface Props {
  to: string;
  name: string;
}

function NavbarLink({ to, name }: Props) {
  return (
    <NavLink
      to={to}
      className={({ isActive }: NavLinkRenderProps) =>
        (isActive ? 'pointer-events-none font-bold brightness-100! ' : '') +
        'text-text p-2 brightness-80 hover:brightness-100'
      }>
      {name}
    </NavLink>
  );
}

export default NavbarLink;
