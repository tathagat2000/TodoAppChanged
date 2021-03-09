export const dataAttributes = {
  EDIT_BUTTON: "edit",
  DELETE_BUTTON: "delete",
  SELECT_BUTTON: "select",
  COMPLETE_BUTTON: "complete",
  TEXT: "text",
  TIME: "time",
  URGENCYICON: "urgencyIcon",
  CATEGORYICON: "categoryIcon",
};

export const filterIdToValue = {
  low: "low",
  medium: "medium",
  high: "high",
  personal: "personal",
  academic: "academic",
  social: "social",
};

export const valueToFilter = {
  low: "low",
  medium: "medium",
  high: "high",
  personal: "personal",
  academic: "academic",
  social: "social",
};

export const actionType = {
  REDO: "redo",
  UNDO: "undo",
  CREATE: "create",
  DELETE: "delete",
  UPDATE: "update",
};

export const defaultValue = {
  URGENCY: "low",
  CATEGORY: "personal",
};

export const iconClasses = {
  [valueToFilter.low]: ["grey", "fa", "fa-exclamation-triangle"],
  [valueToFilter.medium]: ["orange", "fa", "fa-exclamation-triangle"],
  [valueToFilter.high]: ["red", "fa", "fa-exclamation-triangle"],
  [valueToFilter.personal]: ["blue", "fa", "fa-user"],
  [valueToFilter.academic]: ["grey", "fa", "fa-book"],
  [valueToFilter.social]: ["pink", "fa", "fa-users"],
};
