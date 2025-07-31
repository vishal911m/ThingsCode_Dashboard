import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  machineName: String,
  machineType: String,
  jobList: [
    {
      jobName: { type: String },
      uid: { type: String }
    }
  ]  // Example: [{ "Job 1": "121212" }]
}, { timestamps: true });

const MachineDetails = mongoose.model('MachineDetails', machineSchema);
export default MachineDetails;
