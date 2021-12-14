import { Schema, Mongoose } from "mongoose";

export interface MongoEvent {
  _id: Schema.Types.ObjectId;
  name: string;
  startDate: Date;
  endDate: Date;
  isDisabled: boolean;
  resourceIds: [string];
  scheduleIds: [Schema.Types.ObjectId];
}

const eventSchema = new Schema<MongoEvent>({
  name: { type: Schema.Types.String, required: true },
  startDate: { type: Schema.Types.Date, required: true },
  endDate: { type: Schema.Types.Date, required: true },
  isDisabled: { type: Schema.Types.Boolean },
  resourceIds: [{ type: Schema.Types.String }],
  scheduleIds: [
    { type: Schema.Types.ObjectId, ref: "Schedule", required: true },
  ],
});

export const modelEvent = (mongoose: Mongoose) =>
  mongoose.model("Event", eventSchema);
