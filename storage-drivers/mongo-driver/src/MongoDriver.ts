import { DataManager } from "@horari/core";

export interface MongoDriver extends DataManager {
  connect(): Promise<MongoDriver>;
  disconnect(): Promise<MongoDriver>;
}

export default MongoDriver;
