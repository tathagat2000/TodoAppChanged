import { showSnackbar } from "./snackbar.js";
import { helperFunctions } from "./helperFunctions.js";

export class History {
  constructor(localDatabase, serverDatabase, render) {
    this.historyIndex = -1;
    this.history = [];
    this.localDatabase = localDatabase;
    this.serverDatabase = serverDatabase;
    this.render = render;
  }

  incrementHistoryIndex = () => {
    this.historyIndex++;
  };

  decrementHistoryIndex = () => {
    this.historyIndex--;
  };

  changeHistoryIndex = (type) => {
    if (type === "undo") {
      this.decrementHistoryIndex();
    } else {
      this.incrementHistoryIndex();
    }
  };

  addToHistory = (event) => {
    this.history.splice(this.historyIndex + 1);
    this.history.push(event);
    this.incrementHistoryIndex();
  };

  deleteOperation = (event, type) => {
    const id = event.todoObjectBefore.id;
    this.serverDatabase
      .deleteTodoInServerDatabase(id)
      .then(() => {
        this.localDatabase.deleteFromDatabase(id);
        this.render();
        this.changeHistoryIndex(type);
      })
      .catch((err) => {
        showSnackbar(err);
      });
  };

  createOperation = (event, type) => {
    const todoObject = event.todoObjectBefore;
    const serverCopy = helperFunctions.makeCopyOfObject(todoObject);

    this.serverDatabase
      .createTodoInServerDatabase(serverCopy)
      .then(() => {
        const localCopy = helperFunctions.makeCopyOfObject(todoObject);
        this.localDatabase.addToDataBase(localCopy);
        this.render();
        this.changeHistoryIndex(type);
      })
      .catch((err) => {
        showSnackbar(err);
      });
  };

  updateOperation = (todoObject, type) => {
    const serverCopy = helperFunctions.makeCopyOfObject(todoObject);
    this.serverDatabase
      .updateTodoInServerDatabase(serverCopy)
      .then(() => {
        this.localDatabase.updateToDatabase(todoObject);
        this.render();
        this.changeHistoryIndex(type);
      })
      .catch((err) => {
        showSnackbar(err);
      });
  };

  bulkUpdateOperation = (todoObjectList, type) => {
    const serverCopy = helperFunctions.makeCopyOfListOfObjects(todoObjectList);

    this.serverDatabase
      .bulkUpdateTodoInServerDatabase(serverCopy)
      .then(() => {
        todoObjectList.forEach((todo) => {
          const localCopy = helperFunctions.makeCopyOfObject(todo);
          this.localDatabase.updateToDatabase(localCopy);
        });
        this.render();
        this.changeHistoryIndex(type);
      })
      .catch((err) => {
        showSnackbar(err);
      });
  };

  bulkDeleteOperation = (todoObjectList, type) => {
    const listOfIds = todoObjectList.map((todo) => todo.id);

    this.serverDatabase
      .bulkDeleteTodoInServerDatabase(listOfIds)
      .then(() => {
        listOfIds.forEach((id) => {
          this.localDatabase.deleteFromDatabase(id);
        });
        this.render();
        this.changeHistoryIndex(type);
      })
      .catch((err) => {
        showSnackbar(err);
      });
  };

  bulkCreateOperation = (todoObjectList, type) => {
    const serverCopy = helperFunctions.makeCopyOfListOfObjects(todoObjectList);

    const localCopy = helperFunctions.makeCopyOfListOfObjects(todoObjectList);

    this.serverDatabase
      .bulkCreateTodoInServerDatabase(serverCopy)
      .then(() => {
        localCopy.forEach((todo) => {
          this.localDatabase.addToDataBase(todo);
        });
        this.render();
        this.changeHistoryIndex(type);
      })
      .catch((err) => {
        showSnackbar(err);
      });
  };

  undoHandler = () => {
    const event = this.history[this.historyIndex];
    if (!event) {
      showSnackbar("Cannot Undo. Haven't performed an operation yet");
      return;
    }

    switch (event.operationType) {
      case "delete":
        this.createOperation(event, "undo");
        break;

      case "create":
        this.deleteOperation(event, "undo");
        break;

      case "update":
        this.updateOperation(event.todoObjectBefore, "undo");
        break;

      case "bulkUpdate":
        this.bulkUpdateOperation(event.todoObjectListBefore, "undo");
        break;

      case "bulkDelete":
        this.bulkCreateOperation(event.todoObjectList, "undo");
        break;

      default:
        break;
    }
  };

  redoHandler = () => {
    const event = this.history[this.historyIndex + 1];
    if (!event) {
      showSnackbar("Cannot Redo. Haven't undone an operation yet");
      return;
    }

    switch (event.operationType) {
      case "delete":
        this.deleteOperation(event, "redo");
        break;

      case "create":
        this.createOperation(event, "redo");
        break;

      case "update":
        this.updateOperation(event.todoObjectAfter, "redo");
        break;

      case "bulkUpdate":
        this.bulkUpdateOperation(event.todoObjectListAfter, "redo");
        break;

      case "bulkDelete":
        this.bulkDeleteOperation(event.todoObjectList, "redo");
        break;

      default:
        break;
    }
  };
}
