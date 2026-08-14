import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-text text-3xl font-semibold">404</h1>
      <p className="text-text text-lg brightness-80">A keresett oldal nem található.</p>
      <Link
        className="bg-accent text-surface rounded-xl px-4 py-2 text-sm font-medium hover:brightness-80"
        to="/">
        Vissza a receptekhez
      </Link>
    </main>
  );
}

export default NotFound;
