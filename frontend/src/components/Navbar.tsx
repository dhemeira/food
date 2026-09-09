import { Link } from 'react-router-dom';
import { useAuth, username } from '~/context/auth';
import { Avatar } from './ui';

function Navbar() {
  const { user, signIn, signOut } = useAuth();

  return (
    <nav>
      <Link to="/">Receptek</Link>
      {user ? (
        <>
          <Link to="/profile">{username(user)}</Link>
          <Avatar username={username(user)} />
          <Link to="/recipe/new">Új recept</Link>
          <button type="button" onClick={() => void signOut()}>
            Kijelentkezés
          </button>
        </>
      ) : (
        <button type="button" onClick={() => void signIn()}>
          Bejelentkezés
        </button>
      )}
    </nav>
  );
}

export default Navbar;
