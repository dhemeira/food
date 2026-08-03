import ErrorBoundary from '~/components/ui/ErrorBoundary';
import NotificationPanel from '~/components/NotificationPanel';
import UpdateBanner from '~/components/UpdateBanner';

function App() {
  return (
    <>
      <UpdateBanner />
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 p-6">
        <ErrorBoundary>
          <h1 className="font-title text-text text-4xl font-semibold">Receptek</h1>
          <p className="text-text-muted text-lg">Kedvenc receptjeink egy helyen.</p>
          <NotificationPanel />
        </ErrorBoundary>
      </main>
    </>
  );
}

export default App;
