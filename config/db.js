import mongoose from "mongoose";
import config from "config";

const db = config.get("mongoURI");

export const connectDB = () => {
  return mongoose.connect(db, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });
};
