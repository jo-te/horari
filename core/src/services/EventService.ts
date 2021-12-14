import { EventsResultOptions } from "../data";
import Event, { EventId } from "../entities/Event";
import { ResourceId } from "../entities/Resource";
import { ScheduleId } from "../entities/Schedule";
import Service from "./Service";

interface CreateEvent {
  id?: EventId;
  name: string;
  startDate: Date;
  endDate: Date;
  isDisabled?: boolean;
  resourceIds: ResourceId[];
  scheduleIds?: ScheduleId[];
}

interface UpdateEvent {
  name?: string;
  startDate?: Date;
  endDate?: Date;
  isDisabled?: boolean;
  resourceIds?: ResourceId[];
  scheduleIds?: ScheduleId[];
}

type GetAllOptions = EventsResultOptions;

export default class EventService extends Service {
  async createFromBlueprint({
    id,
    name,
    startDate,
    endDate,
    isDisabled = true,
    resourceIds,
    scheduleIds,
  }: CreateEvent): Promise<Event> {
    if (!isDisabled) {
      if (
        await this.areEventsExistingForManyBetween(
          resourceIds,
          startDate,
          endDate,
          scheduleIds
        )
      ) {
        throw new Error(
          `Event "${name}" could no be created due to at least one conflicting event.`
        );
      }
    }
    return this.eventsManager.create({
      id,
      name,
      startDate,
      endDate,
      isDisabled,
      resourceIds,
      scheduleIds: scheduleIds || [],
    });
  }

  async createFor(
    resourceId: ResourceId,
    eventData: CreateEvent,
    scheduleIds?: ScheduleId[]
  ) {
    return this.createForMany([resourceId], eventData, scheduleIds);
  }

  async createForMany(
    resourceIds: ResourceId[],
    eventData: CreateEvent,
    scheduleIds?: ScheduleId[]
  ) {
    return this.createFromBlueprint({ ...eventData, resourceIds, scheduleIds });
  }

  async getById(eventId: EventId) {
    return this.eventsManager.findById(eventId);
  }

  async getManyById(eventIds: EventId[]) {
    return this.eventsManager.findAll({ idsIncluded: eventIds });
  }

  async getAllFor(resourceId: ResourceId, options: GetAllOptions) {
    return this.getAllForMany([resourceId], options);
  }

  async getAllForMany(resourceIds: ResourceId[], options: GetAllOptions) {
    return this.eventsManager.findAll(
      { resourceIdsIncludedXOR: resourceIds },
      options
    );
  }

  async getAllForBetween(
    resourceId: ResourceId,
    startDate?: Date,
    endDate?: Date,
    options?: GetAllOptions
  ) {
    return this.getAllForManyBetween([resourceId], startDate, endDate, options);
  }

  async getAllForManyBetween(
    resourceIds: ResourceId[],
    startDate?: Date,
    endDate?: Date,
    options?: GetAllOptions
  ) {
    return this.eventsManager.findAll(
      {
        resourceIdsIncludedXOR: resourceIds,
        minStartDate: startDate,
        maxEndDate: endDate,
      },
      options
    );
  }

  async updateById(eventId: EventId, eventData: UpdateEvent) {
    return this.updateManyById([eventId], eventData);
  }

  async updateManyById(eventIds: EventId[], eventData: UpdateEvent) {
    const events = await this.getManyById(eventIds);
    events.forEach(async (event) => {
      if (
        (!event.isDisabled && !eventData.isDisabled) ||
        !eventData.isDisabled
      ) {
        // isActive, therefore we need to check for potential collisions
        if (
          await this.areEventsExistingForManyBetween(
            eventData.resourceIds || event.resourceIds,
            eventData.startDate || event.startDate,
            eventData.endDate || event.endDate,
            eventData.scheduleIds || event.scheduleIds,
            { exludeIds: [event.id] }
          )
        ) {
          throw new Error(
            `Event with id ${event.id} could not be updated due to at least one conflicting event.`
          );
        }
        await this.eventsManager.updateById(event.id, eventData);
      }
    });
  }

  async deleteById(eventId: EventId) {
    await this.eventsManager.deleteById(eventId);
  }

  async deleteManyById(eventIds: EventId[]) {
    await this.eventsManager.deleteAll({ idsIncluded: eventIds });
  }

  async deleteAllFor(resourceId: ResourceId) {
    await this.deleteAllForMany([resourceId]);
  }

  async deleteAllForMany(resourceIds: ResourceId[]) {
    await this.eventsManager.deleteAll({ resourceIdsIncludedXOR: resourceIds });
  }

  async areEventsExistingForBetween(
    resourceId: ResourceId,
    startDate?: Date,
    endDate?: Date,
    scheduleIds?: ScheduleId[],
    options?: {
      exludeIds?: EventId[];
    }
  ) {
    return this.areEventsExistingForManyBetween(
      [resourceId],
      startDate,
      endDate,
      scheduleIds,
      options
    );
  }

  async areEventsExistingForManyBetween(
    resourceIds: ResourceId[],
    startDate?: Date,
    endDate?: Date,
    scheduleIds?: ScheduleId[],
    options?: {
      exludeIds?: EventId[];
    }
  ) {
    const events = await this.eventsManager.findAll(
      {
        idsExcluded: options?.exludeIds,
        minStartDate: startDate,
        maxEndDate: endDate,
        resourceIdsIncludedXOR: resourceIds,
        scheduleIdsIncludedXOR: scheduleIds,
        isDisabled: false,
      },
      {
        // limit 1, since already one existing event is sufficent
        limit: 1,
      }
    );
    if (events.length > 0) {
      return true;
    } else {
      return false;
    }
  }
  // getAllBetween(startDate: Date, endDate: Date, where?: {
  //   belongsToResourcesXOR?: Array<ResourceId | ResourceId[]>
  //   belongsToSchedulesXOR?: Array<ScheduleId | ScheduleId[]>;
  //   isActive?: boolean;
  // }): Event[];
}
