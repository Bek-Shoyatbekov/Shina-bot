import mongoose from "mongoose";
import { config } from "dotenv";
config();

const connectDb = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then((client) => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.log("Error connecting to MongoDB Atlas", err);
    });
};

export default connectDb;
