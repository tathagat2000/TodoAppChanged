import { updateAnalytics } from "./analytics.js";
import { iconClasses, createTodoElement } from "./todoElement.js";
import { CONSTANTS } from "./constants.js";
import { Modal } from "./Modal.js";

const setTodoText = (element, textValue) => {
  element.querySelector(
    `[data-type=${CONSTANTS.dataAttributes.TEXT}]`
  ).innerHTML = textValue;
};

const setTodoUrgency = (element, urgencyValue) => {
  element.querySelector(
    `[data-type=${CONSTANTS.dataAttributes.URGENCYICON}]`
  ).className = "";
  element
    .querySelector(`[data-type=${CONSTANTS.dataAttributes.URGENCYICON}]`)
    .classList.add(...iconClasses[urgencyValue]);
};

const setTodoCategory = (element, categoryValue) => {
  element.querySelector(
    `[data-type=${CONSTANTS.dataAttributes.CATEGORYICON}]`
  ).className = "";

  element
    .querySelector(`[data-type=${CONSTANTS.dataAttributes.CATEGORYICON}]`)
    .classList.add(...iconClasses[categoryValue]);
};

const setTodoTime = (element, time) => {
  element.querySelector(
    `[data-type=${CONSTANTS.dataAttributes.TIME}]`
  ).innerHTML = time;
};

const setIsCompleted = (element, completed) => {
  if (completed) {
    element.classList.add("opacity");
    element.querySelector(
      `[data-button=${CONSTANTS.dataAttributes.COMPLETEBUTTON}]`
    ).innerHTML = "Completed. Undo?";
  } else {
    element.classList.remove("opacity");
    element.querySelector(
      `[data-button=${CONSTANTS.dataAttributes.COMPLETEBUTTON}]`
    ).innerHTML = "Mark Complete";
  }
};

const setIsSelected = (element, isElementSelected) => {
  if (isElementSelected) {
    element.classList.add("selected");
    element.querySelector(
      `[data-button=${CONSTANTS.dataAttributes.SELECTBUTTON}]`
    ).style.backgroundColor = "red";
  } else {
    element.classList.remove("selected");
    element.querySelector(
      `[data-button=${CONSTANTS.dataAttributes.SELECTBUTTON}]`
    ).style.backgroundColor = "white";
  }
};

const setTodoId = (element, id) => {
  element.id = id;
};

const setValuesOnTodo = (element, todo, isElementSelected) => {
  setTodoText(element, todo.text);
  setTodoUrgency(element, todo.urgency);
  setTodoCategory(element, todo.category);
  setTodoTime(element, todo.time);
  setIsSelected(element, isElementSelected);
  setIsCompleted(element, todo.isCompleted);
  setTodoId(element, todo.id);
};

const clearAllTodosFromPage = () =>
  (document.querySelector("#todoList").innerHTML = "");

const addTodoToPage = (element) =>
  document.querySelector("#todoList").appendChild(element);

const addEventListenerOnTodo = (element, eventHandler) =>
  element.addEventListener("click", eventHandler);

const readTodoText = () => document.querySelector("#addTodo").value;

const readTodoUrgencyValue = () => document.querySelector("#urgency").value;

const readTodoCategoryValue = () => document.querySelector("#category").value;

export class Page {
  constructor() {
    this.modal = new Modal();
  }
  render = (todoEventHandler, listOfTodos, selectedTodoIds) => {
    clearAllTodosFromPage();
    listOfTodos.forEach((todo) => {
      const element = createTodoElement();
      const isElementSelected = selectedTodoIds.includes(todo.id);
      setValuesOnTodo(element, todo, isElementSelected);
      addEventListenerOnTodo(element, todoEventHandler);
      addTodoToPage(element);
    });

    updateAnalytics(listOfTodos);
  };

  resetTodoInputValues = () => {
    document.querySelector("#addTodo").value = "";
    document.querySelector("#urgency").selectedIndex = 0;
    document.querySelector("#category").selectedIndex = 0;
  };

  changeLogoStyle = (button, filterState) => {
    if (filterState[CONSTANTS.mapFilterIdToValue[button.id]]) {
      button.style.fontSize = "35px";
    } else {
      button.style.fontSize = "20px";
    }
  };

  addFilterEventListener = (filterEventHandler) => {
    document
      .querySelector("#logos")
      .addEventListener("click", filterEventHandler);
  };

  addHistoryEventListener = (undoAndRedoEventHandler) => {
    document.addEventListener("keydown", undoAndRedoEventHandler);
  };

  addBulkEventListeners = (bulkUpdateEventHandler, bulkDeleteEventHandler) => {
    document
      .querySelector("#deleteSelection")
      .addEventListener("click", bulkDeleteEventHandler);

    document
      .querySelector("#completeSelection")
      .addEventListener("click", (event) => {
        bulkUpdateEventHandler(1);
      });

    document
      .querySelector("#incompleteSelection")
      .addEventListener("click", (event) => {
        bulkUpdateEventHandler(0);
      });
  };

  addEventListenerForCreatingNewTodo = (createTodoEventHandler) => {
    document
      .querySelector("#createTodo")
      .addEventListener("keypress", (event) =>
        createTodoEventHandler(
          event,
          readTodoText(),
          readTodoUrgencyValue(),
          readTodoCategoryValue()
        )
      );
  };
}
