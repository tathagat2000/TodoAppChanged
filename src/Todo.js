import { CONSTANTS } from "./constants.js";
import { helperFunctions } from "./helperFunctions.js";
import { showSnackbar } from "./snackbar.js";
import { TodoEventListener } from "./TodoEventListener.js";

export class Todo {
  constructor(localDatabase, serverDatabase, render, addToHistory) {
    this.localDatabase = localDatabase;
    this.serverDatabase = serverDatabase;
    this.render = render;
    this.addToHistory = addToHistory;
    this.currentTodoId = this.localDatabase.findMaxId() + 1;
    this.EventListener = new TodoEventListener(
      localDatabase,
      serverDatabase,
      render,
      addToHistory
    );

    this.addEventListenerForCreatingNewToDo();
  }

  eventHandler = (event) => {
    this.EventListener.checkPathIfAnyButtonsClicked(event);
  };

  incrementCurrentTodoId = () => {
    this.currentTodoId++;
  };

  addEventListenerForCreatingNewToDo = () => {
    CONSTANTS.queriedElements.createTodoBox.addEventListener(
      "keypress",
      (event) => {
        const key = event.keyCode || event.which || 0;
        if (key === 13 && CONSTANTS.queriedElements.todoInput.value) {
          this.addNewTodo();
          this.incrementCurrentTodoId();
          helperFunctions.resetTodoInputValues();
        }
      }
    );
  };

  addNewTodo = () => {
    const newTodoObject = this.createTodoObject();
    const serverCopy = helperFunctions.makeCopyOfObject(newTodoObject);

    this.serverDatabase
      .createTodoInServerDatabase(serverCopy)
      .then(() => {
        this.localDatabase.addToDataBase(newTodoObject);
        this.render();
        const event = helperFunctions.createEvent(
          "create",
          helperFunctions.makeCopyOfObject(newTodoObject)
        );
        this.addToHistory(event);
      })
      .catch((err) => {
        showSnackbar(err);
      });
  };

  createTodoObject = () => {
    return {
      id: this.currentTodoId,
      text: CONSTANTS.queriedElements.todoInput.value,
      urgency: CONSTANTS.queriedElements.urgency.value,
      category: CONSTANTS.queriedElements.category.value,
      isCompleted: false,
      time: helperFunctions.getTime(),
    };
  };
}
