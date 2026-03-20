import { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Sent': return 'badge-sent';
    case 'Viewed': return 'badge-viewed';
    case 'In Progress': return 'badge-progress';
    case 'Action Taken': return 'badge-action';
    default: return 'badge-sent';
  }
};

const ComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  // Police update state
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [assignedPoliceMemberId, setAssignedPoliceMemberId] = useState('');
  const [members, setMembers] = useState([]);
  const [proofFiles, setProofFiles] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/complaints/${id}`);
        setComplaint(res.data);
        setStatus(res.data.status);
        setRemarks(res.data.remarks || '');
        setAssignedPoliceMemberId(res.data.assignedPoliceMemberId || '');
        
        if (user.role === 'police' || user.role === 'station_head') {
           const memRes = await api.get('/police/members');
           setMembers(memRes.data);
           
           if (res.data.status === 'Sent') {
             await api.put(`/police/complaints/${id}`, { status: 'Viewed' });
             setStatus('Viewed');
             setComplaint(prev => ({...prev, status: 'Viewed'}));
           }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, user.role]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('status', status);
      formData.append('remarks', remarks);
      formData.append('assignedPoliceMemberId', assignedPoliceMemberId);
      for (let i = 0; i < proofFiles.length; i++) {
        formData.append('proofOfAction', proofFiles[i]);
      }
      
      const res = await api.put(`/police/complaints/${id}`, formData);
      setComplaint(res.data);
      alert('Complaint updated successfully');
    } catch(err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!complaint) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Complaint not found or unauthorized</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Complaint Details</h2>
        <span className={`badge ${getStatusBadgeClass(complaint.status)}`} style={{ fontSize: '1rem' }}>{complaint.status}</span>
      </div>

      <div className="card">
        <h3>{complaint.type}</h3>
        <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Reported on: {new Date(complaint.createdAt).toLocaleDateString()}</p>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <strong>Description:</strong>
          <p style={{ marginTop: '0.5rem', background: 'var(--primary-dark)', padding: '1rem', borderRadius: '0.5rem' }}>{complaint.description}</p>
        </div>

        <div className="grid grid-cols-2" style={{ marginBottom: '1.5rem' }}>
           <div>
             <strong>User Info:</strong>
             <p>Name: {complaint.userId.name}</p>
             <p>Email: {complaint.userId.email}</p>
             {complaint.phoneNumber && <p>Phone: {complaint.phoneNumber}</p>}
           </div>
           <div>
             <strong>Station Info:</strong>
             <p>{complaint.policeStationId ? complaint.policeStationId.name : 'Not assigned'}</p>
             <p>{complaint.policeStationId?.address}</p>
           </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <strong>Incident Address:</strong>
          <p style={{ marginTop: '0.5rem', background: 'var(--primary-dark)', padding: '1rem', borderRadius: '0.5rem' }}>
            {complaint.address || 'No address provided'}
          </p>
        </div>

        {complaint.evidence && complaint.evidence.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <strong>Evidence:</strong>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {complaint.evidence.map((ev, i) => {
                 const url = `http://localhost:5000/${ev.replace(/\\/g, '/')}`;
                 const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i);
                 return (
                   <div key={i} style={{ borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border-color)', width: '250px' }}>
                     {isVideo ? (
                       <video src={url} controls style={{ width: '100%', display: 'block' }} />
                     ) : (
                       <a href={url} target="_blank" rel="noreferrer">
                         <img src={url} alt={`Evidence ${i+1}`} style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
                       </a>
                     )}
                   </div>
                 );
              })}
            </div>
          </div>
        )}

        {(complaint.remarks || complaint.proofOfAction?.length > 0) && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--highlight-red)', borderRadius: '0.5rem' }}>
             <h4 style={{ color: 'var(--highlight-red)', marginBottom: '0.5rem' }}>Police Feedback</h4>
             {complaint.remarks && <p><strong>Remarks:</strong> {complaint.remarks}</p>}
             {complaint.proofOfAction && complaint.proofOfAction.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Proof of Action:</strong>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {complaint.proofOfAction.map((proof, i) => {
                       const url = `http://localhost:5000/${proof.replace(/\\/g, '/')}`;
                       const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i);
                       return (
                         <div key={i} style={{ borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--highlight-red)', width: '250px' }}>
                           {isVideo ? (
                             <video src={url} controls style={{ width: '100%', display: 'block' }} />
                           ) : (
                             <a href={url} target="_blank" rel="noreferrer">
                               <img src={url} alt={`Proof ${i+1}`} style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
                             </a>
                           )}
                         </div>
                       );
                    })}
                  </div>
                </div>
             )}
          </div>
        )}
      </div>

      {(user.role === 'police' || user.role === 'station_head') && (
        <form onSubmit={handleUpdate} className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Update Complaint</h3>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
               <option value="Sent">Sent</option>
               <option value="Viewed">Viewed</option>
               <option value="In Progress">In Progress</option>
               <option value="Action Taken">Action Taken</option>
            </select>
          </div>
          {user.role === 'station_head' && (
            <div className="form-group">
              <label className="form-label">Assign Member (Optional)</label>
              <select className="form-control" value={assignedPoliceMemberId} onChange={(e) => setAssignedPoliceMemberId(e.target.value)}>
                 <option value="">-- Select Member --</option>
                 {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Remarks</label>
            <textarea className="form-control" rows="3" value={remarks} onChange={(e) => setRemarks(e.target.value)}></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Upload Proof of Action (Images/Videos)</label>
            <input type="file" multiple className="form-control" onChange={(e) => setProofFiles(e.target.files)} accept="image/*,video/*" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Updates</button>
        </form>
      )}
    </div>
  );
};
export default ComplaintDetails;
