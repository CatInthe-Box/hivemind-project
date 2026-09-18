import mongoose from 'mongoose';

const BatchSchema = new mongoose.Schema(
  {
    batchId: { type: String, required: true, unique: true },
    hive: { type: mongoose.Schema.Types.ObjectId, ref: 'Hive', required: true },
    harvestDate: { type: Date, required: true },
    quantityKg: Number,
    qualityGrade: String,
    moisturePercent: Number,
    diseaseRiskScore: Number, // 0-100, rule-based estimate from IoT readings
    dataHash: String, // keccak256 hash stored both here and on-chain
    blockchainTxHash: String,
    blockchainNetwork: String,
    status: { type: String, default: 'Saved (blockchain not configured)' },
  },
  { timestamps: true }
);

export default mongoose.models.Batch || mongoose.model('Batch', BatchSchema);
