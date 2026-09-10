import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DevBanner from '~/components/DevBanner';
import Layout from '~/components/Layout';
import Navbar from '~/components/Navbar';
import ProtectedRoute from '~/components/ProtectedRoute';
import RoutedErrorBoundary from '~/components/RoutedErrorBoundary';
import WakeLockLifecycle from '~/components/WakeLockLifecycle';
import { AuthProvider } from '~/context/AuthProvider';
import DailyMenu from '~/pages/DailyMenu';
import Home from '~/pages/Home';
import Login from '~/pages/Login';
import NotFound from '~/pages/NotFound';
import Profile from '~/pages/Profile';
import RecipeDetail from '~/pages/RecipeDetail';
import RecipeForm from '~/pages/RecipeForm';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex min-h-dvh flex-col">
          <div className="sticky top-0 z-40 flex flex-col">
            <DevBanner />
            <Navbar />
          </div>
          <WakeLockLifecycle />
          <Layout>
            <RoutedErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/recipe/:id" element={<RecipeDetail />} />
                <Route
                  path="/menu"
                  element={
                    <ProtectedRoute>
                      <DailyMenu />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
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
            </RoutedErrorBoundary>
          </Layout>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
