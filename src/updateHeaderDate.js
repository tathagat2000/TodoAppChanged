export const updateHeaderDate = () => {
  const currentDate = new Date().toDateString();
  document.querySelector("#date").innerHTML = currentDate;
};
