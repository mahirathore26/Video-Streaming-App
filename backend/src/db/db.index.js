import mongoose from "mongoose";
import { DB_Name } from "../constants.js";
const connectDB=async ()=> {
    try{
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
        dbName: DB_Name
    });
    console.log(`connected ${connectionInstance.connection.host}`);
    }
    catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
}
    } 
export default connectDB;