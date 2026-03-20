import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import api from '../services/api';
import { Link } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardAdmin = () => {
  const [data, setData] = useState({ total: 0, pending: 0, solved: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState('All');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/analytics?year=${year}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [year]);

  if (loading) return <div>Loading...</div>;

  const chartData = {
    labels: ['Pending / In Progress', 'Resolved', 'Cancelled'],
    datasets: [
      {
        data: [data.pending, data.solved, data.cancelled || 0],
        backgroundColor: ['#eab308', '#22c55e', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const currentYear = new Date().getFullYear();
  const years = ['All', currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
         <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
         
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filter by Year:</label>
            <select className="form-control" style={{ padding: '0.25rem 0.5rem', width: 'auto' }} value={year} onChange={(e) => setYear(e.target.value)}>
               {years.map(y => <option key={y} value={y}>{y === 'All' ? 'All Time' : y}</option>)}
            </select>
         </div>
      </div>
      
      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: 'var(--highlight-red)' }}>{data.total}</h3>
          <p>Total Complaints</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: '#eab308' }}>{data.pending}</h3>
          <p>Pending / Active</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: '#22c55e' }}>{data.solved}</h3>
          <p>Resolved</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: '#ef4444' }}>{data.cancelled || 0}</h3>
          <p>Cancelled</p>
        </div>
      </div>
      
      {data.total > 0 && (
         <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>{year === 'All' ? 'All-Time Analytics' : `${year} Analytics`}</h3>
            <Pie data={chartData} />
         </div>
      )}

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
         <Link to="/admin-stations" className="btn btn-secondary">Manage Stations</Link>
         <Link to="/admin-police" className="btn btn-secondary">Manage Police</Link>
         <Link to="/admin-users" className="btn btn-secondary">Manage Users</Link>
      </div>
    </div>
  );
};

export default DashboardAdmin;
