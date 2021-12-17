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

export const generateCreateEventData = (
  values?: Partial<CreateEventData>
): CreateEventData => {
  const startDate = values?.startDate || faker.date.future();
  const endDate = values?.endDate || faker.date.future(undefined, startDate);

  return {
    name: faker.lorem.word(),
    startDate: startDate,
    endDate: endDate,
    isDisabled:
      values?.isDisabled !== undefined
        ? values.isDisabled
        : faker.datatype.boolean(),
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
