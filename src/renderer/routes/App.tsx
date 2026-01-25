import { Navigate, Route, Routes } from 'react-router-dom';
import PageNotFound from '../components/Shared/PageNotFound';
import userAPI from '../apis/user';
import ProtectedRoute from '../app/ProtectedRoute';
import { useEffect, useState } from 'react';
import Layout from '../layouts/Layout';
import KabisilyaDashboardPage from '../pages/dashboard';
import KabisilyaFirstRunSetup from '../pages/Setup';
import Login from '../pages/Auth/Login';
import BukidTablePage from '../pages/Bukid/Table';
import PitakTablePage from '../pages/Pitak/Table/PitakTable';

// 🔹 Placeholder components para hindi mag red mark
const Placeholder = ({ title }: { title: string }) => (
  <div style={{ padding: '2rem' }}>
    <h1>{title}</h1>
    <p>Placeholder page for {title}</p>
  </div>
);

function App() {
  const [setupRequired, setSetupRequired] = useState<boolean | null>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      const response = await userAPI.getAllUsers();
      const hasUsers = response.data && response.data.users.length > 0;
      setSetupRequired(!hasUsers);
    } catch (error) {
      console.error('Error checking setup:', error);
      setSetupRequired(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background-color)'
      }}>
        <div className="text-center">
          <div style={{
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            width: '3rem',
            height: '3rem',
            border: '3px solid transparent',
            borderTop: '3px solid var(--primary-color)',
            margin: '0 auto 1rem auto'
          }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {setupRequired && (
        <Route path="*" element={<KabisilyaFirstRunSetup />} />
      )}

      {!setupRequired && (
        <>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard */}
            <Route path="dashboard" element={<KabisilyaDashboardPage />} />

            {/* Bukid & Pitak */}
            <Route path="farms/bukid" element={<BukidTablePage/>} />
            <Route path="farms/pitak" element={<PitakTablePage/>} />
            <Route path="farms/assignments" element={<Placeholder title="Assignments" />} />

            {/* Kabisilya & Workers */}
            <Route path="workers/kabisilya" element={<Placeholder title="Mga Kabisilya" />} />
            <Route path="workers/list" element={<Placeholder title="Worker Directory" />} />
            <Route path="workers/attendance" element={<Placeholder title="Attendance" />} />

            {/* Payroll & Finance */}
            <Route path="finance/payments" element={<Placeholder title="Payments" />} />
            <Route path="finance/debts" element={<Placeholder title="Debt Management" />} />
            <Route path="finance/history" element={<Placeholder title="Payment History" />} />

            {/* Reports & Analytics */}
            <Route path="analytics/bukid" element={<Placeholder title="Bukid Reports" />} />
            <Route path="analytics/pitak" element={<Placeholder title="Pitak Productivity" />} />
            <Route path="analytics/finance" element={<Placeholder title="Financial Reports" />} />
            <Route path="analytics/workers" element={<Placeholder title="Worker Performance" />} />

            {/* System */}
            <Route path="system/users" element={<Placeholder title="User Management" />} />
            <Route path="system/audit" element={<Placeholder title="Audit Trail" />} />
            <Route path="system/notifications" element={<Placeholder title="Notifications" />} />
            <Route path="system/backup" element={<Placeholder title="Backup & Restore" />} />

            {/* Default redirect */}
            <Route path="/" element={
              setupRequired ? <Navigate to="/setup" replace /> : <Navigate to="/login" replace />
            } />

            {/* 404 */}
            <Route path="*" element={<PageNotFound />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
}

export default App;