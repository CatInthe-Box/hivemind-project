import mongoose from 'mongoose';

const BeekeeperSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    village: String,
    district: String,
    state: String,
    contact: String,
    walletAddress: String,
  },
  { timestamps: true }
);

export default mongoose.models.Beekeeper || mongoose.model('Beekeeper', BeekeeperSchema);
