import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-4 p-6">
      <h1 className="font-title text-text text-3xl font-semibold">404</h1>
      <p className="text-text-muted text-lg">A keresett oldal nem található.</p>
      <Link className="bg-accent text-surface rounded-xl px-5 py-2.5 font-medium" to="/">
        Vissza a receptekhez
      </Link>
    </main>
  );
}

export default NotFound;
