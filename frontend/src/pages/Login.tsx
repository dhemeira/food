import { Navigate } from 'react-router-dom';
import { Button, GlassSurface, LoadingState } from '@dhemeira/ui';
import { useAuth } from '~/context/auth';

function Login() {
  const { user, isAllowed, isLoading, signIn } = useAuth();

  if (isLoading) {
    return <LoadingState />;
  }

  // Only bounce back if the signed-in account is actually allowed; a
  // non-allowlisted account stays here so it can switch accounts.
  if (user && isAllowed) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <GlassSurface className="flex w-full max-w-sm flex-col gap-4 rounded-2xl! p-8 text-center">
        <h1 className="text-ui-text text-3xl font-bold tracking-tight">Receptek</h1>
        <p className="text-ui-text/70 text-sm leading-relaxed">
          Jelentkezz be, hogy recepteket ments, és összeállítsd a napi menüt.
        </p>
        <Button
          type="button"
          block
          onClick={() => {
            void signIn();
          }}>
          Bejelentkezés Google fiókkal
        </Button>
      </GlassSurface>
    </div>
  );
}

export default Login;
