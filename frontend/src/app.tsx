import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '~/context/AuthProvider';
import Header from '~/components/Header';
import ProtectedRoute from '~/components/ProtectedRoute';
import OfflineBanner from '~/components/OfflineBanner';
import UpdateBanner from '~/components/UpdateBanner';
import { ErrorBoundary } from '~/components/ui';
import Admin from '~/pages/Admin';
import Home from '~/pages/Home';
import Login from '~/pages/Login';
import NotFound from '~/pages/NotFound';
import RecipeDetail from '~/pages/RecipeDetail';
import RecipeForm from '~/pages/RecipeForm';
import { useServerStatus } from '~/pwa/useServerStatus';

function App() {
  const { isOnline } = useServerStatus();

  return (
    <ErrorBoundary>
      <AuthProvider>
        {/* useTransitions={false}: route changes become synchronous so the search
            pill can flush the navigation inside the tap gesture (see Search.tsx). */}
        <BrowserRouter useTransitions={false}>
          <div className="flex min-h-dvh flex-col">
            <UpdateBanner />
            <OfflineBanner isVisible={isOnline === false} />
            <Header isOnline={isOnline} />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipe/new"
                element={
                  <ProtectedRoute>
                    <RecipeForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipe/:id/edit"
                element={
                  <ProtectedRoute>
                    <RecipeForm />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
