import { CONSTANTS } from "./constants.js";

export const updateHeaderDate = () => {
  const currentDate = new Date().toDateString();
  CONSTANTS.queriedElements.headerDate.innerHTML = currentDate;
};
