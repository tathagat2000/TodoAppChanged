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

  addTodo = (todo) => (this.todos = [...this.todos, todo]);

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

  getCurrentTodoData = (id, type) => this.findTodoById(id)?.[type];

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

  //Used for UNDO/REDO Operations
  updateOperation = (action, type) => {
    const todoList = this.getTodoListFromHistory(action, type);

    this.server
      .updateTodo(todoList)
      .then(() => {
        helperFunctions.makeCopy(todoList).forEach(this.updateTodo);
        this.onStateChange();
        this.changeHistoryIndex(type);
      })
      .catch(showSnackbar);
  };

  //Used for UNDO/REDO Operations
  deleteOperation = (action, type) => {
    const todoList = this.getTodoListFromHistory(action, type);

    this.server
      .deleteTodo(todoList)
      .then(() => {
        todoList.forEach(this.deleteTodo);
        this.onStateChange();
        this.changeHistoryIndex(type);
      })
      .catch(showSnackbar);
  };

  //Used for UNDO/REDO Operations
  createOperation = (action, type) => {
    const todoList = this.getTodoListFromHistory(action, type);

    this.server
      .createTodo(todoList)
      .then(() => {
        helperFunctions.makeCopy(todoList).forEach(this.addTodo);
        this.onStateChange();
        this.changeHistoryIndex(type);
      })
      .catch(showSnackbar);
  };

  undoHandler = () => {
    const action = this.history[this.historyIndex];

    if (!action) {
      showSnackbar("Cannot Undo. Haven't performed an operation yet");
      return;
    }

    switch (action.operationType) {
      case actionType.DELETE:
        this.createOperation(action, actionType.UNDO);
        break;

      case actionType.CREATE:
        this.deleteOperation(action, actionType.UNDO);
        break;

      case actionType.UPDATE:
        this.updateOperation(action, actionType.UNDO);
        break;
    }
  };

  redoHandler = () => {
    const action = this.history[this.historyIndex + 1];
    if (!action) {
      showSnackbar("Cannot Redo. Haven't undone an operation yet");
      return;
    }

    switch (action.operationType) {
      case actionType.DELETE:
        this.deleteOperation(action, actionType.REDO);
        break;

      case actionType.CREATE:
        this.createOperation(action, actionType.REDO);
        break;

      case actionType.UPDATE:
        this.updateOperation(action, actionType.REDO);
        break;
    }
  };

  getFilteredTodos = () => {
    const todoList = this.getTodos();
    return this.filter.filterTodos(todoList);
  };

  //Used for Bulk Operations, where a user selects many todos at once and deletes them
  bulkDelete = (action, todos) => {
    this.server
      .deleteTodo(todos)
      .then(() => {
        helperFunctions.convertToList(todos).forEach(this.deleteTodo);
        this.addToHistory(action);
        this.resetSelection();
        this.onStateChange();
      })
      .catch(showSnackbar);
  };

  //Used for Bulk Operations, where a user selects many todos at once and updates them
  bulkUpdate = (action, todos) => {
    this.server
      .updateTodo(todos)
      .then(() => {
        helperFunctions.convertToList(todos).forEach(this.updateTodo);
        this.addToHistory(action);
        this.resetSelection();
        this.onStateChange();
      })
      .catch(showSnackbar);
  };

  //Used for adding a new Todo
  addNewTodo = (todo) => {
    todo = { id: this.currentTodoId, ...todo };
    this.incrementCurrentTodoId();

    const action = helperFunctions.createAction(actionType.CREATE, todo, todo);
    this.server
      .createTodo(todo)
      .then(() => {
        helperFunctions.convertToList(todo).forEach(this.addTodo);
        this.addToHistory(action);
        this.onStateChange();
      })
      .catch(showSnackbar);
  };

  //Used when a user deletes a todo
  deleteTodoHandler = (id) => {
    const todo = this.findTodoById(id);
    const action = helperFunctions.createAction(actionType.DELETE, todo, todo);
    this.server
      .deleteTodo(todo)
      .then(() => {
        helperFunctions.convertToList(todo).forEach(this.deleteTodo);
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
  updateTodoHandler = (updatedTodo, action) => {
    this.server
      .updateTodo(updatedTodo)
      .then(() => {
        helperFunctions.convertToList(updatedTodo).forEach(this.updateTodo);
        this.addToHistory(action);
        this.onStateChange();
      })
      .catch(showSnackbar);
  };

  //Used when a user completes/uncompletes a todo
  completeTodoHandler = (id) => {
    const oldTodo = this.findTodoById(id);
    const updatedTodo = helperFunctions.makeCopy(oldTodo);
    updatedTodo.isCompleted = !updatedTodo.isCompleted;
    const action = helperFunctions.createAction(
      actionType.UPDATE,
      oldTodo,
      updatedTodo
    );
    this.server
      .updateTodo(updatedTodo)
      .then(() => {
        helperFunctions.convertToList(updatedTodo).forEach(this.updateTodo);
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
        serverDatabase.forEach(this.addTodo);
      })
      .catch(showSnackbar);
  };
}
