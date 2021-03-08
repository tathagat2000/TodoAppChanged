import { View } from "./View.js";
import { Model } from "./Model.js";
import { helperFunctions } from "./helperFunctions.js";
import { dataAttributes, actionType, defaultValue } from "./constants.js";

export class Controller {
  constructor() {
    const callbacks = {
      completeTodo: this.completeTodoHandler,
      selectTodo: this.selectTodoHandler,
      editTodo: this.editTodoHandler,
      deleteTodo: this.deleteTodoHandler,
    };
    this.model = new Model(this.onStateChange);
    this.view = new View(callbacks);
    this.initialize();
  }

  onStateChange = () => {
    const todoList = this.model.getFilteredTodos();
    const selectedTodoIds = this.model.getSelectedTodoIds();
    this.view.render(todoList, selectedTodoIds);
  };

  completeTodoHandler = (id) => {
    const oldTodo = this.model.findTodoById(id);
    const updatedTodo = { ...oldTodo };
    updatedTodo.isCompleted = !updatedTodo.isCompleted;
    const action = helperFunctions.createAction(
      actionType.UPDATE,
      oldTodo,
      updatedTodo
    );

    this.model.completeTodoHandler(updatedTodo, action);
  };

  selectTodoHandler = (id) => {
    this.model.selectTodoHandler(id);
  };

  editTodoHandler = (id) => {
    const text = this.model.getCurrentTodoData(id, "text");
    const urgency = this.model.getCurrentTodoData(id, "urgency");
    const category = this.model.getCurrentTodoData(id, "category");
    this.view.showEditWindow(text, urgency, category, id);
  };

  deleteTodoHandler = (id) => {
    const todo = this.model.findTodoById(id);
    const action = helperFunctions.createAction(actionType.DELETE, todo, todo);

    this.model.deleteTodoHandler(todo, action);
  };

  filterEventHandler = (buttonClicked) => {
    this.model.filter.toggleFilterState(buttonClicked.id);
    this.onStateChange();
    this.view.changeLogoStyle(
      buttonClicked,
      this.model.filter.getFilterState()
    );
  };

  undoHandler = () => this.model.undoHandler();

  redoHandler = () => this.model.redoHandler();

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
    const todo = this.createTodoObject(text, urgency, category);
    this.model.incrementCurrentTodoId();
    const action = helperFunctions.createAction(actionType.CREATE, todo, todo);
    this.model.addNewTodo(todo, action);
    this.view.resetTodoInputValues();
  };

  createTodoObject = (
    text,
    urgency = defaultValue.URGENCY,
    category = defaultValue.CATEGORY
  ) => {
    return {
      id: this.model.getCurrentTodoId(),
      text,
      urgency,
      category,
      isCompleted: false,
      time: helperFunctions.getTime(),
    };
  };

  updateTodoHandler = (updatedText, updatedUrgency, updatedCategory, id) => {
    const oldTodo = this.model.findTodoById(id);
    const updatedTodo = { ...oldTodo };
    updatedTodo.text = updatedText;
    updatedTodo.urgency = updatedUrgency;
    updatedTodo.category = updatedCategory;

    const action = helperFunctions.createAction(
      actionType.UPDATE,
      oldTodo,
      updatedTodo
    );
    this.model.updateTodoHandler(updatedTodo, action);
  };

  initialize = () => {
    this.view.updateHeaderDate();
    this.view.addFilterEventListener(this.filterEventHandler);
    this.view.addUndoRedoEventListener(this.undoHandler, this.redoHandler);
    this.view.addBulkEventListeners(
      this.bulkUpdateHandler,
      this.bulkDeleteHandler
    );
    this.view.addEventListenerForCreatingNewTodo(this.createTodoEventHandler);
    this.view.addEventListenerForModal(this.updateTodoHandler);
  };
}
