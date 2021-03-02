import { helperFunctions } from "./helperFunctions.js";
import { Server } from "./Server.js";
import { showSnackbar } from "./snackbar.js";

export class Interface {
  constructor() {
    this.todos = [];
    this.selectedTodoIds = [];
    this.server = new Server();
  }

  addTodo = (todo) => (this.todos = [...this.todos, { ...todo }]);

  updateTodo = (todo) => {
    const idx = this.findIndexOfTodoBasedOnId(todo.id);

    this.todos = this.todos
      .slice(0, idx)
      .concat({ ...todo }, this.todos.slice(idx + 1));
  };

  deleteTodo = (todo) => {
    const id = todo.id;
    this.todos = this.todos.filter((todo) => todo.id != id);
  };

  getSelectedTodoIds = () => [...this.selectedTodoIds];

  getSelectedTodos = () => this.selectedTodoIds.map(this.findTodoBasedOnId);

  findMaxTodoId = () => {
    let maximumId = -1;
    this.todos.forEach((todo) => (maximumId = Math.max(maximumId, todo.id)));
    return maximumId;
  };

  findTodoBasedOnId = (id) =>
    helperFunctions.makeCopyOfObject(this.todos.find((todo) => todo.id === id));

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
      (todoId) => todoId != id
    );
  };

  addToSelectedTodos = (id) => {
    this.selectedTodoIds = [...this.selectedTodoIds, id];
  };

  sortList = (list) => {
    return list.sort((todo1, todo2) => todo1.id - todo2.id);
  };

  getTodos = () => {
    const copyOfTodos = helperFunctions.makeCopyOfListOfObjects(this.todos);
    return this.sortList(copyOfTodos);
  };

  findIndexOfTodoBasedOnId = (id) =>
    this.todos.findIndex((todo) => todo.id === id);

  getCurrentTodoData = (id, type) => this.findTodoBasedOnId(id)?.[type];

  createTodoInDatabase = (listOfTodos) => {
    return this.server.createTodo(listOfTodos).then(() => {
      listOfTodos.forEach(this.addTodo);
    });
  };

  updateTodoInDatabase = (listOfTodos) => {
    return this.server.updateTodo(listOfTodos).then(() => {
      listOfTodos.forEach(this.updateTodo);
    });
  };

  deleteTodoInDatabase = (listOfTodos) => {
    return this.server.deleteTodo(listOfTodos).then(() => {
      listOfTodos.forEach(this.deleteTodo);
    });
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
