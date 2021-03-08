import { updateAnalytics } from "./analytics.js";
import { iconClasses, createTodoElement } from "./todoElement.js";
import { Modal } from "./Modal.js";
import { dataAttributes, filterIdToValue } from "./constants.js";
import { helperFunctions } from "./helperFunctions.js";

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

const clearAllTodos = () =>
  (document.querySelector("#todoList").innerHTML = "");

const addTodo = (element) =>
  document.querySelector("#todoList").appendChild(element);

const addEventListenerOnTodo = (element, eventHandler) =>
  element.addEventListener("click", eventHandler);

const readTodoText = () => document.querySelector("#addTodo").value;

const readTodoUrgencyValue = () => document.querySelector("#urgency").value;

const readTodoCategoryValue = () => document.querySelector("#category").value;

export class View {
  constructor(callbacks) {
    this.modal = new Modal();
    this.callbacks = callbacks;
  }
  render = (todoList, selectedTodoIds) => {
    clearAllTodos();
    todoList.forEach((todo) => {
      const element = createTodoElement();
      const isElementSelected = selectedTodoIds.includes(todo.id);
      setValuesOnTodo(element, todo, isElementSelected);
      addEventListenerOnTodo(element, this.todoEventHandler);
      addTodo(element);
    });

    updateAnalytics(todoList);
  };

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
        this.callbacks.editTodo(id);
        break;

      case dataAttributes.DELETE_BUTTON:
        this.callbacks.deleteTodo(id);
        break;
    }
  };

  resetTodoInputValues = () => {
    document.querySelector("#addTodo").value = "";
    document.querySelector("#urgency").selectedIndex = 0;
    document.querySelector("#category").selectedIndex = 0;
  };

  changeLogoStyle = (button, filterState) => {
    if (filterState[filterIdToValue[button.id]]) {
      button.classList.add("larger");
    } else {
      button.classList.remove("larger");
    }
  };

  updateHeaderDate = () => {
    const currentDate = new Date().toDateString();
    document.querySelector("#date").innerHTML = currentDate;
  };

  showEditWindow = (text, urgency, category, id) =>
    this.modal.show(text, urgency, category, id);

  addEventListenerForModal = (saveEventHandler) => {
    this.modal.addEventListenerToSave(saveEventHandler);
    this.modal.addEventListenerToClose();
  };

  addFilterEventListener = (filterEventHandler) => {
    document.querySelector("#logos").addEventListener("click", (event) => {
      const buttonClicked = event.path.find(
        (element) => element.tagName === "BUTTON"
      );
      filterEventHandler(buttonClicked);
    });
  };

  addUndoRedoEventListener = (undoHandler, redoHandler) => {
    document.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        undoHandler();
      } else if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "y"
      ) {
        redoHandler();
        event.preventDefault();
      }
    });
  };

  addBulkEventListeners = (bulkUpdateEventHandler, bulkDeleteEventHandler) => {
    const completed = 1;
    const notCompleted = 0;
    document
      .querySelector("#deleteSelection")
      .addEventListener("click", bulkDeleteEventHandler);

    document
      .querySelector("#completeSelection")
      .addEventListener("click", (event) => {
        bulkUpdateEventHandler(completed);
      });

    document
      .querySelector("#incompleteSelection")
      .addEventListener("click", (event) => {
        bulkUpdateEventHandler(notCompleted);
      });
  };

  addEventListenerForCreatingNewTodo = (createTodoEventHandler) => {
    document
      .querySelector("#createTodo")
      .addEventListener("keypress", (event) => {
        const text = readTodoText();
        const urgency = readTodoUrgencyValue();
        const category = readTodoCategoryValue();
        const key = event.keyCode || event.which || 0;
        if (key === 13 && text) {
          createTodoEventHandler(event, text, urgency, category);
        }
      });
  };
}
