import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConstraintProvider } from './context/ConstraintContext';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <ConstraintProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConstraintProvider>
  );
}

export default App;
