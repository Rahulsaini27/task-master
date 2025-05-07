// routes/taskRoutes.js
const express = require('express');
const { createTask, getTasks, getTaskById, updateTask, deleteTask, updateTaskStatus } = require('../controllers/taskController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.post('/create', createTask); 
router.get('/get-all', getTasks);   
router.get('/get/:id', getTaskById); 
router.put('/update/:id', updateTask);
router.patch('/upt-status/:taskId', updateTaskStatus);
router.delete('/delete/:id', deleteTask);


module.exports = router;
