import faker from "faker";

export function getRandomElementOfArray<T>(array: Array<T>) {
  return array[faker.datatype.number(array.length - 1)];
}
