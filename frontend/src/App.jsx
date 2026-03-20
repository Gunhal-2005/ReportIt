import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SubmitComplaint from './pages/SubmitComplaint';
import ComplaintHistory from './pages/ComplaintHistory';
import ComplaintDetails from './pages/ComplaintDetails';
import DashboardPolice from './pages/DashboardPolice';
import DashboardAdmin from './pages/DashboardAdmin';
import AdminStations from './pages/AdminStations';
import AdminPolice from './pages/AdminPolice';
import AdminUsers from './pages/AdminUsers';
import AdminComplaints from './pages/AdminComplaints';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="main-content container">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            <Route path="/user-dashboard" element={<ProtectedRoute roles={['user']}><ComplaintHistory /></ProtectedRoute>} />
            <Route path="/submit-complaint" element={<ProtectedRoute roles={['user']}><SubmitComplaint /></ProtectedRoute>} />
            <Route path="/complaint/:id" element={<ProtectedRoute roles={['user', 'police', 'station_head', 'admin']}><ComplaintDetails /></ProtectedRoute>} />
            
            <Route path="/police-dashboard" element={<ProtectedRoute roles={['police', 'station_head']}><DashboardPolice /></ProtectedRoute>} />

            <Route path="/admin-dashboard" element={<ProtectedRoute roles={['admin']}><DashboardAdmin /></ProtectedRoute>} />
            <Route path="/admin-complaints" element={<ProtectedRoute roles={['admin']}><AdminComplaints /></ProtectedRoute>} />
            <Route path="/admin-stations" element={<ProtectedRoute roles={['admin']}><AdminStations /></ProtectedRoute>} />
            <Route path="/admin-police" element={<ProtectedRoute roles={['admin']}><AdminPolice /></ProtectedRoute>} />
            <Route path="/admin-users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
