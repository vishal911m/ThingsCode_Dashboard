import express from 'express';
import { registerUser, loginUser, getUser, userLoginStatus, logoutUser } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get("/user", protect, getUser);
router.get("/logout", logoutUser);

// login status
router.get("/login-status", userLoginStatus);
export default router;
