import { dataAttributes } from "./constants.js";

const convertToList = (object) => {
  const objectCopy = helperFunctions.makeCopy(object);
  if (Array.isArray(object)) {
    return objectCopy;
  } else {
    return [objectCopy];
  }
};

const helperFunctions = {
  getTime: () => {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    return date + ", " + time;
  },

  createAction: (type, todosBeforeUpdate, todosAfterUpdate) => {
    return {
      operationType: type,
      todoListBeforeUpdate: convertToList(todosBeforeUpdate).map((todo) => ({
        ...todo,
      })),
      todoListAfterUpdate: convertToList(todosAfterUpdate).map((todo) => ({
        ...todo,
      })),
    };
  },

  getTodoIdFromEventPath: (eventPath) => {
    const todoElement = eventPath.find((element) => {
      return element.classList?.contains("todo");
    });
    return Number(todoElement.id);
  },

  findButtonClickedOnTodo: (eventPath) => {
    const allButtons = [
      dataAttributes.COMPLETE_BUTTON,
      dataAttributes.SELECT_BUTTON,
      dataAttributes.EDIT_BUTTON,
      dataAttributes.DELETE_BUTTON,
    ];

    return eventPath.find((element) => {
      return allButtons.includes(element.dataset?.button);
    });
  },

  //Makes copy of an object, or list of objects
  makeCopy: (item) => {
    //If it is an array
    if (Array.isArray(item)) {
      return item.map((obj) => ({ ...obj }));
    }
    // Else if it is an object
    else {
      return { ...item };
    }
  },
};

helperFunctions.convertToList = convertToList;
export { helperFunctions };
