import express from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getTodayJobs,
  getJobsByDate,
} from '../controllers/jobController.js';

import {
  createMachine,
  getMachines,
  updateMachine,
} from '../controllers/machineController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// POST: Create new job
router.post('/jobs', createJob);

// GET: Get all jobs for current user
router.get('/jobs', getJobs);

// Get: Get all the jobs by date
router.get('/jobs/by-date', getJobsByDate);


// GET: Get only today's jobs for the user
router.get('/jobs/today', getTodayJobs);

// GET: Get job by ID
router.get('/jobs/:id', getJobById);

// PUT: Update job by ID
router.put('/jobs/:id', updateJob);

// DELETE: Delete job by ID
router.delete('/jobs/:id', deleteJob);

// ✅ Machine Routes
//
router.post('/tasks/machines', createMachine); // POST: Create a machine
router.get('/tasks/machines', getMachines); // GET: Get all machines for user
router.put('/tasks/machines/:id', updateMachine); // ✅ Update a machine by ID


export default router;
