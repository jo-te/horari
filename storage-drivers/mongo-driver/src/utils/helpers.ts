import { Schema } from "mongoose";

export const stringToObjectId = (value: string) =>
  new Schema.Types.ObjectId(value);

export const isArray = (value: unknown): value is Array<unknown> =>
  value instanceof Array;
