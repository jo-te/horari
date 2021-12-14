import { Event, EventsManager } from "@horari/core";
import { Mongoose } from "mongoose";
import { modelEvent } from "../schemas/event-schema";
import {
  transformEventFilterToFilterQuery,
  transformMongoEventToEvent,
} from "../utils/transformers";

export const createMongoEventsManager = (mongoose: Mongoose): EventsManager => {
  const EventModel = modelEvent(mongoose);

  return {
    create: async ({
      id,
      name,
      startDate,
      endDate,
      isDisabled,
      resourceIds,
      scheduleIds,
    }): Promise<Event> => {
      const mongoEvent = await EventModel.create({
        _id: id,
        name: name,
        startDate: startDate,
        endDate: endDate,
        isDisabled: isDisabled,
        resourceIds: resourceIds,
        scheduleIds: scheduleIds,
      });

      return transformMongoEventToEvent(mongoEvent);
    },
    createMany: async (data): Promise<Event[]> => {
      const mongoEvents = await EventModel.create(
        data.map((dataItem) => ({
          _id: dataItem.id,
          name: dataItem.name,
          startDate: dataItem.startDate,
          endDate: dataItem.endDate,
          isDisabled: dataItem.isDisabled,
          resourceIds: dataItem.resourceIds,
          scheduleIds: dataItem.scheduleIds,
        }))
      );

      return mongoEvents.map(transformMongoEventToEvent);
    },
    findAll: async (filter?, options?) => {
      const mongoEvents = await EventModel.find(
        filter ? transformEventFilterToFilterQuery(filter) : {},
        undefined,
        {
          limit: options?.limit,
          skip: options?.skip,
          sort: options?.order
            ? {
                [options.orderBy || "startDate"]:
                  options.order === "asc" ? 1 : -1,
              }
            : undefined,
        }
      ).lean();
      return mongoEvents.map(transformMongoEventToEvent);
    },
    findById: async (eventId) => {
      const mongoEvent = await EventModel.findById(eventId);
      if (mongoEvent) {
        return transformMongoEventToEvent(mongoEvent);
      }
      return null;
    },
    countAll: async (filter?) => {
      return await EventModel.countDocuments(
        filter ? transformEventFilterToFilterQuery(filter) : {}
      );
    },
    updateById: async (eventId, { name, startDate, endDate, resourceIds }) => {
      const updatedMongoEvent = await EventModel.findByIdAndUpdate(
        eventId,
        {
          $set: {
            name: name,
            startDate: startDate,
            endDate: endDate,
            resourceIds: resourceIds,
          },
        },
        { new: true }
      ).lean();
      if (updatedMongoEvent) {
        return transformMongoEventToEvent(updatedMongoEvent);
      }
      // no document found for given id
      return null;
    },
    deleteAll: async (filter?) => {
      const deleteResult = await EventModel.deleteMany(
        filter ? transformEventFilterToFilterQuery(filter) : {}
      );
      return deleteResult.deletedCount;
    },
    deleteById: async (eventId) => {
      await EventModel.findByIdAndDelete(eventId).lean();
    },
  };
};

export default createMongoEventsManager;
