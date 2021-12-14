import DataManager from "./data/DataManager";
import EventService from "./services/EventService";

export default class Horari {
  events: EventService;

  constructor(dataManager: DataManager) {
    this.events = new EventService(dataManager);
  }
}
