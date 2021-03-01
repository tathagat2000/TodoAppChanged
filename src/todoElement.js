import { CONSTANTS } from "./constants.js";

const initializeTodoElement = () => {
  const editIcon = {
    type: "i",
    classes: ["fa", "fa-edit"],
    children: [],
  };

  const deleteIcon = {
    type: "i",
    classes: ["fa", "fa-trash"],
    children: [],
  };

  const editButton = {
    type: "button",
    classes: ["edit"],
    children: [editIcon],
    properties: {
      "data-button": CONSTANTS.dataAttributes.EDITBUTTON,
    },
  };

  const deleteButton = {
    type: "button",
    classes: ["delete"],
    children: [deleteIcon],
    properties: {
      "data-button": CONSTANTS.dataAttributes.DELETEBUTTON,
    },
  };

  const buttons = {
    type: "div",
    classes: ["buttons"],
    children: [editButton, deleteButton],
  };

  const todoText = {
    type: "div",
    classes: ["todoText"],
    children: [],
    properties: {
      "data-type": CONSTANTS.dataAttributes.TEXT,
    },
  };

  const time = {
    type: "div",
    classes: ["time"],
    children: [],
    properties: {
      "data-type": CONSTANTS.dataAttributes.TIME,
    },
  };

  const urgencyIcon = {
    type: "i",
    classes: [],
    children: [],
    properties: {
      "data-type": CONSTANTS.dataAttributes.URGENCYICON,
    },
  };

  const categoryIcon = {
    type: "i",
    classes: [],
    children: [],
    properties: {
      "data-type": CONSTANTS.dataAttributes.CATEGORYICON,
    },
  };

  const symbols = {
    type: "div",
    classes: ["symbols"],
    children: [urgencyIcon, categoryIcon],
  };

  const completeButton = {
    type: "button",
    classes: ["completeButton"],
    children: [],
    properties: {
      innerHTML: "Mark Complete",
      "data-button": CONSTANTS.dataAttributes.COMPLETEBUTTON,
    },
  };

  const complete = {
    type: "div",
    classes: ["complete"],
    children: [completeButton],
  };

  const select = {
    type: "div",
    classes: ["notSelect"],
    children: [],
    properties: {
      "data-button": CONSTANTS.dataAttributes.SELECTBUTTON,
    },
  };

  const todoElement = {
    type: "div",
    classes: ["todo"],
    children: [buttons, todoText, time, symbols, complete, select],
  };

  return todoElement;
};

const addClassesToElement = (newElement, element) =>
  newElement.classList.add(...element.classes);

const addPropertiesToElement = (newElement, element) => {
  for (const property in element.properties) {
    const value = element.properties[property];
    newElement.setAttribute(property, value);
  }
};

const addChildrenToElement = (newElement, element) => {
  element.children.forEach((childElement) => {
    newElement.appendChild(createTodoElement(childElement));
  });
};

const todoElement = initializeTodoElement();

export const createTodoElement = (element = todoElement) => {
  const newElement = document.createElement(element.type);

  addClassesToElement(newElement, element);

  addPropertiesToElement(newElement, element);

  addChildrenToElement(newElement, element);

  return newElement;
};

export const iconClasses = {
  low: ["grey", "fa", "fa-exclamation-triangle"],
  medium: ["orange", "fa", "fa-exclamation-triangle"],
  high: ["red", "fa", "fa-exclamation-triangle"],
  personal: ["blue", "fa", "fa-user"],
  academic: ["grey", "fa", "fa-book"],
  social: ["pink", "fa", "fa-users"],
};
