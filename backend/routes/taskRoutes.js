const express = require('express');
const { createTask, getTasks, updateTask, deleteTask, getDashboardStats, getNotifications } = require('../controllers/taskController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createTask);
router.get('/', protect, getTasks);
router.get('/dashboard/stats', protect, getDashboardStats);
router.get('/notifications', protect, getNotifications);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;