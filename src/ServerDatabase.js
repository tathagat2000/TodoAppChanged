// THIS IS MY SERVER SIDE DATABASE
// DONE
import { helperFunctions } from "./helperFunctions.js";

export class ServerDatabase {
  constructor() {
    this.database = this.loadDatabaseFromLocalStorage();
    this.serverFailProbability = 0;
  }

  isServerWorking = () => {
    const current = Math.random();
    if (current > this.serverFailProbability) {
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

  createTodoInServerDatabase = (todo) => {
    return new Promise((resolve, reject) => {
      if (this.isServerWorking()) {
        this.database.push(todo);
        this.saveDatabaseInLocalStorage();
        resolve("done");
      } else {
        reject("Could Not Add Todo");
      }
    });
  };

  bulkCreateTodoInServerDatabase = (listOfTodos) => {
    return new Promise((resolve, reject) => {
      if (this.isServerWorking()) {
        listOfTodos.forEach((todo) => {
          this.database.push(todo);
        });
        this.saveDatabaseInLocalStorage();
        resolve("done");
      } else {
        reject("Could Not Add Bulk Todos");
      }
    });
  };

  updateTodoInServerDatabase = (todo) => {
    return new Promise((resolve, reject) => {
      if (this.isServerWorking()) {
        const idx = this.findIndexOfTodoBasedOnId(todo.id);
        this.database[idx] = todo;
        this.saveDatabaseInLocalStorage();
        resolve("done");
      } else {
        reject("Could Not Update In Database");
      }
    });
  };

  deleteTodoInServerDatabase = (id) => {
    return new Promise((resolve, reject) => {
      if (this.isServerWorking()) {
        const idx = this.findIndexOfTodoBasedOnId(id);
        this.database.splice(idx, 1);
        this.saveDatabaseInLocalStorage();
        resolve("done");
      } else {
        reject("Could Not Delete Todo");
      }
    });
  };

  bulkDeleteTodoInServerDatabase = (listOfIds) => {
    return new Promise((resolve, reject) => {
      if (this.isServerWorking()) {
        listOfIds.forEach((id) => {
          const idx = this.findIndexOfTodoBasedOnId(id);
          this.database.splice(idx, 1);
        });
        this.saveDatabaseInLocalStorage();
        resolve("done");
      } else {
        reject("Could Not Delete Selected Todos");
      }
    });
  };

  bulkUpdateTodoInServerDatabase = (listOfTodos) => {
    return new Promise((resolve, reject) => {
      if (this.isServerWorking()) {
        listOfTodos.forEach((todo) => {
          const idx = this.findIndexOfTodoBasedOnId(todo.id);
          this.database[idx] = todo;
        });
        this.saveDatabaseInLocalStorage();
        resolve("done");
      } else {
        reject("Could Not Update Selected Todos");
      }
    });
  };
}
