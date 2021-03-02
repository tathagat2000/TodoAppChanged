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

  getFilterState = () => {
    return { ...this.state };
  };

  toggleFilterState = (buttonId) => {
    const copyOfFilterState = { ...this.state };
    copyOfFilterState[
      CONSTANTS.mapFilterIdToValue[buttonId]
    ] = !copyOfFilterState[CONSTANTS.mapFilterIdToValue[buttonId]];

    this.state = copyOfFilterState;
  };

  computeUrgencyFilterValue = () => {
    return this.state.low || this.state.medium || this.state.high;
  };

  computeCategoryFilterValue = () => {
    return this.state.personal || this.state.academic || this.state.social;
  };

  filterAccordingToUrgencyAndCategory = (listOfTodos) => {
    return listOfTodos.filter((todo) => {
      return (
        this.state[CONSTANTS.mapValueToFilter[todo.urgency]] ||
        this.state[CONSTANTS.mapValueToFilter[todo.category]]
      );
    });
  };

  filterTodos = (listOfTodos) => {
    const urgencyFilter = this.computeUrgencyFilterValue();

    const categoryFilter = this.computeCategoryFilterValue();

    if (urgencyFilter == 0 && categoryFilter == 0) {
      return listOfTodos;
    }

    return this.filterAccordingToUrgencyAndCategory(listOfTodos);
  };
}
