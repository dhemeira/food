import Layout from '~/components/Layout';

function Login() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <h1 className="text-text text-3xl font-semibold">Bejelentkezés</h1>
        <p className="text-text-muted text-lg">A bejelentkezési űrlap itt fog megjelenni.</p>
      </div>
    </Layout>
  );
}

export default Login;
