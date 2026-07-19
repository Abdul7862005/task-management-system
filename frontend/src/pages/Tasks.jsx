import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import MainLayout from '../layouts/MainLayout';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
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

  const handleCreateClick = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingTask) {
      await updateTask(editingTask._id, formData);
    } else {
      await createTask(formData);
    }
    setShowForm(false);
    setEditingTask(null);
    fetchTasks();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this task?');
    if (!confirmed) return;

    try {
      await deleteTask(id);
      fetchTasks();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  return (
    <MainLayout>
      <div className="tasks-header">
        <h2>My Tasks</h2>
        {!showForm && (
          <button className="btn btn-add" onClick={handleCreateClick}>
            + New Task
          </button>
        )}
      </div>

      {showForm && (
        <TaskForm
          initialData={editingTask}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      )}

      {loading && <p className="loading-text">Loading tasks...</p>}

      {error && <p className="error-text">{error}</p>}

      {!loading && !error && tasks.length === 0 && !showForm && (
        <p className="empty-text">No tasks yet. Create your first task to get started.</p>
      )}

      <div className="tasks-list">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </MainLayout>
  );
}

export default Tasks;