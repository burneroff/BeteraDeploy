import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/app/Layout/Layout';
import { AdminPage } from '@/pages/AdminPage';
import NotFoundPage from '@/pages/NotFoundPage/NotFoundPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { LoginPage } from '@/pages/LoginPage/LoginPage';
import { ConfirmPasswordPage } from '@/pages/ConfirmPasswordPage/ConfirmPasswordPage';
import { ProtectedRoute } from '../providers/ProtectedRoute/ProtectedRoute';
import { DocumentPage } from '@/pages/DocumentPage';
import { useMe } from '@/shared/queries/user/useMe';

function HomeRedirect() {
  const { user, isLoading } = useMe();

  if (isLoading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role.toLowerCase();
  if (role === 'администратор' || role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/documents" replace />;
}

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/confirm-password" element={<ConfirmPasswordPage />} />

      <Route element={<Layout />}>
        <Route index element={<HomeRedirect />} />
        <Route path="/documents" element={<ProtectedRoute element={<DocumentPage />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
        <Route
          path="/admin"
          element={<ProtectedRoute element={<AdminPage />} roles={['Администратор']} />}
        />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
      <Route path="/404" element={<NotFoundPage />} />
    </Routes>
  );
};
