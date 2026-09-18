import { connectDB } from '../../../lib/db';
import Batch from '../../../models/Batch';
import Hive from '../../../models/Hive';
import '../../../models/Beekeeper';
import { computeDataHash, registerBatchOnChain } from '../../../lib/blockchain';

// Simple rule-based risk score from the hive's most recent IoT reading.
// Swap this out for a real trained model later — the interface (a hive
// object in, a 0-100 number out) stays the same.
function estimateDiseaseRisk(hive) {
  const readings = hive?.sensorReadings || [];
  if (readings.length === 0) return 10;
  const last = readings[readings.length - 1];
  let risk = 10;
  if (last.temperature != null && (last.temperature > 36 || last.temperature < 30)) risk += 30;
  if (last.humidity != null && (last.humidity > 70 || last.humidity < 40)) risk += 25;
  if (last.weight != null && last.weight < 5) risk += 15;
  return Math.min(risk, 100);
}

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    const batches = await Batch.find()
      .populate({ path: 'hive', populate: { path: 'beekeeper' } })
      .sort({ createdAt: -1 });
    return res.status(200).json(batches);
  }

  if (req.method === 'POST') {
    try {
      const { hiveId, harvestDate, quantityKg, qualityGrade, moisturePercent } = req.body;
      const hive = await Hive.findById(hiveId);
      if (!hive) return res.status(400).json({ error: 'Hive not found' });

      const batchId = `HC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const diseaseRiskScore = estimateDiseaseRisk(hive);

      const payload = { batchId, hiveId, harvestDate, quantityKg, qualityGrade, moisturePercent };
      const dataHash = computeDataHash(payload);

      let blockchainTxHash = null;
      let blockchainNetwork = null;
      let status = 'Saved (blockchain not configured)';

      try {
        const chainResult = await registerBatchOnChain(batchId, dataHash);
        blockchainTxHash = chainResult.txHash;
        blockchainNetwork = 'Polygon Amoy Testnet';
        status = 'Verified on blockchain';
      } catch (chainErr) {
        // Blockchain env vars not set yet, or an RPC/gas issue — the batch
        // still saves so the rest of the app keeps working.
        console.error('Blockchain registration skipped:', chainErr.message);
      }

      const batch = await Batch.create({
        batchId,
        hive: hiveId,
        harvestDate,
        quantityKg,
        qualityGrade,
        moisturePercent,
        diseaseRiskScore,
        dataHash,
        blockchainTxHash,
        blockchainNetwork,
        status,
      });

      return res.status(201).json(batch);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
