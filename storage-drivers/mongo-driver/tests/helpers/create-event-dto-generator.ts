import { CreateEventDTO } from "@horari/core";
import faker from "faker";

const resourcesCount = 10;
const resources = Array.from(Array(resourcesCount), () =>
  faker.datatype.uuid()
);

export const generateCreateEventDTO = (options?: {
  scheduleIds?: [];
}): CreateEventDTO => {
  const startDate = faker.date.future();
  const endDate = faker.date.future(undefined, startDate);

  return {
    name: faker.name.findName(),
    startDate: startDate,
    endDate: endDate,
    isDisabled: faker.datatype.boolean(),
    resourceIds: [resources[faker.datatype.number(resourcesCount - 1)]],
    scheduleIds: options?.scheduleIds,
  };
};

export const generateManyCreateEventDTOs = (
  count: number
): CreateEventDTO[] => {
  return Array.from(Array(count), () => generateCreateEventDTO());
};
