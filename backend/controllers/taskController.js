const Task = require('../models/Task');

const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, planType, dayOfWeek, time, recurrence, dueDate } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ message: 'Title and due date are required' });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      status,
      planType,
      dayOfWeek,
      time,
      recurrence,
      dueDate,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const { status, priority, search, sortBy, page, limit } = req.query;

    const filter = { createdBy: req.user._id };

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    let sortOption = { createdAt: -1 };

    if (sortBy === 'dueDate') {
      sortOption = { dueDate: 1 };
    }

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const totalTasks = await Task.countDocuments(filter);

    const tasks = await Task.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      message: 'Tasks fetched successfully',
      count: tasks.length,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limitNumber),
      currentPage: pageNumber,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const { title, description, priority, status, planType, dayOfWeek, time, recurrence, dueDate } = req.body;

    const isOneTime = task.planType === 'OneTime';
    const willBeCompleted = status === 'Completed';

    if (isOneTime && willBeCompleted) {
      await task.deleteOne();
      return res.status(200).json({
        message: 'One-time task completed and removed',
        deleted: true,
        taskId: req.params.id,
      });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (planType !== undefined) task.planType = planType;
    if (dayOfWeek !== undefined) task.dayOfWeek = dayOfWeek;
    if (time !== undefined) task.time = time;
    if (recurrence !== undefined) task.recurrence = recurrence;
    if (dueDate !== undefined) task.dueDate = dueDate;

    const updatedTask = await task.save();

    res.status(200).json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalTasks = await Task.countDocuments({ createdBy: userId });

    const completedTasks = await Task.countDocuments({
      createdBy: userId,
      status: 'Completed',
    });

    const pendingTasks = await Task.countDocuments({
      createdBy: userId,
      status: 'Pending',
    });

    const inProgressTasks = await Task.countDocuments({
      createdBy: userId,
      status: 'In Progress',
    });

    const overdueTasks = await Task.countDocuments({
      createdBy: userId,
      status: { $ne: 'Completed' },
      planType: { $nin: ['Daily', 'Weekly'] },
      dueDate: { $lt: new Date() },
    });

    const completionPercentage =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    res.status(200).json({
      message: 'Dashboard stats fetched successfully',
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        completionPercentage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    const overdueTasks = await Task.find({
      createdBy: userId,
      status: { $ne: 'Completed' },
      planType: { $nin: ['Daily', 'Weekly'] },
      dueDate: { $lt: now },
    }).sort({ dueDate: 1 });

    const upcomingTasks = await Task.find({
      createdBy: userId,
      status: { $ne: 'Completed' },
      planType: { $nin: ['Daily', 'Weekly'] },
      dueDate: { $gte: now, $lte: threeDaysFromNow },
    }).sort({ dueDate: 1 });

    res.status(200).json({
      message: 'Notifications fetched successfully',
      overdueCount: overdueTasks.length,
      upcomingCount: upcomingTasks.length,
      overdueTasks,
      upcomingTasks,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask, getDashboardStats, getNotifications };