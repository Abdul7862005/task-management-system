import { useState, useEffect, useMemo } from 'react';
import { getTasks, updateTask, deleteTask } from '../services/taskService';
import MainLayout from '../layouts/MainLayout';
import DayTasksModal from '../components/DayTasksModal';
import { getMonthMatrix, getOccurrencesForMonth } from '../utils/calendarHelpers';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function Calendar() {
  const today = new Date();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchTasks = async () => {
    try {
      const data = await getTasks({ limit: 200 });
      setTasks(data.tasks);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const weeks = useMemo(() => getMonthMatrix(viewYear, viewMonth), [viewYear, viewMonth]);

  const occurrences = useMemo(
    () => getOccurrencesForMonth(tasks, viewYear, viewMonth),
    [tasks, viewYear, viewMonth]
  );

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const isToday = (date) =>
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const dateKey = (date) => date.toISOString().split('T')[0];

  const getPillClass = (task) => {
    if (task.status === 'Completed') return 'day-pill gray';
    if (task.priority === 'High') return 'day-pill red';
    if (task.priority === 'Medium') return 'day-pill yellow';
    return 'day-pill green';
  };

  const handleUpdateTask = async (id, formData) => {
    await updateTask(id, formData);
    await fetchTasks();
  };

  const handleDeleteTask = async (id) => {
    const confirmed = window.confirm('Delete this task?');
    if (!confirmed) return;
    await deleteTask(id);
    await fetchTasks();
  };

  const handleCompleteTask = async (id) => {
    await updateTask(id, { status: 'Completed' });
    await fetchTasks();
  };

  const selectedTasks = selectedDate ? occurrences[dateKey(selectedDate)] || [] : [];

  return (
    <MainLayout>
      <div className="dashboard-header">
        <h2>Calendar</h2>
        <p>All your tasks, mapped to their dates.</p>
      </div>

      <div className="calendar-toolbar">
        <div className="calendar-nav">
          <button className="btn-icon" onClick={goToPrevMonth}>
            <ChevronLeft size={16} />
          </button>
          <span className="calendar-month-label">{monthLabel}</span>
          <button className="btn-icon" onClick={goToNextMonth}>
            <ChevronRight size={16} />
          </button>
        </div>
        <button className="btn-secondary" onClick={goToToday}>
          Today
        </button>
      </div>

      {loading && <p className="loading-text">Loading calendar...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          <div className="calendar-grid">
            {WEEKDAY_LABELS.map((day) => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}

            {weeks.map((week, wIndex) =>
              week.map((date, dIndex) => {
                if (!date) {
                  return <div key={`${wIndex}-${dIndex}`} className="calendar-cell empty" />;
                }

                const dayTasks = occurrences[dateKey(date)] || [];
                const visibleTasks = dayTasks.slice(0, 3);
                const extraCount = dayTasks.length - visibleTasks.length;

                return (
                  <div
                    key={`${wIndex}-${dIndex}`}
                    className={isToday(date) ? 'calendar-cell today' : 'calendar-cell'}
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className="calendar-date-number">{date.getDate()}</span>
                    <div className="calendar-day-pills">
                      {visibleTasks.map((task) => (
                        <span key={task._id + dateKey(date)} className={getPillClass(task)}>
                          {task.title}
                        </span>
                      ))}
                      {extraCount > 0 && <span className="day-pill more">+{extraCount} more</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="calendar-legend">
            <span><i className="legend-dot red" /> High priority</span>
            <span><i className="legend-dot yellow" /> Medium priority</span>
            <span><i className="legend-dot green" /> Low priority</span>
            <span><i className="legend-dot gray" /> Completed</span>
          </div>
        </>
      )}

      {selectedDate && (
        <DayTasksModal
          date={selectedDate}
          tasks={selectedTasks}
          onClose={() => setSelectedDate(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onCompleteTask={handleCompleteTask}
        />
      )}
    </MainLayout>
  );
}

export default Calendar;