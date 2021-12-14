import { ResourceId } from "../../entities/Resource";
import Event, { EventId } from "../../entities/Event";
import { ScheduleId } from "../../entities/Schedule";
import ResultOptions from "../../utils/ResultOptions";

export interface CreateEventDTO {
  /**
   * The id to be used for the new event, if provided.
   * If not provided the manager or the underlying database is responsible for creating one.
   */
  id?: EventId;
  name: string;
  startDate: Date;
  endDate: Date;
  isDisabled?: boolean;
  resourceIds?: ResourceId[];
  scheduleIds?: ScheduleId[];
}

export interface UpdateEventDTO {
  resourceIds?: ResourceId[];
  name?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface EventFilter {
  idsIncluded?: EventId[];
  idsExcluded?: EventId[];
  minStartDate?: Date;
  maxStartDate?: Date;
  minEndDate?: Date;
  maxEndDate?: Date;
  minStartEndDelta?: number;
  maxStartEndDelta?: number;
  resourceIdsIncludedXOR?: Array<ResourceId | ResourceId[]>;
  scheduleIdsIncludedXOR?: Array<ScheduleId | ScheduleId[]>;
  isDisabled?: boolean;
}

export interface EventsResultOptions extends ResultOptions {
  orderBy?: "startDate" | "endDate" | "name";
}

export interface EventsManager {
  /**
   * Creates a new event with given properties and returns it.
   * @param data an object containing values used for creating the new event
   */
  create(data: CreateEventDTO): Promise<Event>;
  createMany(data: CreateEventDTO[]): Promise<Event[]>;
  findAll(
    filter?: EventFilter,
    options?: EventsResultOptions
  ): Promise<Event[]>;
  findById(eventId: EventId): Promise<Event | null>;
  countAll(filter?: EventFilter): Promise<number>;
  updateById(eventId: EventId, data: UpdateEventDTO): Promise<Event | null>;
  deleteAll(filter?: EventFilter): Promise<number>;
  deleteById(eventId: EventId): Promise<void>;
}

export default EventsManager;
