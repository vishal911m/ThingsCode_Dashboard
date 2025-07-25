import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, enum: ['on', 'off'], default: 'on' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  machineDetails: String,
  rfid: String,
  jobCount: Number
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);
export default Job;
