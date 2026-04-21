import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Fields from './pages/Fields.jsx';
import FieldDetail from './pages/FieldDetail.jsx';
import NewField from './pages/NewField.jsx';
import Users from './pages/Users.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/fields" element={<Fields />} />
        <Route path="/fields/:id" element={<FieldDetail />} />

        <Route
          path="/admin/fields/new"
          element={<ProtectedRoute role="ADMIN"><NewField /></ProtectedRoute>}
        />
        <Route
          path="/admin/users"
          element={<ProtectedRoute role="ADMIN"><Users /></ProtectedRoute>}
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
