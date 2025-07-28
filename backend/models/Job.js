import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, enum: ['on', 'off'], default: 'on' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  machineId: { type: mongoose.Schema.Types.ObjectId, ref: 'MachineDetails' },
  rfid: String,
  jobCount: { type: Number, default: 1 },
  rejectionCount: { type: Number, default: 0 }
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);
export default Job;
