import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from '~/components/Navbar';
import ProtectedRoute from '~/components/ProtectedRoute';
import { AuthProvider } from '~/context/AuthProvider';
import Home from '~/pages/Home';
import Login from '~/pages/Login';
import NotFound from '~/pages/NotFound';
import RecipeDetail from '~/pages/RecipeDetail';
import RecipeForm from '~/pages/RecipeForm';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
