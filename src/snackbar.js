export const showSnackbar = (message) => {
  const snackbar = document.querySelector("#snackbar");
  snackbar.innerHTML = message;
  snackbar.classList.add("show");
  setTimeout(() => {
    snackbar.className = snackbar.className.replace("show", "");
  }, 3000);
};
