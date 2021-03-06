import { MongoDriver, MongoDriverFactory } from "@horari/mongo-driver";
import { MongoMemoryServer } from "mongodb-memory-server";
import Horari from "../src/Horari";
import { generateCreateEventData } from "./helpers/event-data-generators";
import { generateResource } from "./helpers/resources-generator";

describe("event-service", () => {
  let mongod: MongoMemoryServer;
  let mongoDriver: MongoDriver;
  let horari: Horari;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    mongoDriver = MongoDriverFactory.create({ uri: mongod.getUri() });
    await mongoDriver.connect();
    horari = new Horari(mongoDriver);
  });

  afterEach(async () => {
    if (mongoDriver) {
      await mongoDriver.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
  });

  it("allows to create single events for a single resource", async () => {
    const eventData = generateCreateEventData();
    const resource = generateResource();

    const event = await horari.events.createFor(resource.id, eventData);

    expect(event.id).toBeDefined();
    expect(event.id.length).toBeGreaterThan(0);
    expect(event.name).toEqual(eventData.name);
    expect(event.startDate).toEqual(eventData.startDate);
    expect(event.endDate).toEqual(eventData.endDate);
    expect(event.isDisabled).toEqual(eventData.isDisabled);
    expect(event.resourceIds.length).toBe(1);
    expect(event.resourceIds[0]).toEqual(resource.id);
  });

  it("doesn't allow to create an event which would overlap", async () => {
    const eventData1 = generateCreateEventData({ isDisabled: false });
    const eventData2 = generateCreateEventData({
      startDate: eventData1.startDate,
      isDisabled: false,
    });
    const resource = generateResource();

    await horari.events.createFor(resource.id, eventData1);
    await expect(
      horari.events.createFor(resource.id, eventData2)
    ).rejects.toThrowError();
  });

  it("does allow to get an event by id", async () => {
    const eventData1 = generateCreateEventData();
    const resource = generateResource();

    const createdEvent = await horari.events.createFor(resource.id, eventData1);
    const event = await horari.events.getById(createdEvent.id);
    expect(event).toEqual(createdEvent);
  });
});
