import { CONSTANTS } from "./constants.js";
import { updateHeaderDate } from "./updateHeaderDate.js";
import { Page } from "./Page.js";
import { Model } from "./Model.js";
import { helperFunctions } from "./helperFunctions.js";

export class Controller {
  constructor() {
    this.model = new Model(this.render);
    this.page = new Page();
    this.initialize();
  }

  render = () => {
    const todoEventHandler = this.todoEventHandler;
    const listOfTodos = this.model.getFilteredTodos();
    const selectedTodoIds = this.model.interface.getSelectedTodoIds();
    this.page.render(todoEventHandler, listOfTodos, selectedTodoIds);
  };

  filterEventHandler = (event) => {
    const buttonClicked = event.path.find(
      (element) => element.tagName === "BUTTON"
    );

    if (buttonClicked) {
      this.model.filter.toggleFilterState(buttonClicked.id);
      this.render();
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
    const listOfTodosToBeDeleted = this.model.interface.getSelectedTodos();
    const event = helperFunctions.createEvent(
      "delete",
      listOfTodosToBeDeleted,
      listOfTodosToBeDeleted
    );
    if (listOfTodosToBeDeleted === 0) return;
    this.model.bulkDelete(event, listOfTodosToBeDeleted);
  };

  bulkUpdateHandler = (isCompleted) => {
    const listOfTodosBeforeUpdating = this.model.interface.getSelectedTodos();
    const listOfTodosAfterUpdating = this.model.interface
      .getSelectedTodos()
      .map((todo) => {
        todo.isCompleted = isCompleted;
        return todo;
      });
    const event = helperFunctions.createEvent(
      "update",
      listOfTodosBeforeUpdating,
      listOfTodosAfterUpdating
    );
    if (listOfTodosBeforeUpdating === 0) return;
    this.model.bulkUpdate(event, listOfTodosAfterUpdating);
  };

  eventHandlerForCreatingNewTodo = (event, text, urgency, category) => {
    const key = event.keyCode || event.which || 0;
    if (key === 13 && text) {
      const newTodoObject = this.createTodoObject(text, urgency, category);
      this.model.addNewTodo(newTodoObject);
      this.page.resetTodoInputValues();
    }
  };

  createTodoObject = (text, urgency, category) => {
    return {
      text,
      urgency,
      category,
      isCompleted: false,
      time: helperFunctions.getTime(),
    };
  };

  todoEventHandler = (event) => {
    const id = helperFunctions.getTodoIdFromEventPath(event.path);

    const button = helperFunctions.findButtonClickedOnTodo(event.path);

    switch (button?.dataset?.button) {
      case CONSTANTS.dataAttributes.COMPLETEBUTTON:
        this.model.completeTodoHandler(id);
        break;

      case CONSTANTS.dataAttributes.SELECTBUTTON:
        this.model.selectTodoHandler(id);
        break;

      case CONSTANTS.dataAttributes.EDITBUTTON:
        this.editTodoHandler(id);
        break;

      case CONSTANTS.dataAttributes.DELETEBUTTON:
        this.model.deleteTodoHandler(id);
        break;

      default:
        break;
    }
  };

  editTodoHandler = (id) => {
    const text = this.model.interface.getCurrentTodoData(id, "text");
    const urgency = this.model.interface.getCurrentTodoData(id, "urgency");
    const category = this.model.interface.getCurrentTodoData(id, "category");

    this.page.modal.show(text, urgency, category, id);
  };

  updateTodoHandler = (updatedText, updatedUrgency, updatedCategory, id) => {
    const todoBeforeUpdating = this.model.interface.findTodoBasedOnId(id);
    const todoListBeforeUpdating = [todoBeforeUpdating];
    const updatedTodo = { ...todoBeforeUpdating };
    updatedTodo.text = updatedText;
    updatedTodo.urgency = updatedUrgency;
    updatedTodo.category = updatedCategory;
    const todoListAfterUpdating = [updatedTodo];
    const event = helperFunctions.createEvent(
      "update",
      todoListBeforeUpdating,
      todoListBeforeUpdating
    );
    this.model.updateTodoHandler(todoListAfterUpdating, event);
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
