import { Event, EventFilter } from "@horari/core";
import { FilterQuery } from "mongoose";
import { MongoEvent } from "../schemas/event-schema";
import { isArray, stringToObjectId } from "../utils/helpers";

export const transformMongoEventToEvent = (mongoEvent: MongoEvent): Event => ({
  id: mongoEvent._id.toString(),
  name: mongoEvent.name,
  startDate: mongoEvent.startDate,
  endDate: mongoEvent.endDate,
  isDisabled: mongoEvent.isDisabled,
  resourceIds: mongoEvent.resourceIds,
  scheduleIds: mongoEvent.scheduleIds.map((id) => id.toString()),
});

export const transformEventFilterToFilterQuery = (
  eventFilter: EventFilter
): FilterQuery<MongoEvent> => {
  return {
    _id: {
      $in: eventFilter.idsIncluded?.map(stringToObjectId),
      $nin: eventFilter.idsExcluded?.map(stringToObjectId),
    },
    startDate: {
      $gt: eventFilter.minStartDate,
      $lt: eventFilter.maxStartDate,
    },
    endDate: {
      $gt: eventFilter.minEndDate,
      $lt: eventFilter.maxEndDate,
    },
    ...(eventFilter.minStartEndDelta || eventFilter.minStartEndDelta
      ? {
          $expr: {
            ...(eventFilter.minStartEndDelta
              ? {
                  $gt: [
                    { $subtract: ["$endDate", "$startDate"] },
                    eventFilter.minStartEndDelta,
                  ],
                }
              : {}),
            ...(eventFilter.maxStartEndDelta
              ? {
                  $lt: [
                    { $subtract: ["$endDate", "$startDate"] },
                    eventFilter.maxStartEndDelta,
                  ],
                }
              : {}),
          },
        }
      : {}),
    isDisabled: eventFilter.isDisabled,
    $and: [
      {
        $or: eventFilter.resourceIdsIncludedXOR?.map((combination) => {
          return {
            resourceIds: {
              $all: isArray(combination)
                ? combination.map(stringToObjectId)
                : [stringToObjectId(combination)],
            },
          };
        }),
      },
      {
        $or: eventFilter.scheduleIdsIncludedXOR?.map((combination) => {
          return {
            scheduleIds: {
              $all: isArray(combination)
                ? combination.map(stringToObjectId)
                : [stringToObjectId(combination)],
            },
          };
        }),
      },
    ],
  };
};
