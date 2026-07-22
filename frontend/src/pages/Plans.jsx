import { useState, useEffect } from 'react';
import { getTasks } from '../services/taskService';
import MainLayout from '../layouts/MainLayout';
import { formatTime } from '../utils/dateHelpers';
import { Sun, CalendarDays, CalendarRange, CalendarClock, Flame, ListChecks, Repeat } from 'lucide-react';

const TABS = [
  { key: 'Daily', label: 'Daily', icon: Sun },
  { key: 'Weekly', label: 'Weekly', icon: CalendarDays },
  { key: 'Monthly', label: 'Monthly', icon: CalendarRange },
  { key: 'OneTime', label: 'One-Time', icon: CalendarClock },
];

function Plans() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Daily');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasks({ limit: 100 });
        setTasks(data.tasks);
      } catch (err) {
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const getBucket = (type) => tasks.filter((t) => t.planType === type);

  const bucketMap = {
    Daily: getBucket('Daily'),
    Weekly: getBucket('Weekly'),
    Monthly: getBucket('Monthly'),
    OneTime: getBucket('OneTime'),
  };

  const filteredTasks = bucketMap[activeTab];

  const overdueInBucket = filteredTasks.filter(
    (t) => t.status !== 'Completed' && (t.planType === 'Monthly' || t.planType === 'OneTime') && new Date(t.dueDate) < new Date()
  ).length;

  const emptyMessages = {
    Daily: 'No daily tasks yet. Add one from the Tasks page.',
    Weekly: 'No weekly tasks yet.',
    Monthly: 'No monthly tasks yet.',
    OneTime: 'No one-time tasks yet.',
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

  return (
    <MainLayout>
      <div className="dashboard-header">
        <h2>Plans</h2>
        <p>Your tasks, organized by plan type.</p>
      </div>

      <div className="plan-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={activeTab === tab.key ? 'plan-tab active' : 'plan-tab'}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon size={16} />
              {tab.label}
              <span
                style={{
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : 'var(--gray-100)',
                  color: activeTab === tab.key ? 'white' : 'var(--gray-600)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '12px',
                }}
              >
                {bucketMap[tab.key].length}
              </span>
            </button>
          );
        })}
      </div>

      {!loading && !error && (activeTab === 'Monthly' || activeTab === 'OneTime') && (
        <div className="plan-summary">
          <div className="plan-summary-item">
            <div className="plan-summary-icon" style={{ background: '#eef2ff', color: 'var(--primary)' }}>
              <ListChecks size={18} />
            </div>
            <div>
              <div className="plan-summary-count">{filteredTasks.length}</div>
              <div className="plan-summary-label">Tasks</div>
            </div>
          </div>

          <div className="plan-summary-item">
            <div className="plan-summary-icon" style={{ background: '#fef2f2', color: 'var(--danger)' }}>
              <Flame size={18} />
            </div>
            <div>
              <div className="plan-summary-count">{overdueInBucket}</div>
              <div className="plan-summary-label">Overdue</div>
            </div>
          </div>
        </div>
      )}

      {loading && <p className="loading-text">Loading plans...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="tasks-list">
          {filteredTasks.length === 0 ? (
            <p className="empty-text">{emptyMessages[activeTab]}</p>
          ) : (
            filteredTasks.map((task) => {
              const isOverdue =
                task.status !== 'Completed' &&
                (task.planType === 'Monthly' || task.planType === 'OneTime') &&
                new Date(task.dueDate) < new Date();

              return (
                <div key={task._id} className="task-card">
                  <div className="task-card-header">
                    <h3>{task.title}</h3>
                    <span className={`badge badge-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </div>

                  {task.description && <p className="task-description">{task.description}</p>}

                  <div className="task-card-footer">
                    <span
                      className={`badge badge-status-${task.status.replace(' ', '').toLowerCase()}`}
                    >
                      {task.status}
                    </span>

                    {task.planType === 'Weekly' ? (
                      <span className="recurrence-badge">
                        <Repeat size={13} />
                        {task.recurrence === 'Biweekly' ? 'Every 2 weeks' : 'Every week'} on{' '}
                        {task.dayOfWeek}
                        {task.time && ` at ${formatTime(task.time)}`}
                      </span>
                    ) : task.planType === 'Monthly' || task.planType === 'OneTime' ? (
                      <span className={isOverdue ? 'task-due overdue' : 'task-due'}>
                        {formatDate(task.dueDate)}
                        {task.time && ` at ${formatTime(task.time)}`}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </MainLayout>
  );
}

export default Plans;