import faker from "faker";
import { ResourceId } from "../../src/entities/Resource";
import { getRandomElementOfArray } from "./utils";

export interface GeneratedResource {
  id: ResourceId;
}

export const generateResource = (): GeneratedResource => {
  return {
    id: faker.datatype.uuid(),
  };
};

export const generateManyResources = (count: number): GeneratedResource[] => {
  return Array.from(Array(count), () => generateResource());
};

export const staticResourcesCount = 22;
export const staticResources = generateManyResources(staticResourcesCount);
export const staticResourceIds = staticResources.map((r) => r.id);

export const getRandomStaticResource = () => {
  return getRandomElementOfArray(staticResources);
};
export const getRandomStaticResourceId = () => {
  return getRandomElementOfArray(staticResourceIds);
};
