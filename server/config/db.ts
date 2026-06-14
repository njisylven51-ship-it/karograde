import mongoose from "mongoose";

let isDbConnected = false;
let useInMemoryDb = false;

// In-memory collections to fall back on if MONGO_URI is not set
export const memoryStore = {
  users: [] as any[],
  exams: [] as any[],
  submissions: [] as any[]
};

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn("⚠️ MONGO_URI is not defined in .env! Operating in IN-MEMORY demo mode.");
    useInMemoryDb = true;
    return;
  }

  try {
    mongoose.set("strictQuery", false);
    // Use low connection timeout to prevent hanging the server on slow Mongo boots
    await mongoose.connect(mongoUri, {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 20000,
    });
    isDbConnected = true;
    console.log("✅ Successfully connected to MongoDB Atlas!");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB Atlas:", error);
    console.warn("⚠️ Operating in IN-MEMORY fallback mode so the application remains online.");
    useInMemoryDb = true;
  }
}

export function isConnected() {
  return isDbConnected;
}

export function isInMemory() {
  return useInMemoryDb;
}
