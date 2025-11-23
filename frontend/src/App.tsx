import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Scans from './pages/Scans';
import Vulnerabilities from './pages/Vulnerabilities';
import Compliance from './pages/Compliance';
import Reports from './pages/Reports';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="scans" element={<Scans />} />
          <Route path="vulnerabilities" element={<Vulnerabilities />} />
          <Route path="compliance" element={<Compliance />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
