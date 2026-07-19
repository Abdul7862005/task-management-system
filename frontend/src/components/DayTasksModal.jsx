import { useState } from 'react';
import { X, Check, Pencil, Trash2, Clock } from 'lucide-react';
import TaskForm from './TaskForm';
import { formatTime } from '../utils/dateHelpers';

function DayTasksModal({ date, tasks, onClose, onUpdateTask, onDeleteTask, onCompleteTask }) {
  const [editingTask, setEditingTask] = useState(null);

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleEditSubmit = async (formData) => {
    await onUpdateTask(editingTask._id, formData);
    setEditingTask(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{formattedDate}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {editingTask ? (
            <TaskForm
              initialData={editingTask}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingTask(null)}
            />
          ) : tasks.length === 0 ? (
            <p className="empty-text">No tasks on this date.</p>
          ) : (
            <div className="modal-task-list">
              {tasks.map((task) => (
                <div key={task._id} className="modal-task-item">
                  <div className="modal-task-top">
                    <h4>{task.title}</h4>
                    <span className={`badge badge-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </div>

                  <div className="modal-task-meta">
                    <span className={`badge badge-status-${task.status.replace(' ', '').toLowerCase()}`}>
                      {task.status}
                    </span>
                    {task.time && (
                      <span className="modal-task-time">
                        <Clock size={13} /> {formatTime(task.time)}
                      </span>
                    )}
                  </div>

                  <div className="modal-task-actions">
                    {task.status !== 'Completed' && (
                      <button className="btn-icon" onClick={() => onCompleteTask(task._id)}>
                        <Check size={13} /> Complete
                      </button>
                    )}
                    <button className="btn-icon" onClick={() => setEditingTask(task)}>
                      <Pencil size={13} /> Edit
                    </button>
                    <button className="btn-icon btn-icon-danger" onClick={() => onDeleteTask(task._id)}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DayTasksModal;