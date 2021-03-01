// THIS IS MY LOCAL DATABASE
//DONE
import { helperFunctions } from "./helperFunctions.js";
import { showSnackbar } from "./snackbar.js";

export class LocalDatabase {
  constructor(filterDatabase) {
    this.database = [];
    this.selectedTodos = [];
    this.filterDatabase = filterDatabase;
  }

  getFilteredDatabase = () => this.filterDatabase(this.getDatabase());

  getSelectedTodoIds = () => [...this.selectedTodos];

  findMaxId = () => {
    let maximumId = -1;
    this.database.forEach((todo) => (maximumId = Math.max(maximumId, todo.id)));
    return maximumId;
  };

  addToDataBase = (todo) => this.database.push(todo);

  findTodoBasedOnId = (id) =>
    helperFunctions.makeCopyOfObject(
      this.database.find((todo) => todo.id === id)
    );

  resetSelection = () => this.selectedTodos.splice(0);

  toggleSelectedTodo = (id) => {
    if (this.selectedTodos.includes(id)) {
      this.removeIdFromSelectedTodos(id);
    } else {
      this.addIdToSelectedTodos(id);
    }
  };

  removeIdFromSelectedTodos = (id) => {
    this.selectedTodos.splice(this.selectedTodos.indexOf(id), 1);
  };

  addIdToSelectedTodos = (id) => {
    this.selectedTodos.push(id);
  };

  sortDatabase = (Database) => {
    return Database.sort((todo1, todo2) => todo1.id - todo2.id);
  };

  getDatabase = () => {
    const copyOfDatabase = helperFunctions.makeCopyOfListOfObjects(
      this.database
    );
    return this.sortDatabase(copyOfDatabase);
  };

  findIndexOfTodoBasedOnId = (id) =>
    this.database.findIndex((todo) => todo.id === id);

  deleteFromDatabase = (id) => {
    const idx = this.findIndexOfTodoBasedOnId(id);

    this.database.splice(idx, 1);
  };

  getCurrentTodoData = (id, type) => this.findTodoBasedOnId(id)?.[type];

  updateToDatabase = (todoObject) => {
    const idx = this.findIndexOfTodoBasedOnId(todoObject.id);

    this.database[idx] = todoObject;
  };

  copyServerDatabaseToLocalDatabase = (getServerDatabase) => {
    return getServerDatabase()
      .then((serverDatabase) => {
        serverDatabase.forEach(this.addToDataBase);
      })
      .catch((err) => {
        showSnackbar(err);
      });
  };
}
