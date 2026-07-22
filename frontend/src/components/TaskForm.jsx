import { useState, useEffect } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function TaskForm({ initialData, onSubmit, onCancel }) {
  const getToday = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'Medium',
    status: initialData?.status || 'Pending',
    planType: initialData?.planType || 'Daily',
    dayOfWeek: initialData?.dayOfWeek || 'Monday',
    time: initialData?.time || '',
    recurrence: initialData?.recurrence || 'Weekly',
    dueDate: initialData?.dueDate ? initialData.dueDate.split('T')[0] : getToday(),
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isOneTimeWeekly = formData.planType === 'Weekly' && formData.recurrence === 'Once';

  useEffect(() => {
    if (formData.planType === 'Daily') {
      setFormData((prev) => ({ ...prev, dueDate: getToday() }));
    }
    if (formData.planType === 'Weekly' && formData.recurrence !== 'Once') {
      setFormData((prev) => ({ ...prev, dueDate: getToday() }));
    }
  }, [formData.planType, formData.recurrence]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title) {
      setError('Title is required');
      return;
    }

    if (formData.planType === 'Monthly' && !formData.dueDate) {
      setError('Due date is required');
      return;
    }

    if (formData.planType === 'Weekly' && !formData.time) {
      setError('Please pick a time');
      return;
    }

    if (isOneTimeWeekly && !formData.dueDate) {
      setError('Please pick a date for this one-time task');
      return;
    }

    setSaving(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="task-form-card">
      <h3>{initialData ? 'Edit Task' : 'New Task'}</h3>

      {error && <p className="error-text">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. LeetCode weekly contest"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Plan Type</label>
          <select name="planType" value={formData.planType} onChange={handleChange}>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>

        {formData.planType === 'Weekly' && (
          <div className="weekly-fields">
            <div className="form-group">
              <label>Repeats</label>
              <select name="recurrence" value={formData.recurrence} onChange={handleChange}>
                <option value="Weekly">Every week</option>
                <option value="Biweekly">Every 2 weeks (Biweekly)</option>
                <option value="Once">Others (one-time task, auto-removes when completed)</option>
              </select>
            </div>

            {isOneTimeWeekly ? (
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                  />
                </div>
              </div>
            ) : (
              <div className="form-row">
                <div className="form-group">
                  <label>Day of Week</label>
                  <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange}>
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {formData.planType === 'Monthly' && (
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Saving...' : 'Save Task'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskForm;