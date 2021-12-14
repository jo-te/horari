import { Mongoose, Schema } from "mongoose";

const scheduleSchema = new Schema({});

export const modelSchedule = (mongoose: Mongoose) =>
  mongoose.model("Schedule", scheduleSchema);
