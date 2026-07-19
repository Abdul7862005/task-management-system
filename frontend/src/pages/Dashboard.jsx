import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/taskService';
import MainLayout from '../layouts/MainLayout';
import { ListChecks, CheckCircle2, Clock, Loader, AlertTriangle, TrendingUp } from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data.stats);
      } catch (err) {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <p className="loading-text">Loading dashboard...</p>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <p className="error-text">{error}</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Here's what's happening with your tasks today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon blue">
            <ListChecks size={20} />
          </div>
          <h3>Total Tasks</h3>
          <p>{stats.totalTasks}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon green">
            <CheckCircle2 size={20} />
          </div>
          <h3>Completed</h3>
          <p>{stats.completedTasks}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon blue">
            <Clock size={20} />
          </div>
          <h3>Pending</h3>
          <p>{stats.pendingTasks}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon amber">
            <Loader size={20} />
          </div>
          <h3>In Progress</h3>
          <p>{stats.inProgressTasks}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon red">
            <AlertTriangle size={20} />
          </div>
          <h3>Overdue</h3>
          <p>{stats.overdueTasks}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon green">
            <TrendingUp size={20} />
          </div>
          <h3>Completion</h3>
          <p>{stats.completionPercentage}%</p>
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;