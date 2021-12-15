import faker from "faker";
import {
  CreateEventData,
  EventBlueprint,
} from "../../src/services/EventService";
import { ResourceId } from "../../src/entities/Resource";
import { staticResourceIds } from "./resources-generator";
import { getRandomElementOfArray } from "./utils";

export const generateEventBlueprint = (
  availableResourceIds: ResourceId[] = staticResourceIds,
  options?: {
    scheduleIds?: [];
  }
): EventBlueprint => {
  return {
    ...generateCreateEventData(),
    resourceIds: [getRandomElementOfArray(availableResourceIds)],
    scheduleIds: options?.scheduleIds,
  };
};

export const generateCreateEventData = (): CreateEventData => {
  const startDate = faker.date.future();
  const endDate = faker.date.future(undefined, startDate);

  return {
    name: faker.name.findName(),
    startDate: startDate,
    endDate: endDate,
    isDisabled: faker.datatype.boolean(),
  };
};

export const generateManyEventBlueprints = (
  count: number,
  availableResourceIds?: ResourceId[]
): EventBlueprint[] => {
  return Array.from(Array(count), () =>
    generateEventBlueprint(availableResourceIds)
  );
};
