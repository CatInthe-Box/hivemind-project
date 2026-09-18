import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Reuse the connection across serverless invocations (required on Vercel)
let cached = global._honeychainMongoose;
if (!cached) {
  cached = global._honeychainMongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not set. Add it in .env.local (dev) or Vercel Project Settings > Environment Variables (production).'
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
