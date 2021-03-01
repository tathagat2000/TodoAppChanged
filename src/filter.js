import { CONSTANTS } from "./constants.js";

export class Filter {
  constructor() {
    this.state = {
      low: 0,
      medium: 0,
      high: 0,
      personal: 0,
      academic: 0,
      social: 0,
    };
  }

  computeUrgencyFilterValue = () => {
    return this.state.low || this.state.medium || this.state.high;
  };

  computeCategoryFilterValue = () => {
    return this.state.personal || this.state.academic || this.state.social;
  };

  filterAccordingToUrgencyAndCategory = (database) => {
    return database.filter((todo) => {
      return (
        this.state[CONSTANTS.mapValueToFilter[todo.urgency]] ||
        this.state[CONSTANTS.mapValueToFilter[todo.category]]
      );
    });
  };

  filterDatabase = (database) => {
    const urgencyFilter = this.computeUrgencyFilterValue();

    const categoryFilter = this.computeCategoryFilterValue();

    if (urgencyFilter == 0 && categoryFilter == 0) {
      return database;
    }

    return this.filterAccordingToUrgencyAndCategory(database);
  };

  findButtonInPath = (eventPath) => {
    return eventPath.find((element) => element.tagName === "BUTTON");
  };

  toggleFilterState = (buttonId) => {
    this.state[CONSTANTS.mapFilterIdToValue[buttonId]] = !this.state[
      CONSTANTS.mapFilterIdToValue[buttonId]
    ];
  };

  changeLogoStyle = (button) => {
    if (this.state[CONSTANTS.mapFilterIdToValue[button.id]]) {
      button.style.fontSize = "35px";
    } else {
      button.style.fontSize = "20px";
    }
  };

  eventHandler = (event) => {
    const button = this.findButtonInPath(event.path);

    if (button) {
      this.toggleFilterState(button.id);
      this.changeLogoStyle(button);
    }
  };
}
