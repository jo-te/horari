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
  const $andQuery: FilterQuery<MongoEvent>[] = [];
  if (eventFilter.resourceIdsIncludedXOR) {
    $andQuery.push({
      $or: eventFilter.resourceIdsIncludedXOR.map((combination) => {
        return {
          resourceIds: {
            $all: isArray(combination) ? combination : [combination],
          },
        };
      }),
    });
  }
  if (eventFilter.scheduleIdsIncludedXOR) {
    $andQuery.push({
      $or: eventFilter.scheduleIdsIncludedXOR.map((combination) => {
        return {
          scheduleIds: {
            $all: isArray(combination)
              ? combination.map(stringToObjectId)
              : [stringToObjectId(combination)],
          },
        };
      }),
    });
  }
  if (eventFilter.startEndDateXOR) {
    $andQuery.push({
      $or: eventFilter.startEndDateXOR.map(
        ({ minStartDate, maxStartDate, minEndDate, maxEndDate }) => {
          return {
            ...(minStartDate || maxStartDate
              ? {
                  startDate: {
                    $gte: minStartDate,
                    $lte: maxStartDate,
                  },
                }
              : {}),
            ...(minEndDate || maxEndDate
              ? {
                  endDate: {
                    $gte: minEndDate,
                    $lte: maxEndDate,
                  },
                }
              : {}),
          };
        }
      ),
    });
  }
  const filterQuery: FilterQuery<MongoEvent> = {
    ...(eventFilter.idsIncluded || eventFilter.idsIncluded
      ? {
          _id: {
            $in: eventFilter.idsIncluded?.map(stringToObjectId),
            $nin: eventFilter.idsExcluded?.map(stringToObjectId),
          },
        }
      : {}),
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
    $and: $andQuery.length > 0 ? $andQuery : undefined,
  };
  return filterQuery;
};
