import { filterIdToValue, valueToFilter } from "./constants.js";

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

  getFilterState = () => this.state;

  toggleFilterState = (buttonId) => {
    const filterStateCopy = { ...this.state };
    filterStateCopy[filterIdToValue[buttonId]] = !filterStateCopy[
      filterIdToValue[buttonId]
    ];

    this.state = filterStateCopy;
  };

  computeUrgencyFilterValue = () => {
    return this.state.low || this.state.medium || this.state.high;
  };

  computeCategoryFilterValue = () => {
    return this.state.personal || this.state.academic || this.state.social;
  };

  filterAccordingToUrgencyAndCategory = (todoList) => {
    return todoList.filter((todo) => {
      return (
        this.state[valueToFilter[todo.urgency]] ||
        this.state[valueToFilter[todo.category]]
      );
    });
  };

  filterTodos = (todoList) => {
    const urgencyFilter = this.computeUrgencyFilterValue();

    const categoryFilter = this.computeCategoryFilterValue();
    // Double equal used purposefully as if value is false/true then it is to be converted to boolean
    if (urgencyFilter == 0 && categoryFilter == 0) {
      return todoList;
    }

    return this.filterAccordingToUrgencyAndCategory(todoList);
  };
}
