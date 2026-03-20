import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SubmitComplaint = () => {
  const [type, setType] = useState('Harassment');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address) return setError('Please enter an address');
    if (!phoneNumber) return setError('Please enter a phone number');
    if (!/^\d{10}$/.test(phoneNumber)) return setError('Please enter a valid 10-digit phone number');
    
    setLoading(true);
    const formData = new FormData();
    formData.append('type', type);
    formData.append('description', description);
    formData.append('address', address);
    if (phoneNumber) formData.append('phoneNumber', phoneNumber);
    
    for (let i = 0; i < files.length; i++) {
       formData.append('evidence', files[i]);
    }

    try {
       await api.post('/complaints', formData, {
         headers: { 'Content-Type': 'multipart/form-data' }
       });
       navigate('/user-dashboard');
    } catch(err) {
       setError(err.response?.data?.message || 'Error submitting complaint');
    } finally {
       setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Submit a Complaint</h2>
      {error && <div style={{ color: 'var(--highlight-red)', marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label className="form-label">Complaint Type</label>
          <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
             <option value="Harassment">Harassment</option>
             <option value="Theft">Theft</option>
             <option value="Accident">Accident</option>
             <option value="Online Fraud">Online Fraud</option>
             <option value="Office Harassment">Office Harassment</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea 
            className="form-control" 
            rows="5" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
          ></textarea>
        </div>
        
        <div className="form-group">
          <label className="form-label">Incident Address</label>
          <input 
            type="text" 
            className="form-control" 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            placeholder="e.g. 2nd Vellalar Street, Kodambakkam"
            required 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input 
            type="tel" 
            className="form-control" 
            value={phoneNumber} 
            onChange={(e) => setPhoneNumber(e.target.value)} 
            placeholder="e.g. 9876543210"
            pattern="[0-9]{10}"
            title="Please enter a valid 10-digit phone number"
            required
          />
        </div>

        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="form-label">Upload Evidence (Images/Videos)</label>
          <input type="file" multiple className="form-control" onChange={handleFileChange} accept="image/*,video/*" />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
           {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
};
export default SubmitComplaint;
