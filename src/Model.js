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

  findTodoById = (id) =>
    helperFunctions.makeCopy(this.todos.find((todo) => todo.id === id));

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
    if (type === actionType.UNDO) {
      this.decrementHistoryIndex();
    } else {
      this.incrementHistoryIndex();
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
    } else {
      return action.todoListBeforeUpdate;
    }
  };

  updateOperation = (action, type) => {
    const todoList = this.getTodoListFromHistory(action, type);

    this.server
      .updateTodo(todoList)
      .then(() => {
        helperFunctions.makeCopy(todoList).forEach(this.updateTodo);
        this.onStateChange();
        this.changeHistoryIndex(type);
      })
      .catch((err) => {
        showSnackbar(err);
      });
  };

  deleteOperation = (action, type) => {
    const todoList = this.getTodoListFromHistory(action, type);
    this.server
      .deleteTodo(todoList)
      .then(() => {
        todoList.forEach(this.deleteTodo);
        this.onStateChange();
        this.changeHistoryIndex(type);
      })
      .catch((err) => {
        showSnackbar(err);
      });
  };

  createOperation = (action, type) => {
    const todoList = this.getTodoListFromHistory(action, type);

    this.server
      .createTodo(todoList)
      .then(() => {
        helperFunctions.makeCopy(todoList).forEach(this.addTodo);
        this.onStateChange();
        this.changeHistoryIndex(type);
      })
      .catch((err) => {
        showSnackbar(err);
      });
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

  convertToList = (todos) => {
    if (Array.isArray(todos)) {
      return todos;
    } else {
      return [todos];
    }
  };

  getFilteredTodos = () => {
    const todoList = this.getTodos();
    return this.filter.filterTodos(todoList);
  };

  bulkDelete = (action, todos) => {
    const todoList = this.convertToList(todos);
    this.server
      .deleteTodo(todoList)
      .then(() => {
        todoList.forEach(this.deleteTodo);
        this.addToHistory(action);
        this.resetSelection();
        this.onStateChange();
      })
      .catch((err) => showSnackbar(err));
  };

  bulkUpdate = (action, todos) => {
    const todoList = this.convertToList(todos);
    this.server
      .updateTodo(todoList)
      .then(() => {
        helperFunctions.makeCopy(todoList).forEach(this.updateTodo);
        this.addToHistory(action);
        this.resetSelection();
        this.onStateChange();
      })
      .catch((err) => {
        showSnackbar(err);
      });
  };

  addNewTodo = (todo) => {
    todo = { id: this.currentTodoId, ...todo };
    this.incrementCurrentTodoId();
    const todoList = this.convertToList(todo);

    const action = helperFunctions.createAction(
      actionType.CREATE,
      todoList,
      todoList
    );
    this.server
      .createTodo(todoList)
      .then(() => {
        helperFunctions.makeCopy(todoList).forEach(this.addTodo);
        this.addToHistory(action);
        this.onStateChange();
      })
      .catch((err) => showSnackbar(err));
  };

  deleteTodoHandler = (id) => {
    const todo = this.findTodoById(id);
    const todoList = this.convertToList(todo);
    const action = helperFunctions.createAction(
      actionType.DELETE,
      todoList,
      todoList
    );
    this.server
      .deleteTodo(todoList)
      .then(() => {
        todoList.forEach(this.deleteTodo);
        this.addToHistory(action);
        this.onStateChange();
      })
      .catch((err) => showSnackbar(err));
  };

  selectTodoHandler = (id) => {
    this.toggleSelectedTodo(id);
    this.onStateChange();
  };

  updateTodoHandler = (todos, action) => {
    const todoList = this.convertToList(todos);
    this.server.updateTodo(todoList).then(() => {
      helperFunctions.makeCopy(todoList).forEach(this.updateTodo);
      this.addToHistory(action);
      this.onStateChange();
    });
  };

  completeTodoHandler = (id) => {
    const todo = this.findTodoById(id);
    const todoListBeforeUpdate = this.convertToList(todo);
    const updatedTodo = helperFunctions.makeCopy(todo);
    updatedTodo.isCompleted = !updatedTodo.isCompleted;
    const todoListAfterUpdate = this.convertToList(updatedTodo);
    const action = helperFunctions.createAction(
      actionType.UPDATE,
      todoListBeforeUpdate,
      todoListAfterUpdate
    );
    this.server
      .updateTodo(todoListAfterUpdate)
      .then(() => {
        helperFunctions.makeCopy(todoListAfterUpdate).forEach(this.updateTodo);
        this.addToHistory(action);
        this.onStateChange();
      })
      .catch((err) => showSnackbar(err));
  };

  initialize = () => {
    return this.server
      .getDatabase()
      .then((serverDatabase) => {
        serverDatabase.forEach(this.addTodo);
      })
      .catch((err) => {
        showSnackbar(err);
      });
  };
}
