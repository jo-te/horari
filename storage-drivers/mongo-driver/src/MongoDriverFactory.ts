import { Mongoose } from "mongoose";
import createMongoEventsManager from "./manager-factories/createMongoEventsManager";
import MongoDriver from "./MongoDriver";

export interface MongoDriverOptions {
  uri: string;
  /**
   * A Mongoose instance to be used. Is instantiated by default by MongoDriver.
   */
  mongoose?: Mongoose;
}

export const createMongoDriver = ({
  uri,
  mongoose = new Mongoose(),
}: MongoDriverOptions): MongoDriver => {
  const instance: MongoDriver = {
    events: createMongoEventsManager(mongoose),
    connect: async () => {
      await mongoose.connect(uri);
      return instance;
    },
    disconnect: async () => {
      await mongoose.disconnect();
      return instance;
    },
  };

  return instance;
};

export const createMongoDriverAndConnect = (
  createOptions: MongoDriverOptions
) => createMongoDriver(createOptions).connect();

export class MongoDriverFactory {
  static create = createMongoDriver;
  static createAndConnect = createMongoDriverAndConnect;
}
export default MongoDriverFactory;
