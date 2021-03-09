import { updateAnalytics } from "./analytics.js";
import { TodoElement } from "./TodoElement.js";
import { Modal } from "./Modal.js";
import { filterIdToValue } from "./constants.js";

const clearAllTodos = () =>
  (document.querySelector("#todoList").innerHTML = "");

const addTodo = (element) =>
  document.querySelector("#todoList").appendChild(element);

const readTodoText = () => document.querySelector("#addTodo").value;

const readTodoUrgencyValue = () => document.querySelector("#urgency").value;

const readTodoCategoryValue = () => document.querySelector("#category").value;

export class View {
  constructor(callbacks) {
    this.modal = new Modal();
    this.callbacks = { ...callbacks, editTodo: this.showEditWindow };
  }
  render = (todoList, selectedTodoIds) => {
    clearAllTodos();
    todoList.forEach((todo) => {
      const isSelected = selectedTodoIds.includes(todo.id);
      const todoElement = new TodoElement(this.callbacks, todo, isSelected);
      addTodo(todoElement.element);
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
      if (buttonClicked) {
        filterEventHandler(buttonClicked);
      }
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
