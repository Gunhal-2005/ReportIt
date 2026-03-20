import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to={user ? (user.role === 'admin' ? '/admin-dashboard' : (user.role === 'police' || user.role === 'station_head') ? '/police-dashboard' : '/user-dashboard') : '/'} className="navbar-brand">
          <Shield color="var(--highlight-red)" size={28} />
          ReportIt
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              {user.role === 'user' && (
                <>
                  <Link to="/user-dashboard" className="nav-link">My Complaints</Link>
                  <Link to="/submit-complaint" className="nav-link">Submit Complaint</Link>
                </>
              )}
              {(user.role === 'police' || user.role === 'station_head') && (
                <Link to="/police-dashboard" className="nav-link">Station Dashboard</Link>
              )}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin-dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/admin-complaints" className="nav-link">All Complaints</Link>
                  <Link to="/admin-stations" className="nav-link">Stations</Link>
                  <Link to="/admin-police" className="nav-link">Police Members</Link>
                  <Link to="/admin-users" className="nav-link">Users</Link>
                </>
              )}
              <button onClick={handleLogout} className="btn btn-secondary" style={{ marginLeft: '1rem' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
