import Job from '../models/Job.js';
import MachineDetails from '../models/MachineDetails.js';
import asyncHandler from 'express-async-handler';

export const createJob = asyncHandler(async (req, res) => {
  const { title, description, rfid, machineDetails } = req.body;
  const job = new Job({
    title,
    description,
    status: 'on',
    user: req.user._id,
    rfid,
    machineDetails,
    jobCount: 1
  });
  await job.save();
  res.status(201).json(job);
});

export const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ user: req.user._id });
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

  const { title, description, status, rfid, machineDetails } = req.body;

  job.title = title || job.title;
  job.description = description || job.description;
  job.status = status || job.status;
  job.rfid = rfid || job.rfid;
  job.machineDetails = machineDetails || job.machineDetails;

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