import { Link } from 'react-router-dom';
import { useAuth } from '~/context/auth';

function Navbar() {
  const { user, signIn, signOut } = useAuth();

  return (
    <nav>
      <Link to="/">Receptek</Link>
      {user ? (
        <>
          <Link to="/profile">{user.displayName ?? user.email ?? user.id}</Link>
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
