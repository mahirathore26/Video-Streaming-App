import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: "videotube" });
        console.log("Mongo connected!");
        process.exit(0);
    } catch(e) {
        console.log("Mongo error:", e.message);
        process.exit(1);
    }
}
run();
