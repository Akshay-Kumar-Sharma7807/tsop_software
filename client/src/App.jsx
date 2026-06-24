import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConstraintProvider } from './context/ConstraintContext';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import TeamPage from './pages/TeamPage';


function App() {
  return (
    <ConstraintProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/admin/teams/:teamId" element={<TeamPage />} />
        </Routes>
      </BrowserRouter>
    </ConstraintProvider>
  );
}

export default App;
