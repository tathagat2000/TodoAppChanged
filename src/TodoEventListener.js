import { CONSTANTS } from "./constants.js";
import { showSnackbar } from "./snackbar.js";
import { helperFunctions } from "./helperFunctions.js";

export class TodoEventListener {
  constructor(localDatabase, serverDatabase, render, addToHistory) {
    this.localDatabase = localDatabase;
    this.serverDatabase = serverDatabase;
    this.render = render;
    this.addToHistory = addToHistory;
  }

  checkPathIfAnyButtonsClicked = (event) => {
    const id = helperFunctions.getTodoIdFromEventPath(event.path);

    const button = helperFunctions.findButtonClickedOnTodo(event.path);

    switch (button?.dataset?.button) {
      case CONSTANTS.dataAttributes.COMPLETEBUTTON:
        this.completeButtonHandler(id);
        break;

      case CONSTANTS.dataAttributes.SELECTBUTTON:
        this.selectButtonHandler(id);
        break;

      case CONSTANTS.dataAttributes.EDITBUTTON:
        this.editButtonHandler(id);
        break;

      case CONSTANTS.dataAttributes.DELETEBUTTON:
        this.deleteButtonHandler(id);
        break;

      default:
        break;
    }
  };

  deleteButtonHandler = (id) => {
    this.serverDatabase
      .deleteTodoInServerDatabase(id)
      .then(() => {
        const event = helperFunctions.createEvent(
          "delete",
          this.localDatabase.findTodoBasedOnId(id)
        );
        this.addToHistory(event);
        this.localDatabase.deleteFromDatabase(id);
        this.render();
      })
      .catch((err) => {
        showSnackbar(err);
      });
  };

  editButtonHandler = (id) => {
    const textValue = this.localDatabase.getCurrentTodoData(id, "text");
    const urgencyValue = this.localDatabase.getCurrentTodoData(id, "urgency");
    const categoryValue = this.localDatabase.getCurrentTodoData(id, "category");
    // showModal(id, textValue, urgencyValue, categoryValue);
  };

  selectButtonHandler = (id) => {
    this.localDatabase.toggleSelectedTodo(id);
    this.render();
  };

  completeButtonHandler = (id) => {
    const todo = this.localDatabase.findTodoBasedOnId(id);
    todo.isCompleted = !todo.isCompleted;
    const serverCopy = helperFunctions.makeCopyOfObject(todo);

    this.serverDatabase
      .updateTodoInServerDatabase(serverCopy)
      .then(() => {
        const event = helperFunctions.createEvent(
          "update",
          this.localDatabase.findTodoBasedOnId(id)
        );
        this.localDatabase.updateToDatabase(todo);
        event.todoObjectAfter = this.localDatabase.findTodoBasedOnId(id);
        this.render();
        this.addToHistory(event);
      })
      .catch((err) => {
        showSnackbar(err);
      });
  };
}
