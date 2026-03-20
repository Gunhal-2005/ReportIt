import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      const res = await api.put(`/auth/resetpassword/${token}`, { password });
      setMessage(res.data.message);
      setError('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }} className="card">
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Reset Password</h2>
      {error && <div style={{ color: 'var(--highlight-red)', marginBottom: '1rem' }}>{error}</div>}
      {message && <div style={{ color: '#22c55e', marginBottom: '1rem' }}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input 
            type="password" 
            className="form-control" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input 
            type="password" 
            className="form-control" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Reset Password</button>
      </form>
    </div>
  );
};
export default ResetPassword;
