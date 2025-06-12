const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getUsers,
  updateUser,
  deleteUser
} = require('../controllers/authController');

const { authMiddleware } = require('../middlewares/authMiddleware');

// Public routes
router.post('/login', login);
router.post('/register', register);

// Middleware to protect below routes
router.use(authMiddleware);

// Protected routes
// router.post('/register', register);
router.get('/get-all', getUsers);
router.put('/update/:id', updateUser);
router.delete('/delete/:id', deleteUser);

module.exports = router;
