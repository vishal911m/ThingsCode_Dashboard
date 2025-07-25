import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  machineName: String,
  machineType: String,
  status: { type: String, enum: ['on', 'off'], default: 'on' },
  job: String,
  jobList: [{ type: Map, of: String }]
}, { timestamps: true });

const MachineDetails = mongoose.model('MachineDetails', machineSchema);
export default MachineDetails;
