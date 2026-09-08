import { Navigate } from 'react-router-dom';
import { Button, LoadingState } from '~/components/ui';
import { useAuth } from '~/context/auth';

function Login() {
  const { user, isLoading, signIn } = useAuth();

  if (isLoading) {
    return <LoadingState />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <h1>Bejelentkezés</h1>
      <Button
        type="button"
        onClick={() => {
          void signIn();
        }}>
        Bejelentkezés Google fiókkal
      </Button>
    </div>
  );
}

export default Login;
