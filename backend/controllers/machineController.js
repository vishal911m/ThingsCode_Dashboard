import MachineDetails from '../models/MachineDetails.js';
import asyncHandler from 'express-async-handler';

export const createMachine = asyncHandler(async (req, res) => {
  const { machineName, machineType, jobList } = req.body;
  const machine = new MachineDetails({
    machineName,
    machineType,
    status: 'on',
    user: req.user._id,
    jobList
  });
  await machine.save();
  res.status(201).json(machine);
});

export const getMachines = asyncHandler(async (req, res) => {
  const machines = await MachineDetails.find({ user: req.user._id });
  res.status(200).json(machines);
});
