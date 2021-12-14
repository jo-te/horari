import DataManager from "../data/DataManager";
import EventsManager from "../data/managers/EventsManager";

export default abstract class Service {
  protected eventsManager: EventsManager;

  constructor(dataManager: DataManager) {
    this.eventsManager = dataManager.events;
  }
}
