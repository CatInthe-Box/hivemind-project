import { connectDB } from '../../../lib/db';
import Beekeeper from '../../../models/Beekeeper';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    const beekeepers = await Beekeeper.find().sort({ createdAt: -1 });
    return res.status(200).json(beekeepers);
  }

  if (req.method === 'POST') {
    try {
      const beekeeper = await Beekeeper.create(req.body);
      return res.status(201).json(beekeeper);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
