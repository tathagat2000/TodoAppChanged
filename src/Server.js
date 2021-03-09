import { helperFunctions } from "./helperFunctions.js";

export class Server {
  constructor() {
    this.database = this.loadDatabaseFromLocalStorage();
    this.FailProbability = 0;
  }

  isServerWorking = () => {
    const current = Math.random();
    if (current > this.FailProbability) {
      return true;
    }
    return false;
  };

  getDatabase = () => {
    return new Promise((resolve, reject) => {
      if (this.isServerWorking()) {
        resolve(helperFunctions.makeCopy(this.database));
      } else {
        reject("Please Refresh Again");
      }
    });
  };

  saveDatabaseInLocalStorage = () =>
    localStorage.setItem("todos", JSON.stringify(this.database));

  loadDatabaseFromLocalStorage = () =>
    JSON.parse(localStorage.getItem("todos")) || [];

  findIndexOfTodoById = (id) =>
    this.database.findIndex((todo) => todo.id === id);

  createTodo = (todos) => {
    const todoList = helperFunctions.convertToList(todos);
    return new Promise((resolve, reject) => {
      if (this.isServerWorking()) {
        const todoListCopy = helperFunctions.makeCopy(todoList);
        this.database = [...this.database, ...todoListCopy];
        this.saveDatabaseInLocalStorage();
        resolve("done");
      } else {
        reject("Could Not Add Bulk Todos");
      }
    });
  };

  deleteTodo = (todos) => {
    const todoList = helperFunctions.convertToList(todos);
    const todoIdsList = todoList.map((todo) => todo.id);
    return new Promise((resolve, reject) => {
      if (this.isServerWorking()) {
        this.database = this.database.filter(
          (todo) => !todoIdsList.includes(todo.id)
        );
        this.saveDatabaseInLocalStorage();
        resolve("done");
      } else {
        reject("Could Not Delete Selected Todos");
      }
    });
  };

  updateTodo = (todos) => {
    const todoList = helperFunctions.convertToList(todos);
    return new Promise((resolve, reject) => {
      if (this.isServerWorking()) {
        const databaseCopy = helperFunctions.makeCopy(this.database);
        todoList.forEach((todo) => {
          const index = this.findIndexOfTodoById(todo.id);
          databaseCopy[index] = { ...todo };
        });
        this.database = databaseCopy;
        this.saveDatabaseInLocalStorage();
        resolve("done");
      } else {
        reject("Could Not Update Selected Todos");
      }
    });
  };
}
