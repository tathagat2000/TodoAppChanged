// THIS IS MY SERVER SIDE DATABASE
// DONE
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
        resolve(helperFunctions.makeCopyOfListOfObjects(this.database));
      } else {
        reject("Please Refresh Again");
      }
    });
  };

  saveDatabaseInLocalStorage = () =>
    localStorage.setItem("todos", JSON.stringify(this.database));

  loadDatabaseFromLocalStorage = () =>
    JSON.parse(localStorage.getItem("todos")) || [];

  findIndexOfTodoBasedOnId = (id) =>
    this.database.findIndex((todo) => todo.id === id);

  createTodo = (listOfTodos) => {
    return new Promise((resolve, reject) => {
      if (this.isServerWorking()) {
        const copyOfListOfTodos = listOfTodos.map((todo) => ({ ...todo }));
        this.database = [...this.database, ...copyOfListOfTodos];
        this.saveDatabaseInLocalStorage();
        resolve("done");
      } else {
        reject("Could Not Add Bulk Todos");
      }
    });
  };

  deleteTodo = (listOfTodos) => {
    const listOfTodoIds = listOfTodos.map((todo) => todo.id);
    return new Promise((resolve, reject) => {
      if (this.isServerWorking()) {
        this.database = this.database.filter(
          (todo) => !listOfTodoIds.includes(todo.id)
        );
        this.saveDatabaseInLocalStorage();
        resolve("done");
      } else {
        reject("Could Not Delete Selected Todos");
      }
    });
  };

  updateTodo = (listOfTodos) => {
    return new Promise((resolve, reject) => {
      if (this.isServerWorking()) {
        const databaseCopy = this.database.slice(0);
        listOfTodos.forEach((todo) => {
          const idx = this.findIndexOfTodoBasedOnId(todo.id);
          databaseCopy[idx] = { ...todo };
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
