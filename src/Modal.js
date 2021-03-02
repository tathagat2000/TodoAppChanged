const indexOfCategory = (category) => {
  const index = {
    personal: 0,
    academic: 1,
    social: 2,
  };

  return index[category];
};

const indexOfUrgency = (urgency) => {
  const index = {
    low: 0,
    medium: 1,
    high: 2,
  };

  return index[urgency];
};

export class Modal {
  constructor() {
    this.currentTodoIdOpened = 0;
  }

  show = (text, urgency, category, id) => {
    this.currentTodoIdOpened = id;
    document.querySelector("#updatedAddTodo").value = text;
    document.querySelector("#updatedUrgency").selectedIndex = indexOfUrgency(
      urgency
    );
    document.querySelector("#updatedCategory").selectedIndex = indexOfCategory(
      category
    );
    document.querySelector("#myModal").style.display = "flex";
  };

  close = () => {
    document.querySelector("#myModal").style.display = "none";
  };

  save = (updateEventHandler) => {
    const updatedTextValue = document.querySelector("#updatedAddTodo").value;
    const updatedUrgencyValue = document.querySelector("#updatedUrgency").value;
    const updatedCategoryValue = document.querySelector("#updatedCategory")
      .value;
    updateEventHandler(
      updatedTextValue,
      updatedUrgencyValue,
      updatedCategoryValue,
      this.currentTodoIdOpened
    );
  };

  addEventListenerToClose = () => {
    document.querySelector("#cancel").addEventListener("click", this.close);
  };

  addEventListenerToSave = (updateEventHandler) => {
    document.querySelector("#save").addEventListener("click", () => {
      this.save(updateEventHandler);
      this.close();
    });
  };
}
