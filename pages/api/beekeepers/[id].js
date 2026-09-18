import { connectDB } from '../../../lib/db';
import Beekeeper from '../../../models/Beekeeper';

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === 'GET') {
    const beekeeper = await Beekeeper.findById(id);
    if (!beekeeper) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(beekeeper);
  }

  if (req.method === 'PUT') {
    const beekeeper = await Beekeeper.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json(beekeeper);
  }

  if (req.method === 'DELETE') {
    await Beekeeper.findByIdAndDelete(id);
    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
