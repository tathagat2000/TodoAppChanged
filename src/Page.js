import { updateAnalytics } from "./analytics.js";
import { iconClasses, createTodoElement } from "./todoElement.js";
import { CONSTANTS } from "./constants.js";

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
    element.style.opacity = 0.5;
    element.querySelector(
      `[data-button=${CONSTANTS.dataAttributes.COMPLETEBUTTON}]`
    ).innerHTML = "Completed. Undo?";
  } else {
    element.style.opacity = 1;
    element.querySelector(
      `[data-button=${CONSTANTS.dataAttributes.COMPLETEBUTTON}]`
    ).innerHTML = "Mark Complete";
  }
};

const setIsSelected = (element, isElementSelected) => {
  if (isElementSelected) {
    element.style.boxShadow = "0px 0px 2vh 1vh grey";
    element.querySelector(
      `[data-button=${CONSTANTS.dataAttributes.SELECTBUTTON}]`
    ).style.backgroundColor = "red";
  } else {
    element.style.boxShadow = "";
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
  (CONSTANTS.queriedElements.todoList.innerHTML = "");

const addTodoToPage = (element) =>
  CONSTANTS.queriedElements.todoList.appendChild(element);

const addEventListenerOnTodo = (element, eventHandler) =>
  element.addEventListener("click", eventHandler);

export class Page {
  constructor(todoEventHandler, getFilteredDatabase, getSelectedTodoIds) {
    this.todoEventHandler = todoEventHandler;
    this.getFilteredDatabase = getFilteredDatabase;
    this.getSelectedTodoIds = getSelectedTodoIds;
  }

  render = () => {
    clearAllTodosFromPage();

    const selectedTodos = this.getSelectedTodoIds();

    this.getFilteredDatabase().forEach((todo) => {
      const element = createTodoElement();
      const isElementSelected = selectedTodos.includes(todo.id);
      setValuesOnTodo(element, todo, isElementSelected);
      addEventListenerOnTodo(element, this.todoEventHandler);
      addTodoToPage(element);
    });

    updateAnalytics(this.getFilteredDatabase());
  };
}
