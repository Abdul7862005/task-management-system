import { useState, useEffect } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function TaskForm({ initialData, onSubmit, onCancel }) {
  const getToday = () => new Date().toISOString().split('T')[0];

  const initialMode = initialData
    ? initialData.planType === 'OneTime'
      ? 'NonRepetitive'
      : 'Repetitive'
    : 'Repetitive';

  const [taskMode, setTaskMode] = useState(initialMode);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'Medium',
    status: initialData?.status || 'Pending',
    planType: initialData?.planType && initialData.planType !== 'OneTime' ? initialData.planType : 'Daily',
    dayOfWeek: initialData?.dayOfWeek || 'Monday',
    time: initialData?.time || '',
    recurrence: initialData?.recurrence || 'Weekly',
    dueDate: initialData?.dueDate ? initialData.dueDate.split('T')[0] : getToday(),
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (taskMode === 'Repetitive' && formData.planType !== 'Monthly') {
      setFormData((prev) => ({ ...prev, dueDate: getToday() }));
    }
  }, [taskMode, formData.planType]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleModeChange = (mode) => {
    setTaskMode(mode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title) {
      setError('Title is required');
      return;
    }

    if (taskMode === 'NonRepetitive' && !formData.dueDate) {
      setError('Please pick a due date');
      return;
    }

    if (taskMode === 'Repetitive' && formData.planType === 'Monthly' && !formData.dueDate) {
      setError('Due date is required');
      return;
    }

    if (taskMode === 'Repetitive' && formData.planType === 'Weekly' && !formData.time) {
      setError('Please pick a time');
      return;
    }

    setSaving(true);

    const payload = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate,
      planType: taskMode === 'NonRepetitive' ? 'OneTime' : formData.planType,
    };

    if (taskMode === 'Repetitive' && formData.planType === 'Weekly') {
      payload.dayOfWeek = formData.dayOfWeek;
      payload.time = formData.time;
      payload.recurrence = formData.recurrence;
    }

    if (taskMode === 'NonRepetitive' && formData.time) {
      payload.time = formData.time;
    }

    try {
      await onSubmit(payload);
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
          <div className="mode-toggle">
            <button
              type="button"
              className={taskMode === 'Repetitive' ? 'mode-btn active' : 'mode-btn'}
              onClick={() => handleModeChange('Repetitive')}
            >
              Repetitive
            </button>
            <button
              type="button"
              className={taskMode === 'NonRepetitive' ? 'mode-btn active' : 'mode-btn'}
              onClick={() => handleModeChange('NonRepetitive')}
            >
              Non-repetitive
            </button>
          </div>
        </div>

        {taskMode === 'Repetitive' && (
          <>
            <div className="form-group">
              <label>Repeats</label>
              <select name="planType" value={formData.planType} onChange={handleChange}>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            {formData.planType === 'Weekly' && (
              <div className="weekly-fields">
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

                <div className="form-group">
                  <label>Frequency</label>
                  <select name="recurrence" value={formData.recurrence} onChange={handleChange}>
                    <option value="Weekly">Every week</option>
                    <option value="Biweekly">Every 2 weeks (Biweekly)</option>
                  </select>
                </div>
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
          </>
        )}

        {taskMode === 'NonRepetitive' && (
          <div className="form-row">
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Time (optional)</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
              />
            </div>
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