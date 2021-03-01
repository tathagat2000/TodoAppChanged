import { CONSTANTS } from "./constants.js";

const findNumberOfCompletedTodos = (database) => {
  return database.filter((todo) => todo.isCompleted).length;
};

const updateRatioInFraction = (numberOfTodos, numberOfCompletedTodos) => {
  CONSTANTS.queriedElements.analyticsRatio.innerHTML =
    numberOfCompletedTodos + " / " + numberOfTodos;
};

const updateRatioInDecimal = (numberOfTodos, numberOfCompletedTodos) => {
  let value;
  if (numberOfCompletedTodos === 0) {
    value = 0;
  } else {
    value = Math.round((100 * numberOfCompletedTodos) / numberOfTodos);
  }
  CONSTANTS.queriedElements.analyticsPercent.innerHTML = value + " % ";
};

export const updateAnalytics = (database) => {
  const numberOfTodos = database.length;

  const numberOfCompletedTodos = findNumberOfCompletedTodos(database);

  updateRatioInFraction(numberOfTodos, numberOfCompletedTodos);
  updateRatioInDecimal(numberOfTodos, numberOfCompletedTodos);
};
