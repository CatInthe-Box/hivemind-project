import mongoose from 'mongoose';

const SensorReadingSchema = new mongoose.Schema(
  {
    temperature: Number, // Celsius
    humidity: Number, // %
    weight: Number, // kg
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const HiveSchema = new mongoose.Schema(
  {
    hiveCode: { type: String, required: true, unique: true },
    beekeeper: { type: mongoose.Schema.Types.ObjectId, ref: 'Beekeeper', required: true },
    location: String,
    colonyStrength: String,
    healthStatus: { type: String, default: 'Healthy' },
    sensorReadings: [SensorReadingSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Hive || mongoose.model('Hive', HiveSchema);
