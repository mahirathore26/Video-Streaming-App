import dotenv from "dotenv";
import mongoose, { connect } from "mongoose";
import { DB_Name } from "./constants.js";
import connectDB from "./db/db.index.js";
import express from "express";
import { app } from "./app.js";

dotenv.config({
    path:'./.env'
})

connectDB()
  .then(() => {
    const server = app.listen(process.env.PORT || 8000, () => {
      console.log(`app listening on port ${process.env.PORT || 8000}`);
    });

    // Graceful error handling for unexpected Node.js crashes
    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION! 💥 Shutting down...");
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    process.on("uncaughtException", (err) => {
      console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
      console.error(err.name, err.message);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error("Error connecting to DB:", err);
    process.exit(1);
});








// import express from "express";
// const app= express();

// (assync ()=>{
//     try{
//           await mongoose.connect(`${process.env.MONGODB_URI}`/`${DB_Name}`);
//           app.on("error",(error)=>{
//             console.log("ERR",error);
//             throw error;
//           }

//           app.listen(process.env.PORT,()=>{
//             console.log(`app listening on port ${process.env.PORT}`);
//           })
//     }
//     catch(err){
//         console.error("ERROR:",err);
//         throw err;
//     }
// })()
