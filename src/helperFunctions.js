import { CONSTANTS } from "./constants.js";

const helperFunctions = {
  getTime: () => {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    return date + ", " + time;
  },

  resetTodoInputValues: () => {
    CONSTANTS.queriedElements.todoInput.value = "";
    CONSTANTS.queriedElements.urgency.selectedIndex = 0;
    CONSTANTS.queriedElements.category.selectedIndex = 0;
  },

  createEvent: (type, todoObjectListBefore, todoObjectListAfter) => {
    return {
      operationType: type,
      todoObjectListBefore: todoObjectListBefore.map((todo) => ({ ...todo })),
      todoObjectListAfter: todoObjectListAfter.map((todo) => ({ ...todo })),
    };
  },

  getTodoIdFromEventPath: (eventPath) => {
    for (const element of eventPath) {
      if (element.classList?.contains("todo")) {
        return Number(element.id);
      }
    }
  },

  findButtonClickedOnTodo: (eventPath) => {
    const allButtons = [
      CONSTANTS.dataAttributes.COMPLETEBUTTON,
      CONSTANTS.dataAttributes.SELECTBUTTON,
      CONSTANTS.dataAttributes.EDITBUTTON,
      CONSTANTS.dataAttributes.DELETEBUTTON,
    ];

    return eventPath.find((element) => {
      return allButtons.includes(element.dataset?.button);
    });
  },

  makeCopyOfObject: (obj) => ({ ...obj }),
};

helperFunctions.makeCopyOfListOfObjects = (list) => {
  return list.map(helperFunctions.makeCopyOfObject);
};

export { helperFunctions };
