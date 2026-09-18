import { connectDB } from '../../../lib/db';
import Hive from '../../../models/Hive';
import '../../../models/Beekeeper';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    const hives = await Hive.find().populate('beekeeper').sort({ createdAt: -1 });
    return res.status(200).json(hives);
  }

  if (req.method === 'POST') {
    try {
      const hive = await Hive.create(req.body);
      return res.status(201).json(hive);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
