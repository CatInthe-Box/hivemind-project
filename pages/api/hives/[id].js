import { connectDB } from '../../../lib/db';
import Hive from '../../../models/Hive';
import '../../../models/Beekeeper';

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === 'GET') {
    const hive = await Hive.findById(id).populate('beekeeper');
    if (!hive) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(hive);
  }

  if (req.method === 'PUT') {
    // Pass { pushSensorReading: { temperature, humidity, weight } } to log
    // a new IoT reading instead of overwriting the hive document.
    if (req.body.pushSensorReading) {
      const hive = await Hive.findByIdAndUpdate(
        id,
        { $push: { sensorReadings: req.body.pushSensorReading } },
        { new: true }
      );
      return res.status(200).json(hive);
    }
    const hive = await Hive.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json(hive);
  }

  if (req.method === 'DELETE') {
    await Hive.findByIdAndDelete(id);
    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
