import { CONSTANTS } from "./constants.js";
import { helperFunctions } from "./helperFunctions.js";

export class BulkSelection {
  constructor(localDatabase, serverDatabase, addToHistory) {
    this.localDatabase = localDatabase;
    this.serverDatabase = serverDatabase;
    this.addToHistory = addToHistory;
  }

  getListOfSelectedTodoIds = () => {
    return this.localDatabase.getSelectedTodoIds();
  };

  getListOfSelectedTodoObjects = () => {
    return this.localDatabase
      .getSelectedTodoIds()
      .map(this.localDatabase.findTodoBasedOnId);
  };

  createBulkDeleteEvent = (listOfTodoIdsToBeDeleted) => {
    const event = {
      operationType: "bulkDelete",
    };

    const listOfTodoObjectsToBeDeleted = listOfTodoIdsToBeDeleted.map(
      this.localDatabase.findTodoBasedOnId
    );

    event.todoObjectList = listOfTodoObjectsToBeDeleted;

    return event;
  };

  deleteInBulkHandler = () => {
    const listOfTodoIdsToBeDeleted = this.getListOfSelectedTodoIds();

    if (listOfTodoIdsToBeDeleted.length === 0) return;

    const event = this.createBulkDeleteEvent(listOfTodoIdsToBeDeleted);

    return this.serverDatabase
      .bulkDeleteTodoInServerDatabase(listOfTodoIdsToBeDeleted)
      .then(() => {
        listOfTodoIdsToBeDeleted.forEach(this.localDatabase.deleteFromDatabase);
        this.localDatabase.resetSelection();
        this.addToHistory(event);
      })
      .catch((err) => {
        showSnackbar(err);
      });
  };

  createBulkUpdateEvent = (listOfTodosToBeChanged, value) => {
    const event = {
      operationType: "bulkUpdate",
    };

    event.todoObjectListBefore = helperFunctions.makeCopyOfListOfObjects(
      listOfTodosToBeChanged
    );

    event.todoObjectListAfter = listOfTodosToBeChanged.map((todo) => {
      const copy = helperFunctions.makeCopyOfObject(todo);
      copy.isCompleted = value;
      return copy;
    });

    return event;
  };

  markSelectionInBulkHandler = (value) => {
    const listOfTodosToBeChanged = this.getListOfSelectedTodoObjects();

    if (listOfTodosToBeChanged.length === 0) return;

    const event = this.createBulkUpdateEvent(listOfTodosToBeChanged, value);

    const serverCopyOfListOfTodos = helperFunctions.makeCopyOfListOfObjects(
      event.todoObjectListAfter
    );

    return this.serverDatabase
      .bulkUpdateTodoInServerDatabase(serverCopyOfListOfTodos)
      .then(() => {
        listOfTodosToBeChanged.forEach((todo) => {
          const localCopy = helperFunctions.makeCopyOfObject(todo);
          localCopy.isCompleted = value;
          this.localDatabase.updateToDatabase(localCopy);
        });
        this.localDatabase.resetSelection();
        this.addToHistory(event);
      })
      .catch((err) => {
        showSnackbar(err);
      });
  };
}
