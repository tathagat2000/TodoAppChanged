import { helperFunctions } from "./helperFunctions.js";
import { Interface } from "./Interface.js";
import { showSnackbar } from "./snackbar.js";
import { Filter } from "./Filter.js";

export class Model {
  constructor(render) {
    this.render = render;
    this.historyIndex = -1;
    this.history = [];
    this.filter = new Filter();
    this.interface = new Interface();
    this.interface.initialize().then(() => {
      this.currentTodoId = this.interface.findMaxTodoId() + 1;
      this.render();
    });
  }

  incrementCurrentTodoId = () => {
    this.currentTodoId++;
  };

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
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history = [...this.history, event];
    this.incrementHistoryIndex();
  };

  getTodoObjectList = (event, type) => {
    if (type === "redo") {
      return event.todoObjectListAfter;
    } else {
      return event.todoObjectListBefore;
    }
  };

  updateOperation = (event, type) => {
    const todoObjectList = this.getTodoObjectList(event, type);
    this.interface
      .updateTodoInDatabase(todoObjectList)
      .then(() => {
        this.render();
        this.changeHistoryIndex(type);
      })
      .catch((err) => {
        showSnackbar(err);
      });
  };

  deleteOperation = (event, type) => {
    const todoObjectList = this.getTodoObjectList(event, type);
    this.interface
      .deleteTodoInDatabase(todoObjectList)
      .then(() => {
        this.render();
        this.changeHistoryIndex(type);
      })
      .catch((err) => {
        showSnackbar(err);
      });
  };

  createOperation = (event, type) => {
    const todoObjectList = this.getTodoObjectList(event, type);
    this.interface
      .createTodoInDatabase(todoObjectList)
      .then(() => {
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
        this.updateOperation(event, "undo");
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
        this.updateOperation(event, "redo");
        break;

      default:
        break;
    }
  };

  getFilteredTodos = () => {
    const listOfTodos = this.interface.getTodos();
    return this.filter.filterTodos(listOfTodos);
  };

  bulkDelete = (event, listOfTodosToBeDeleted) => {
    this.interface
      .deleteTodoInDatabase(listOfTodosToBeDeleted)
      .then(() => {
        this.addToHistory(event);
        this.interface.resetSelection();
        this.render();
      })
      .catch((err) => showSnackbar(err));
  };

  bulkUpdate = (event, listOfTodos) => {
    this.interface
      .updateTodoInDatabase(listOfTodos)
      .then(() => {
        this.addToHistory(event);
        this.interface.resetSelection();
        this.render();
      })
      .catch((err) => {
        console.log(err);
        showSnackbar(err);
      });
  };

  addNewTodo = (newTodoObject) => {
    newTodoObject.id = this.currentTodoId;
    this.incrementCurrentTodoId();
    const todoList = [newTodoObject];
    const event = helperFunctions.createEvent("create", todoList, todoList);
    this.interface
      .createTodoInDatabase(todoList)
      .then(() => {
        this.addToHistory(event);
        this.render();
      })
      .catch((err) => showSnackbar(err));
  };

  deleteTodoHandler = (id) => {
    const todo = this.interface.findTodoBasedOnId(id);
    const todoList = [todo];
    const event = helperFunctions.createEvent("delete", todoList, todoList);
    this.interface
      .deleteTodoInDatabase(todoList)
      .then(() => {
        this.addToHistory(event);
        this.render();
      })
      .catch((err) => showSnackbar(err));
  };

  selectTodoHandler = (id) => {
    this.interface.toggleSelectedTodo(id);
    this.render();
  };

  editTodoHandler = () => {};

  completeTodoHandler = (id) => {
    const todo = this.interface.findTodoBasedOnId(id);
    const todoListBeforeupdate = [todo];
    const updatedTodo = helperFunctions.makeCopyOfObject(todo);
    updatedTodo.isCompleted = !updatedTodo.isCompleted;
    const todoListAfterUpdate = [updatedTodo];
    const event = helperFunctions.createEvent(
      "update",
      todoListAfterUpdate,
      todoListAfterUpdate
    );
    this.interface
      .updateTodoInDatabase(todoListAfterUpdate)

      .then(() => {
        this.addToHistory(event);
        this.render();
      })
      .catch((err) => showSnackbar(err));
  };
}
