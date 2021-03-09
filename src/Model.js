import { helperFunctions } from "./helperFunctions.js";
import { actionType } from "./constants.js";
import { showSnackbar } from "./snackbar.js";
import { Filter } from "./Filter.js";
import { Server } from "./Server.js";

export class Model {
  constructor(onStateChange) {
    this.todos = [];
    this.selectedTodoIds = [];
    this.server = new Server();
    this.onStateChange = onStateChange;
    this.historyIndex = -1;
    this.history = [];
    this.filter = new Filter();
    this.initialize().then(() => {
      this.currentTodoId = this.findLastTodoId() + 1;
      this.onStateChange();
    });
  }

  createTodo = (todo) => (this.todos = [...this.todos, todo]);

  updateTodo = (todo) => {
    const index = this.findIndexOfTodoById(todo.id);

    this.todos = this.todos
      .slice(0, index)
      .concat(todo, this.todos.slice(index + 1));
  };

  deleteTodo = (todo) => {
    const id = todo.id;
    this.todos = this.todos.filter((todo) => todo.id !== id);
  };

  getSelectedTodoIds = () => this.selectedTodoIds;

  getSelectedTodos = () => this.selectedTodoIds.map(this.findTodoById);

  getFilteredTodos = () => {
    const todoList = this.getTodos();
    return this.filter.filterTodos(todoList);
  };

  findLastTodoId = () => {
    let maximumId = -1;
    this.todos.forEach((todo) => (maximumId = Math.max(maximumId, todo.id)));
    return maximumId;
  };

  findTodoById = (id) => this.todos.find((todo) => todo.id === id);

  resetSelection = () => (this.selectedTodoIds = []);

  toggleSelectedTodo = (id) => {
    if (this.selectedTodoIds.includes(id)) {
      this.removeFromSelectedTodos(id);
    } else {
      this.addToSelectedTodos(id);
    }
  };

  removeFromSelectedTodos = (id) => {
    this.selectedTodoIds = this.selectedTodoIds.filter(
      (todoId) => todoId !== id
    );
  };

  addToSelectedTodos = (id) => {
    this.selectedTodoIds = [...this.selectedTodoIds, id];
  };

  sortList = (list) => {
    return list.sort((todo1, todo2) => todo1.id - todo2.id);
  };

  getTodos = () => {
    const copyOfTodos = helperFunctions.makeCopy(this.todos);
    return this.sortList(copyOfTodos);
  };

  findIndexOfTodoById = (id) => this.todos.findIndex((todo) => todo.id === id);

  getCurrentTodoId = () => this.currentTodoId;

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
    if (type === actionType.REDO) {
      this.incrementHistoryIndex();
    } else if (type === actionType.UNDO) {
      this.decrementHistoryIndex();
    }
  };

  addToHistory = (action) => {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history = [...this.history, action];
    this.incrementHistoryIndex();
  };

  getTodoListFromHistory = (action, type) => {
    if (type === actionType.REDO) {
      return action.todoListAfterUpdate;
    } else if (type === actionType.UNDO) {
      return action.todoListBeforeUpdate;
    }
  };

  onUpdate = (todos) => {
    return this.server.updateTodo(todos).then(() => {
      helperFunctions.convertToList(todos).forEach(this.updateTodo);
    });
  };

  onDelete = (todos) => {
    return this.server.deleteTodo(todos).then(() => {
      helperFunctions.convertToList(todos).forEach(this.deleteTodo);
    });
  };

  onCreate = (todos) => {
    return this.server.createTodo(todos).then(() => {
      helperFunctions.convertToList(todos).forEach(this.createTodo);
    });
  };

  //Used for UNDO/REDO Operations
  updateOperation = (todos, type) => {
    this.onUpdate(todos)
      .then(() => {
        this.onStateChange();
        this.changeHistoryIndex(type);
      })
      .catch(showSnackbar);
  };

  //Used for UNDO/REDO Operations
  deleteOperation = (todos, type) => {
    this.onDelete(todos)
      .then(() => {
        this.onStateChange();
        this.changeHistoryIndex(type);
      })
      .catch(showSnackbar);
  };

  //Used for UNDO/REDO Operations
  createOperation = (todos, type) => {
    this.onCreate(todos)
      .then(() => {
        this.onStateChange();
        this.changeHistoryIndex(type);
      })
      .catch(showSnackbar);
  };

  undoHandler = () => {
    const action = this.history[this.historyIndex];
    const type = actionType.UNDO;

    if (!action) {
      showSnackbar("Cannot Undo. Haven't performed an operation yet");
      return;
    }
    const todos = this.getTodoListFromHistory(action, type);

    switch (action.operationType) {
      case actionType.DELETE:
        this.createOperation(todos, type);
        break;

      case actionType.CREATE:
        this.deleteOperation(todos, type);
        break;

      case actionType.UPDATE:
        this.updateOperation(todos, type);
        break;
    }
  };

  redoHandler = () => {
    const action = this.history[this.historyIndex + 1];
    const type = actionType.REDO;

    if (!action) {
      showSnackbar("Cannot Redo. Haven't undone an operation yet");
      return;
    }
    const todos = this.getTodoListFromHistory(action, type);

    switch (action.operationType) {
      case actionType.DELETE:
        this.deleteOperation(todos, type);
        break;

      case actionType.CREATE:
        this.createOperation(todos, type);
        break;

      case actionType.UPDATE:
        this.updateOperation(todos, type);
        break;
    }
  };

  //Used for Bulk Operations, where a user selects many todos at once and deletes them
  bulkDelete = (action, todos) => {
    this.onDelete(todos)
      .then(() => {
        this.addToHistory(action);
        this.resetSelection();
        this.onStateChange();
      })
      .catch(showSnackbar);
  };

  //Used for Bulk Operations, where a user selects many todos at once and updates them
  bulkUpdate = (action, todos) => {
    this.onUpdate(todos)
      .then(() => {
        this.addToHistory(action);
        this.resetSelection();
        this.onStateChange();
      })
      .catch(showSnackbar);
  };

  //Used for adding a new Todo
  addNewTodo = (todo, action) => {
    this.onCreate(todo)
      .then(() => {
        this.addToHistory(action);
        this.onStateChange();
      })
      .catch(showSnackbar);
  };

  //Used when a user deletes a todo
  deleteTodoHandler = (todo, action) => {
    this.onDelete(todo)
      .then(() => {
        this.addToHistory(action);
        this.onStateChange();
      })
      .catch(showSnackbar);
  };

  //Used when a user clicks on the select button on a todo
  selectTodoHandler = (id) => {
    this.toggleSelectedTodo(id);
    this.onStateChange();
  };

  //Used when a user edits a todo
  updateTodoHandler = (todo, action) => {
    this.onUpdate(todo)
      .then(() => {
        this.addToHistory(action);
        this.onStateChange();
      })
      .catch(showSnackbar);
  };

  //Used when a user completes/uncompletes a todo
  completeTodoHandler = (todo, action) => {
    this.onUpdate(todo)
      .then(() => {
        this.addToHistory(action);
        this.onStateChange();
      })
      .catch(showSnackbar);
  };

  //Initialize local array of todo, by syncing it with server.
  //Only done once through constructor.
  initialize = () => {
    return this.server
      .getDatabase()
      .then((serverDatabase) => {
        serverDatabase.forEach(this.createTodo);
      })
      .catch(showSnackbar);
  };
}
