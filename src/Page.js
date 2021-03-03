import { updateAnalytics } from "./analytics.js";
import { iconClasses, createTodoElement } from "./todoElement.js";
import { Modal } from "./Modal.js";
import { dataAttributes } from "./constants.js";
import { filterIdToValue } from "./constants.js";

const setTodoText = (element, textValue) => {
  element.querySelector(
    `[data-type=${dataAttributes.TEXT}]`
  ).innerHTML = textValue;
};

const setTodoUrgency = (element, urgencyValue) => {
  element.querySelector(`[data-type=${dataAttributes.URGENCYICON}]`).className =
    "";
  element
    .querySelector(`[data-type=${dataAttributes.URGENCYICON}]`)
    .classList.add(...iconClasses[urgencyValue]);
};

const setTodoCategory = (element, categoryValue) => {
  element.querySelector(
    `[data-type=${dataAttributes.CATEGORYICON}]`
  ).className = "";

  element
    .querySelector(`[data-type=${dataAttributes.CATEGORYICON}]`)
    .classList.add(...iconClasses[categoryValue]);
};

const setTodoTime = (element, time) => {
  element.querySelector(`[data-type=${dataAttributes.TIME}]`).innerHTML = time;
};

const setIsCompleted = (element, completed) => {
  if (completed) {
    element.classList.add("opacity");
    element.querySelector(
      `[data-button=${dataAttributes.COMPLETE_BUTTON}]`
    ).innerHTML = "Completed. Undo?";
  } else {
    element.classList.remove("opacity");
    element.querySelector(
      `[data-button=${dataAttributes.COMPLETE_BUTTON}]`
    ).innerHTML = "Mark Complete";
  }
};

const setIsSelected = (element, isElementSelected) => {
  if (isElementSelected) {
    element.classList.add("selected");
    element.querySelector(
      `[data-button=${dataAttributes.SELECT_BUTTON}]`
    ).style.backgroundColor = "red";
  } else {
    element.classList.remove("selected");
    element.querySelector(
      `[data-button=${dataAttributes.SELECT_BUTTON}]`
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
  render = (todoEventHandler, todoList, selectedTodoIds) => {
    clearAllTodosFromPage();
    todoList.forEach((todo) => {
      const element = createTodoElement();
      const isElementSelected = selectedTodoIds.includes(todo.id);
      setValuesOnTodo(element, todo, isElementSelected);
      addEventListenerOnTodo(element, todoEventHandler);
      addTodoToPage(element);
    });

    updateAnalytics(todoList);
  };

  resetTodoInputValues = () => {
    document.querySelector("#addTodo").value = "";
    document.querySelector("#urgency").selectedIndex = 0;
    document.querySelector("#category").selectedIndex = 0;
  };

  changeLogoStyle = (button, filterState) => {
    if (filterState[filterIdToValue[button.id]]) {
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
