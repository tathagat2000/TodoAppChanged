import { dataAttributes, iconClasses } from "./constants.js";
import { helperFunctions } from "./helperFunctions.js";
import { createTodoElement } from "./todoElementStructure.js";

export class TodoElement {
  constructor(callbacks, todo, isSelected) {
    this.callbacks = callbacks;
    this.element = createTodoElement();
    this.todo = todo;
    this.isSelected = isSelected;
    this.setValuesOnTodoElement(this.element, this.todo, this.isSelected);
    this.addEventListenerOnTodo(this.element, this.todoEventHandler);
  }

  todoEventHandler = (event) => {
    const id = helperFunctions.getTodoIdFromEventPath(event.path);

    const button = helperFunctions.findButtonClickedOnTodo(event.path);

    switch (button?.dataset?.button) {
      case dataAttributes.COMPLETE_BUTTON:
        this.callbacks.completeTodo(id);
        break;

      case dataAttributes.SELECT_BUTTON:
        this.callbacks.selectTodo(id);
        break;

      case dataAttributes.EDIT_BUTTON:
        this.callbacks.editTodo(
          this.todo.text,
          this.todo.urgency,
          this.todo.category,
          id
        );
        break;

      case dataAttributes.DELETE_BUTTON:
        this.callbacks.deleteTodo(id);
        break;

      default:
        break;
    }
  };

  setValuesOnTodoElement = (element, todo, isSelected) => {
    setTodoElementText(element, todo.text);
    setTodoElementUrgency(element, todo.urgency);
    setTodoElementCategory(element, todo.category);
    setTodoElementTime(element, todo.time);
    setTodoElementSelected(element, isSelected);
    setTodoElementCompleted(element, todo.isCompleted);
    setTodoElementId(element, todo.id);
  };

  addEventListenerOnTodo = (element, eventHandler) =>
    element.addEventListener("click", eventHandler);
}

const setTodoElementText = (element, textValue) => {
  element.querySelector(
    `[data-type=${dataAttributes.TEXT}]`
  ).innerHTML = textValue;
};

const setTodoElementUrgency = (element, urgencyValue) => {
  element.querySelector(`[data-type=${dataAttributes.URGENCYICON}]`).className =
    "";
  element
    .querySelector(`[data-type=${dataAttributes.URGENCYICON}]`)
    .classList.add(...iconClasses[urgencyValue]);
};

const setTodoElementCategory = (element, categoryValue) => {
  element.querySelector(
    `[data-type=${dataAttributes.CATEGORYICON}]`
  ).className = "";

  element
    .querySelector(`[data-type=${dataAttributes.CATEGORYICON}]`)
    .classList.add(...iconClasses[categoryValue]);
};

const setTodoElementTime = (element, time) => {
  element.querySelector(`[data-type=${dataAttributes.TIME}]`).innerHTML = time;
};

const setTodoElementCompleted = (element, completed) => {
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

const setTodoElementSelected = (element, isElementSelected) => {
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

const setTodoElementId = (element, id) => {
  element.id = id;
};
