import { connectDB } from '../../../lib/db';
import Batch from '../../../models/Batch';
import { getBatchFromChain } from '../../../lib/blockchain';

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === 'GET') {
    const batch = await Batch.findOne({ batchId: id }).populate({
      path: 'hive',
      populate: { path: 'beekeeper' },
    });
    if (!batch) return res.status(404).json({ error: 'Batch not found' });

    const onChain = await getBatchFromChain(batch.batchId);
    const hashMatch = onChain ? onChain.dataHash === batch.dataHash : false;

    return res.status(200).json({ batch, onChain, hashMatch });
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
