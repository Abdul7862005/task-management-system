function TaskCard({ task, onEdit, onDelete }) {
  const isOverdue = task.status !== 'Completed' && new Date(task.dueDate) < new Date();

  const formattedDate = new Date(task.dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="task-card">
      <div className="task-card-header">
        <h3>{task.title}</h3>
        <span className={`badge badge-${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>
      </div>

      {task.description && <p className="task-description">{task.description}</p>}

      <div className="task-card-footer">
        <div className="task-card-footer-left">
          <span className={`badge badge-status-${task.status.replace(' ', '').toLowerCase()}`}>
            {task.status}
          </span>
          <span className={isOverdue ? 'task-due overdue' : 'task-due'}>
            Due: {formattedDate}
          </span>
        </div>

        <div className="task-card-actions">
          <button className="btn-icon" onClick={() => onEdit(task)}>
            Edit
          </button>
          <button className="btn-icon btn-icon-danger" onClick={() => onDelete(task._id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;