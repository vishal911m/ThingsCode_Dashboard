import moment from 'moment';
import Job from '../models/Job.js';
import asyncHandler from 'express-async-handler';
import { parseISO, startOfDay, endOfDay, startOfMonth, endOfMonth} from 'date-fns';
import { broadcastNewJob } from '../server.js';
import MachineDetails from '../models/MachineDetails.js';

export const createJob = asyncHandler(async (req, res) => {
  const { title, description, rfid, machineId, jobCount, rejectionCount } = req.body;

  const job = new Job({
    title,
    description,
    status: req.body.status === 'off' ? 'off' : 'on',
    user: req.user._id,
    rfid,
    machineId,
    jobCount: typeof jobCount === 'number' ? jobCount : 1,
    rejectionCount: typeof rejectionCount === 'number' ? rejectionCount : 0
  });

  broadcastNewJob(job); // <-- broadcast to WebSocket clients
  await job.save();
  res.status(201).json(job);
});


export const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ user: req.user._id });
  res.status(200).json(jobs);
});

export const getTodayJobs = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todayJobs = await Job.find({
    user: req.user._id,
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });

  res.status(200).json(todayJobs);
});

export const getJobsByDate = asyncHandler(async (req, res) => {
  const { date } = req.query;

  if (!date) {
    res.status(400);
    throw new Error('Date is required');
  }

  // Parse date as local (not UTC)
  const parsedDate = parseISO(date); // This creates local time like "2025-07-29T00:00:00.000+05:30"

  const start = startOfDay(parsedDate); // 00:00 IST
  const end = endOfDay(parsedDate);     // 23:59:59 IST

  const jobs = await Job.find({
    user: req.user._id,
    createdAt: { $gte: start, $lte: end }
  });

  res.status(200).json(jobs);
});

export const getJobsByMonth = asyncHandler(async (req, res) => {
  const { year, month } = req.query;

  if (!year || !month) {
    res.status(400);
    throw new Error('Year and month are required');
  }

  // Convert to integers
  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10); // 1-based (Jan = 1)

  if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    res.status(400);
    throw new Error('Invalid year or month');
  }

  const start = startOfMonth(new Date(yearNum, monthNum - 1)); // JS months are 0-based
  const end = endOfMonth(start);

  const jobs = await Job.find({
    user: req.user._id,
    createdAt: { $gte: start, $lte: end }
  });

  res.status(200).json(jobs);
});

export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, user: req.user._id });
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  res.status(200).json(job);
});

export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, user: req.user._id });
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  const { title, description, status, rfid, machineId } = req.body;

  job.title = title ?? job.title;
  job.description = description ?? job.description;
  job.status = status ?? job.status;
  job.rfid = rfid ?? job.rfid;
  job.machineId = machineId ?? job.machineId;

  const updatedJob = await job.save();
  res.status(200).json(updatedJob);
});

export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, user: req.user._id });
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  await job.remove();
  res.status(200).json({ message: 'Job deleted successfully' });
});

/**
 * Simulate job counts for every machine for each day of 2025.
 * Creates one job per machine per day with random jobCount & rejectionCount.
 *
 * Route: POST /simulate/2025
 */
export const simulateYearlyJobCounts = async (req, res) => {
  try {
    const year = 2025;
    const startDate = moment(`${year}-01-01`);
    const endDate = moment(); // Simulate only up to current date

    const machines = await MachineDetails.find({ user: req.user._id });
    if (!machines?.length) {
      return res.status(400).json({ message: 'No machines found for user.' });
    }

    const jobsToInsert = [];

    for (
      let date = moment(startDate);
      date.isSameOrBefore(endDate);
      date.add(1, 'day')
    ) {
      for (const machine of machines) {
        const jobCount = Math.floor(Math.random() * 50) + 1;
        const rejectionCount = Math.floor(Math.random() * 10);

        jobsToInsert.push({
          title: '',
          description: '',
          status: 'on',
          user: req.user._id,
          machineId: machine._id,
          rfid: machine.jobList?.[0]?.uid ?? 'SIMULATED',
          jobCount,
          rejectionCount,
          createdAt: date.toDate(),
          updatedAt: date.toDate(),
        });
      }
    }

    await Job.insertMany(jobsToInsert);

    res.status(201).json({
      message: 'Simulation complete',
      jobsInserted: jobsToInsert.length,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Simulation failed', error: error.message });
  }
};

/**
 * Simulate multiple jobs per day for every machine from Jan 1st to today,
 * skipping Sundays and limiting to max 20 jobs per hour (across all machines).
 * Route: POST /simulate/multi
 */
export const simulateMultipleJobsPerDay = async (req, res) => {
  try {
    const year = 2025;
    const startDate = moment(`${year}-01-01`);
    const endDate = moment(); // today's date

    const machines = await MachineDetails.find({ user: req.user._id });
    if (!machines?.length) {
      return res.status(400).json({ message: 'No machines found for user.' });
    }

    const jobsToInsert = [];

    for (
      let date = moment(startDate);
      date.isSameOrBefore(endDate);
      date.add(1, 'day')
    ) {
      // ⛔ Skip Sundays
      if (date.day() === 0) continue;

      for (let hour = 0; hour < 24; hour++) {
        const currentHour = moment(date).hour(hour).minute(0).second(0);

        // Random total jobs for this hour (max 20, across all machines)
        let jobsRemaining = Math.floor(Math.random() * 20) + 1;

        for (const machine of machines) {
          if (jobsRemaining <= 0) break;

          // Assign up to 5 jobs per machine until the hourly cap is hit
          const numberOfJobs = Math.min(
            jobsRemaining,
            Math.floor(Math.random() * 4) + 2
          );

          for (let i = 0; i < numberOfJobs; i++) {
            const jobCount = Math.floor(Math.random() * 1) + 1;
            const rejectionCount = Math.floor(Math.random() * 10);

            jobsToInsert.push({
              title: '',
              description: '',
              status: 'on',
              user: req.user._id,
              machineId: machine._id,
              rfid: machine.jobList?.[i % machine.jobList.length]?.uid ?? 'SIMULATED',
              jobCount,
              rejectionCount,
              createdAt: currentHour.toDate(),
              updatedAt: currentHour.toDate(),
            });
          }

          jobsRemaining -= numberOfJobs;
        }
      }
    }

    await Job.insertMany(jobsToInsert);

    res.status(201).json({
      message: 'Multi-job simulation complete',
      jobsInserted: jobsToInsert.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Simulation failed', error: error.message });
  }
};

export const deleteAllJobsForUser = asyncHandler(async (req, res) => {
  const result = await Job.deleteMany({ user: req.user._id });

  res.status(200).json({
    message: 'All jobs deleted for current user.',
    deletedCount: result.deletedCount,
  });
});
