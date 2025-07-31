import MachineDetails from '../models/MachineDetails.js';
import asyncHandler from 'express-async-handler';

export const createMachine = asyncHandler(async (req, res) => {
  const { machineName, machineType, jobList } = req.body;
  // console.log("Received jobList:", jobList);

  const machine = new MachineDetails({
    machineName,
    machineType,
    user: req.user._id,
    jobList
  });

  await machine.save();
  res.status(201).json(machine);
});

export const updateMachine = asyncHandler(async (req, res) => {
  const machineId = req.params.id;
  const { machineName, machineType, jobList } = req.body;

  const machine = await MachineDetails.findOne({
    _id: machineId,
    user: req.user._id,
  });

  if (!machine) {
    res.status(404);
    throw new Error("Machine not found");
  }

  machine.machineName = machineName || machine.machineName;
  machine.machineType = machineType || machine.machineType;
  machine.jobList = jobList || machine.jobList;

  const updatedMachine = await machine.save();
  res.status(200).json(updatedMachine);
});


export const getMachines = asyncHandler(async (req, res) => {
  const machines = await MachineDetails.find({ user: req.user._id });
  res.status(200).json(machines);
});
