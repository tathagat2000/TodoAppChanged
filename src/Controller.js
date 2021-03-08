import { View } from "./View.js";
import { Model } from "./Model.js";
import { helperFunctions } from "./helperFunctions.js";
import { dataAttributes, actionType, defaultValue } from "./constants.js";

export class Controller {
  constructor() {
    this.model = new Model(this.onStateChange);
    this.view = new View(this.todoEventHandler);
    this.initialize();
  }

  onStateChange = () => {
    const todoList = this.model.getFilteredTodos();
    const selectedTodoIds = this.model.getSelectedTodoIds();
    this.view.render(todoList, selectedTodoIds);
  };

  todoEventHandler = (event) => {
    const id = helperFunctions.getTodoIdFromEventPath(event.path);

    const button = helperFunctions.findButtonClickedOnTodo(event.path);

    switch (button?.dataset?.button) {
      case dataAttributes.COMPLETE_BUTTON:
        this.model.completeTodoHandler(id);
        break;

      case dataAttributes.SELECT_BUTTON:
        this.model.selectTodoHandler(id);
        break;

      case dataAttributes.EDIT_BUTTON:
        this.editTodoHandler(id);
        break;

      case dataAttributes.DELETE_BUTTON:
        this.model.deleteTodoHandler(id);
        break;
    }
  };

  filterEventHandler = (event) => {
    const buttonClicked = event.path.find(
      (element) => element.tagName === "BUTTON"
    );

    if (buttonClicked) {
      this.model.filter.toggleFilterState(buttonClicked.id);
      this.onStateChange();
      this.view.changeLogoStyle(
        buttonClicked,
        this.model.filter.getFilterState()
      );
    }
  };

  undoAndRedoEventHandler = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      this.model.undoHandler();
    } else if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "y"
    ) {
      this.model.redoHandler();
      event.preventDefault();
    }
  };

  bulkDeleteHandler = () => {
    const todosToBeDeleted = this.model.getSelectedTodos();
    const action = helperFunctions.createAction(
      actionType.DELETE,
      todosToBeDeleted,
      todosToBeDeleted
    );
    if (todosToBeDeleted.length === 0) {
      return;
    }
    this.model.bulkDelete(action, todosToBeDeleted);
  };

  bulkUpdateHandler = (isCompleted) => {
    const todosBeforeUpdating = this.model.getSelectedTodos();
    const todosAfterUpdating = this.model.getSelectedTodos().map((todo) => {
      const todoCopy = { ...todo, isCompleted };
      return todoCopy;
    });
    const action = helperFunctions.createAction(
      actionType.UPDATE,
      todosBeforeUpdating,
      todosAfterUpdating
    );
    if (todosBeforeUpdating.length === 0) {
      return;
    }
    this.model.bulkUpdate(action, todosAfterUpdating);
  };

  createTodoEventHandler = (event, text, urgency, category) => {
    const key = event.keyCode || event.which || 0;
    if (key === 13 && text) {
      const todo = this.createTodoObject(text, urgency, category);
      this.model.addNewTodo(todo);
      this.view.resetTodoInputValues();
    }
  };

  createTodoObject = (
    text,
    urgency = defaultValue.URGENCY,
    category = defaultValue.CATEGORY
  ) => {
    return {
      text,
      urgency,
      category,
      isCompleted: false,
      time: helperFunctions.getTime(),
    };
  };

  editTodoHandler = (id) => {
    const text = this.model.getCurrentTodoData(id, "text");
    const urgency = this.model.getCurrentTodoData(id, "urgency");
    const category = this.model.getCurrentTodoData(id, "category");

    this.view.modal.show(text, urgency, category, id);
  };

  updateTodoHandler = (updatedText, updatedUrgency, updatedCategory, id) => {
    const oldTodo = this.model.findTodoById(id);
    const updatedTodo = { ...oldTodo };
    updatedTodo.text = updatedText;
    updatedTodo.urgency = updatedUrgency;
    updatedTodo.category = updatedCategory;

    const event = helperFunctions.createAction(
      actionType.UPDATE,
      oldTodo,
      updatedTodo
    );
    this.model.updateTodoHandler(updatedTodo, event);
  };

  initialize = () => {
    this.view.updateHeaderDate();
    this.view.addFilterEventListener(this.filterEventHandler);
    this.view.addHistoryEventListener(this.undoAndRedoEventHandler);
    this.view.addBulkEventListeners(
      this.bulkUpdateHandler,
      this.bulkDeleteHandler
    );
    this.view.addEventListenerForCreatingNewTodo(this.createTodoEventHandler);
    this.view.modal.addEventListenerToSave(this.updateTodoHandler);
    this.view.modal.addEventListenerToClose();
  };
}
