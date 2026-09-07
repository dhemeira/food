import { Navigate } from 'react-router-dom';
import { useAuth } from '~/context/auth';

function Login() {
  const { user, isLoading, signIn } = useAuth();

  if (isLoading) {
    return <p>Betöltés…</p>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <h1>Bejelentkezés</h1>
      <button type="button" onClick={() => void signIn()}>
        Bejelentkezés Google fiókkal
      </button>
    </div>
  );
}

export default Login;
