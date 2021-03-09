import { filterIdToValue, valueToFilter } from "./constants.js";

export class Filter {
  constructor() {
    this.state = {
      low: false,
      medium: false,
      high: false,
      personal: false,
      academic: false,
      social: false,
    };
  }

  getFilterState = () => this.state;

  toggleFilterState = (buttonId) => {
    this.state = {
      ...this.state,
      [filterIdToValue[buttonId]]: !this.state[filterIdToValue[buttonId]],
    };
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
