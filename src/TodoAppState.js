import { CONSTANTS } from "./constants.js";
import { updateHeaderDate } from "./updateHeaderDate.js";
import { LocalDatabase } from "./LocalDatabase.js";
import { Page } from "./Page.js";
import { Filter } from "./filter.js";
import { ServerDatabase } from "./ServerDatabase.js";
import { History } from "./History.js";
import { BulkSelection } from "./BulkSelection.js";
import { Todo } from "./Todo.js";
import { showSnackbar } from "./snackbar.js";

export class TodoAppState {
  constructor() {
    this.filter = new Filter();
    this.serverDatabase = new ServerDatabase();
    this.localDatabase = new LocalDatabase(this.filter.filterDatabase);

    this.page = new Page(
      this.todoEventHandler,
      this.localDatabase.getFilteredDatabase,
      this.localDatabase.getSelectedTodoIds
    );

    this.history = new History(
      this.localDatabase,
      this.serverDatabase,
      this.page.render
    );

    this.bulkSelection = new BulkSelection(
      this.localDatabase,
      this.serverDatabase,
      this.history.addToHistory
    );

    this.initialize().then(() => {
      this.todo = new Todo(
        this.localDatabase,
        this.serverDatabase,
        this.page.render,
        this.history.addToHistory
      );
    });
  }

  todoEventHandler = (event) => {
    this.todo.eventHandler(event);
  };

  addFilterEventListener = () => {
    CONSTANTS.queriedElements.filterLogos.addEventListener("click", (event) => {
      this.filter.eventHandler(event);
      this.page.render();
    });
  };

  addHistoryEventListener = () => {
    document.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        this.history.undoHandler();
      }
    });

    document.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        this.history.redoHandler();
        event.preventDefault();
      }
    });
  };

  addBulkEventListener = () => {
    CONSTANTS.queriedElements.deleteSelection.addEventListener(
      "click",
      async (event) => {
        await this.bulkSelection.deleteInBulkHandler();
        this.page.render();
      }
    );
    CONSTANTS.queriedElements.completeSelection.addEventListener(
      "click",
      async (event) => {
        await this.bulkSelection.markSelectionInBulkHandler(1);
        this.page.render();
      }
    );

    CONSTANTS.queriedElements.incompleteSelection.addEventListener(
      "click",
      async (event) => {
        await this.bulkSelection.markSelectionInBulkHandler(0);
        this.page.render();
      }
    );
  };

  intializeLocalDatabase = () => {
    return this.localDatabase
      .copyServerDatabaseToLocalDatabase(this.serverDatabase.getDatabase)
      .then(() => {
        this.page.render();
      })
      .catch((err) => showSnackbar(err));
  };

  initialize = () => {
    updateHeaderDate();
    this.addFilterEventListener();
    this.addHistoryEventListener();
    this.addBulkEventListener();
    return this.intializeLocalDatabase();
  };
}
