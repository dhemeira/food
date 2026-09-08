import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DevBanner from '~/components/DevBanner';
import Layout from '~/components/Layout';
import Navbar from '~/components/Navbar';
import ProtectedRoute from '~/components/ProtectedRoute';
import WakeLockLifecycle from '~/components/WakeLockLifecycle';
import { ErrorBoundary } from '~/components/ui';
import { AuthProvider } from '~/context/AuthProvider';
import Home from '~/pages/Home';
import Login from '~/pages/Login';
import NotFound from '~/pages/NotFound';
import RecipeDetail from '~/pages/RecipeDetail';
import RecipeForm from '~/pages/RecipeForm';

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <div className="flex min-h-dvh flex-col">
            <DevBanner />
            <Navbar />
            <WakeLockLifecycle />
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/recipe/:id" element={<RecipeDetail />} />
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
            </Layout>
          </div>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
