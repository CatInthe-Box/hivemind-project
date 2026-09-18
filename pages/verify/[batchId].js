export async function getServerSideProps({ params }) {
  const { connectDB } = await import('../../lib/db');
  const { default: Batch } = await import('../../models/Batch');
  await import('../../models/Hive');
  await import('../../models/Beekeeper');
  const { getBatchFromChain } = await import('../../lib/blockchain');

  await connectDB();
  const batch = await Batch.findOne({ batchId: params.batchId })
    .populate({ path: 'hive', populate: { path: 'beekeeper' } })
    .lean();

  if (!batch) {
    return { notFound: true };
  }

  const onChain = await getBatchFromChain(batch.batchId);
  const hashMatch = onChain ? onChain.dataHash === batch.dataHash : false;

  return {
    props: {
      batch: JSON.parse(JSON.stringify(batch)),
      onChain,
      hashMatch,
    },
  };
}

export default function VerifyPage({ batch, onChain, hashMatch }) {
  return (
    <div className="verify-container">
      <div className="verify-card">
        <h1>🍯 Honey Chain Verification</h1>
        <h2>{batch.batchId}</h2>

        {hashMatch ? (
          <div className="badge-verified">✅ Verified on Blockchain</div>
        ) : (
          <div className="badge-pending">⏳ Not yet confirmed on-chain</div>
        )}

        <table>
          <tbody>
            <tr>
              <td>Beekeeper</td>
              <td>{batch.hive?.beekeeper?.name || '—'}</td>
            </tr>
            <tr>
              <td>Village</td>
              <td>{batch.hive?.beekeeper?.village || '—'}</td>
            </tr>
            <tr>
              <td>Hive</td>
              <td>{batch.hive?.hiveCode || '—'}</td>
            </tr>
            <tr>
              <td>Harvest Date</td>
              <td>{new Date(batch.harvestDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td>Quantity</td>
              <td>{batch.quantityKg} kg</td>
            </tr>
            <tr>
              <td>Quality Grade</td>
              <td>{batch.qualityGrade}</td>
            </tr>
            <tr>
              <td>Moisture</td>
              <td>{batch.moisturePercent}%</td>
            </tr>
          </tbody>
        </table>

        {onChain && (
          <div className="chain-details">
            <h3>Blockchain Record</h3>
            <p>Network: {batch.blockchainNetwork || 'Polygon Amoy Testnet'}</p>
            <p>Registered: {new Date(onChain.timestamp * 1000).toLocaleString()}</p>
            <p>Registered by: {onChain.registeredBy}</p>
            {batch.blockchainTxHash && (
              <a href={`https://amoy.polygonscan.com/tx/${batch.blockchainTxHash}`} target="_blank" rel="noreferrer">
                View transaction on Polygonscan →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
