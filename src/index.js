import dotenv from "dotenv";
import mongoose, { connect } from "mongoose";
import { DB_Name } from "./constants.js";
import connectDB from "./db/index.js";
import express from "express";
import { app } from "./app.js";

dotenv.config({
    path:'./.env'
})

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`app listening on port ${process.env.PORT}`);
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
