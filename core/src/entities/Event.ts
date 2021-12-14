import { ResourceId } from "./Resource";
import { ScheduleId } from "./Schedule";

export type EventId = string;

export interface Event {
  id: EventId;
  name: string;
  startDate: Date;
  endDate: Date;
  isDisabled: boolean;
  resourceIds: ResourceId[];
  scheduleIds: ScheduleId[];
}

export default Event;
