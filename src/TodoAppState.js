import { updateHeaderDate } from "./updateHeaderDate.js";
import { Page } from "./Page.js";
import { Model } from "./Model.js";
import { helperFunctions } from "./helperFunctions.js";
import { dataAttributes } from "./constants.js";
import { actionType } from "./constants.js";
import { defaultValue } from "./constants.js";

export class Controller {
  constructor() {
    this.model = new Model(this.onStateChange);
    this.page = new Page();
    this.initialize();
  }

  onStateChange = () => {
    const todoEventHandler = this.todoEventHandler;
    const todoList = this.model.getFilteredTodos();
    const selectedTodoIds = this.model.getSelectedTodoIds();
    this.page.render(todoEventHandler, todoList, selectedTodoIds);
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
      this.page.changeLogoStyle(
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
    const event = helperFunctions.createAction(
      actionType.DELETE,
      todosToBeDeleted,
      todosToBeDeleted
    );
    if (todosToBeDeleted.length === 0) {
      return;
    }
    this.model.bulkDelete(event, todosToBeDeleted);
  };

  bulkUpdateHandler = (isCompleted) => {
    const todosBeforeUpdating = this.model.getSelectedTodos();
    const todosAfterUpdating = this.model.getSelectedTodos().map((todo) => {
      todo.isCompleted = isCompleted;
      return todo;
    });
    const event = helperFunctions.createAction(
      actionType.UPDATE,
      todosBeforeUpdating,
      todosAfterUpdating
    );
    if (todosBeforeUpdating.length === 0) {
      return;
    }
    this.model.bulkUpdate(event, todosAfterUpdating);
  };

  eventHandlerForCreatingNewTodo = (event, text, urgency, category) => {
    const key = event.keyCode || event.which || 0;
    if (key === 13 && text) {
      const todo = this.createTodoObject(text, urgency, category);
      this.model.addNewTodo(todo);
      this.page.resetTodoInputValues();
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

    this.page.modal.show(text, urgency, category, id);
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
    updateHeaderDate();
    this.page.addFilterEventListener(this.filterEventHandler);
    this.page.addHistoryEventListener(this.undoAndRedoEventHandler);
    this.page.addBulkEventListeners(
      this.bulkUpdateHandler,
      this.bulkDeleteHandler
    );
    this.page.addEventListenerForCreatingNewTodo(
      this.eventHandlerForCreatingNewTodo
    );
    this.page.modal.addEventListenerToSave(this.updateTodoHandler);
    this.page.modal.addEventListenerToClose();
  };
}
