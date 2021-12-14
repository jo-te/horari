import { MongoDriver, MongoDriverFactory } from "../src";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  generateCreateEventDTO,
  generateManyCreateEventDTOs,
} from "./helpers/create-event-dto-generator";

describe("events", () => {
  let mongoDriver: MongoDriver;
  let mongod: MongoMemoryServer;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    mongoDriver = MongoDriverFactory.create({ uri: mongod.getUri() });
    await mongoDriver.connect();
  });

  afterEach(async () => {
    if (mongoDriver) {
      await mongoDriver.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
  });

  it("can be created alone", async () => {
    const eventBlueprint = generateCreateEventDTO();

    const event = await mongoDriver.events.create({
      ...eventBlueprint,
    });

    expect(event.id).toBeDefined();
    expect(event.id.length).toBeGreaterThan(0);
    expect(event.name).toEqual(eventBlueprint.name);
    expect(event.startDate).toEqual(eventBlueprint.startDate);
    expect(event.endDate).toEqual(eventBlueprint.endDate);
    expect(event.isDisabled).toEqual(eventBlueprint.isDisabled);
    expect(event.resourceIds).toEqual(eventBlueprint.resourceIds);
    expect(event.scheduleIds).toEqual(eventBlueprint.scheduleIds || []);
  });

  it("can be created in bulk", async () => {
    const eventBlueprints = generateManyCreateEventDTOs(22);
    const events = await mongoDriver.events.createMany(eventBlueprints);

    expect(events.length).toBe(eventBlueprints.length);

    events.forEach((event, index) => {
      const relatedEventBlueprint = eventBlueprints[index];
      expect(event.name).toEqual(relatedEventBlueprint.name);
    });
  });

  it("can be counted", async () => {
    const eventQuantity = 12;
    const eventBlueprints = generateManyCreateEventDTOs(eventQuantity);

    await mongoDriver.events.createMany(eventBlueprints);

    const eventCount = await mongoDriver.events.countAll();

    expect(eventCount).toBe(eventQuantity);
  });

  it("can be found with limit", async () => {
    const eventBlueprints = generateManyCreateEventDTOs(22);
    await mongoDriver.events.createMany(eventBlueprints);

    const limit = 10;
    const events = await mongoDriver.events.findAll(undefined, {
      limit: limit,
    });

    expect(events.length).toBeLessThanOrEqual(limit);
  });

  it("can be found with order", async () => {
    const eventBlueprints = generateManyCreateEventDTOs(24);
    await mongoDriver.events.createMany(eventBlueprints);

    const events = await mongoDriver.events.findAll(undefined, {
      order: "asc",
      orderBy: "startDate",
    });

    events.reduce((previousEvent, event) => {
      if (previousEvent) {
        expect(previousEvent.startDate.valueOf()).toBeLessThanOrEqual(
          event.startDate.valueOf()
        );
      }
      return event;
    });
  });

  it("can be deleted", async () => {
    const eventQuantity = 4;
    const eventBlueprints = generateManyCreateEventDTOs(eventQuantity);
    await mongoDriver.events.createMany(eventBlueprints);

    let eventCount = await mongoDriver.events.countAll();

    expect(eventCount).toBe(eventQuantity);

    const deletionCount = await mongoDriver.events.deleteAll();
    eventCount = await mongoDriver.events.countAll();

    expect(deletionCount).toBe(eventQuantity);
    expect(eventCount).toBe(0);
  });
});
