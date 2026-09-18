import { useState, useEffect } from 'react';

const emptyBeekeeper = { name: '', village: '', district: '', state: '', contact: '' };
const emptyHive = { hiveCode: '', beekeeper: '', location: '', colonyStrength: '' };
const emptyBatch = { hiveId: '', harvestDate: '', quantityKg: '', qualityGrade: 'A', moisturePercent: '' };

export default function Home() {
  const [beekeepers, setBeekeepers] = useState([]);
  const [hives, setHives] = useState([]);
  const [batches, setBatches] = useState([]);
  const [beekeeperForm, setBeekeeperForm] = useState(emptyBeekeeper);
  const [hiveForm, setHiveForm] = useState(emptyHive);
  const [batchForm, setBatchForm] = useState(emptyBatch);
  const [loading, setLoading] = useState(false);
  const [siteUrl, setSiteUrl] = useState('');

  useEffect(() => {
    setSiteUrl(window.location.origin);
    refreshAll();
  }, []);

  async function refreshAll() {
    const [b, h, batch] = await Promise.all([
      fetch('/api/beekeepers').then((r) => r.json()),
      fetch('/api/hives').then((r) => r.json()),
      fetch('/api/batches').then((r) => r.json()),
    ]);
    setBeekeepers(b);
    setHives(h);
    setBatches(batch);
  }

  async function submitBeekeeper(e) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/beekeepers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(beekeeperForm),
    });
    setBeekeeperForm(emptyBeekeeper);
    await refreshAll();
    setLoading(false);
  }

  async function submitHive(e) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/hives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hiveForm),
    });
    setHiveForm(emptyHive);
    await refreshAll();
    setLoading(false);
  }

  async function submitBatch(e) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchForm),
    });
    setBatchForm(emptyBatch);
    await refreshAll();
    setLoading(false);
  }

  return (
    <div className="container">
      <header className="header">
        <h1>🍯 Honey Chain</h1>
        <p>Blockchain-verified honey traceability for rural beekeepers</p>
      </header>

      <section className="grid">
        <div className="card">
          <h2>Register Beekeeper</h2>
          <form onSubmit={submitBeekeeper}>
            <input
              placeholder="Name"
              required
              value={beekeeperForm.name}
              onChange={(e) => setBeekeeperForm({ ...beekeeperForm, name: e.target.value })}
            />
            <input
              placeholder="Village"
              value={beekeeperForm.village}
              onChange={(e) => setBeekeeperForm({ ...beekeeperForm, village: e.target.value })}
            />
            <input
              placeholder="District"
              value={beekeeperForm.district}
              onChange={(e) => setBeekeeperForm({ ...beekeeperForm, district: e.target.value })}
            />
            <input
              placeholder="State"
              value={beekeeperForm.state}
              onChange={(e) => setBeekeeperForm({ ...beekeeperForm, state: e.target.value })}
            />
            <input
              placeholder="Contact"
              value={beekeeperForm.contact}
              onChange={(e) => setBeekeeperForm({ ...beekeeperForm, contact: e.target.value })}
            />
            <button type="submit" disabled={loading}>
              Add Beekeeper
            </button>
          </form>
          <ul className="list">
            {beekeepers.map((b) => (
              <li key={b._id}>
                {b.name} — {b.village}, {b.district}
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Register Hive</h2>
          <form onSubmit={submitHive}>
            <input
              placeholder="Hive Code (e.g. HIVE-01)"
              required
              value={hiveForm.hiveCode}
              onChange={(e) => setHiveForm({ ...hiveForm, hiveCode: e.target.value })}
            />
            <select
              required
              value={hiveForm.beekeeper}
              onChange={(e) => setHiveForm({ ...hiveForm, beekeeper: e.target.value })}
            >
              <option value="">Select Beekeeper</option>
              {beekeepers.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
            <input
              placeholder="Location"
              value={hiveForm.location}
              onChange={(e) => setHiveForm({ ...hiveForm, location: e.target.value })}
            />
            <input
              placeholder="Colony Strength"
              value={hiveForm.colonyStrength}
              onChange={(e) => setHiveForm({ ...hiveForm, colonyStrength: e.target.value })}
            />
            <button type="submit" disabled={loading}>
              Add Hive
            </button>
          </form>
          <ul className="list">
            {hives.map((h) => (
              <li key={h._id}>
                {h.hiveCode} — {h.beekeeper?.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Register Honey Batch</h2>
          <form onSubmit={submitBatch}>
            <select
              required
              value={batchForm.hiveId}
              onChange={(e) => setBatchForm({ ...batchForm, hiveId: e.target.value })}
            >
              <option value="">Select Hive</option>
              {hives.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.hiveCode}
                </option>
              ))}
            </select>
            <input
              type="date"
              required
              value={batchForm.harvestDate}
              onChange={(e) => setBatchForm({ ...batchForm, harvestDate: e.target.value })}
            />
            <input
              type="number"
              placeholder="Quantity (kg)"
              value={batchForm.quantityKg}
              onChange={(e) => setBatchForm({ ...batchForm, quantityKg: e.target.value })}
            />
            <select
              value={batchForm.qualityGrade}
              onChange={(e) => setBatchForm({ ...batchForm, qualityGrade: e.target.value })}
            >
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
            </select>
            <input
              type="number"
              placeholder="Moisture %"
              value={batchForm.moisturePercent}
              onChange={(e) => setBatchForm({ ...batchForm, moisturePercent: e.target.value })}
            />
            <button type="submit" disabled={loading}>
              Register Batch on Blockchain
            </button>
          </form>
        </div>
      </section>

      <section className="card full">
        <h2>Honey Batches</h2>
        <div className="batch-grid">
          {batches.map((batch) => {
            const verifyUrl = siteUrl ? `${siteUrl}/verify/${batch.batchId}` : '';
            return (
              <div key={batch._id} className="batch-card">
                <h3>{batch.batchId}</h3>
                <p>
                  <strong>Beekeeper:</strong> {batch.hive?.beekeeper?.name || '—'}
                </p>
                <p>
                  <strong>Hive:</strong> {batch.hive?.hiveCode || '—'}
                </p>
                <p>
                  <strong>Quantity:</strong> {batch.quantityKg} kg
                </p>
                <p>
                  <strong>Grade:</strong> {batch.qualityGrade}
                </p>
                <p>
                  <strong>Disease Risk:</strong> {batch.diseaseRiskScore}%
                </p>
                <p className={batch.blockchainTxHash ? 'status-ok' : 'status-pending'}>{batch.status}</p>
                {verifyUrl && (
                  <img
                    alt="QR code"
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      verifyUrl
                    )}`}
                  />
                )}
                <a href={`/verify/${batch.batchId}`} target="_blank" rel="noreferrer">
                  Open verification page
                </a>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
