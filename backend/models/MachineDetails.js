import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  machineName: String,
  machineType: String,
  jobList: [{ type: Map, of: String }]  // Example: [{ "Job 1": "121212" }]
}, { timestamps: true });

const MachineDetails = mongoose.model('MachineDetails', machineSchema);
export default MachineDetails;
