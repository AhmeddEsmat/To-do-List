function toggleTheme() {
  const body = document.querySelector("body");
  const categories = document.querySelector(".categories");
  body.classList.toggle("dark-mode");
  categories.classList.toggle("div-dark-mode");

  const tasksDashboard = document.querySelector(".tasks-dashboard");
  const taskChildren = tasksDashboard.children;
  Array.from(taskChildren).forEach((child) => {
    child.classList.toggle("div-dark-mode");
  });

  const Modal = document.querySelectorAll("dialog");
  Modal.forEach((modal) => {
    modal.classList.toggle("div-dark-mode");
  });
}

let isModalOpen = false;

function closeModal(modalSelector) {
  const header = document.querySelector("header");
  const main = document.querySelector("main");
  header.classList.toggle("blur");
  main.classList.toggle("blur");
  modalSelector.close();
  isModalOpen = false;
}

function openCategoryModal() {
  const modal = document.querySelector("dialog.modal");
  const header = document.querySelector("header");
  const main = document.querySelector("main");
  header.classList.toggle("blur");
  main.classList.toggle("blur");
  modal.showModal();
  isModalOpen = true;
}

function closeCategoryModal() {
  const modal = document.querySelector("dialog.modal");
  closeModal(modal);
}

function openTaskModal() {
  const modal = document.querySelector("dialog.task-modal");
  const header = document.querySelector("header");
  const main = document.querySelector("main");
  header.classList.toggle("blur");
  main.classList.toggle("blur");
  modal.showModal();
  isModalOpen = true;
}

function closeTaskModal() {
  const modal = document.querySelector("dialog.task-modal");
  closeModal(modal);
}

const modals = document.querySelectorAll("dialog");
modals.forEach((modal) => {
  modal.addEventListener("click", (e) => {
    var rect = modal.getBoundingClientRect();
    var isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;
    if (!isInDialog) {
      closeModal(modal);
    }
  });
});

document.body.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && isModalOpen) {
    closeTaskModal();
    const input = document.querySelector(".modal-input");
    if (input) {
      input.classList.remove("invalid");
    }
  }
});

const DEFAULT_CATEGORIES = {
  completed: {
    name: "Completed",
    color: "#4caf50",
  },
  urgent: {
    name: "Urgent",
    color: "#ff5252",
  },
  important: {
    name: "Important",
    color: "#ffc107",
  },
  later: {
    name: "Later",
    color: "#9c27b0",
  },
  toStudy: {
    name: "To Study",
    color: "#25a7b8",
  },
};

let categories = { ...DEFAULT_CATEGORIES };

let tasks = {};
taskId = 1;

let activeCategory = "";

function refreshCategories() {
  const categoryKeys = Object.keys(categories);
  const configurations = {
    "#category-view": {
      className: "category-view-button",
      onClick: (categoryKey) => () =>
        selectCategory(categoryKey, ".category-view-button", true),
    },
    "#category-modal": {
      className: "category-modal-button",
      HTML: ` <i class="fa-solid fa-trash-can"></i>`,
      onClick: (categoryKey) => () => deleteCategory(categoryKey),
    },
    "#task-modal": {
      className: "task-modal-button",
      onClick: (categoryKey) => () =>
        selectCategory(categoryKey, ".task-modal-button"),
    },
  };

  Object.entries(configurations).forEach(([selector, configuration]) => {
    let element = document.querySelector(selector);
    element.innerHTML = "";
    categoryKeys.forEach((categoryKey) => {
      let button = document.createElement("button");
      const category = categories[categoryKey];
      button.innerHTML = category.name + (configuration.HTML || "");
      button.style.backgroundColor = category.color;

      if (configuration.className) {
        button.classList.add(configuration.className);
      }

      button.dataset.categoryKey = categoryKey;
      button.addEventListener("click", configuration.onClick(categoryKey));

      element.appendChild(button);
    });
  });
}

refreshCategories();

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function selectCategory(categoryKey, selector, active) {
  const taskModalButtons = document.querySelectorAll(selector);
  taskModalButtons.forEach((button) => {
    if (button.dataset.categoryKey === categoryKey) {
      button.classList.add("active");
      activeCategory = categoryKey;
      if (active) {
        refreshTasks("active");
        selectActiveFooter(".active-button");
      }
    } else {
      button.classList.remove("active");
    }
  });
}

function addCategory() {
  const input = document.querySelector(".categories-modal-input");
  if (input.value.trim() == "") {
    input.classList.add("invalid");
    return;
  }
  input.classList.remove("invalid");
  const newCategoryKey = input.value;
  categories[newCategoryKey] = { name: input.value, color: getRandomColor() };
  console.log(categories);
  input.value = "";
  refreshCategories();
}

function deleteCategory(categoryKey) {
  delete categories[categoryKey];
  const taskIds = Object.keys(tasks);
  taskIds.forEach((taskId) => {
    if (tasks[taskId].category === categoryKey) {
      delete tasks[taskId];
    }
  });
  refreshTasks();
  refreshCategories();
}

function refreshTasks(filterType) {
  let taskIds = Object.keys(tasks);
  const taskList = document.querySelector(".tasks-list");
  if (filterType === "completed") {
    taskIds = taskIds.filter((taskId) => tasks[taskId].completed);
  }
  if (filterType === "active") {
    taskIds = taskIds.filter(
      (taskId) => tasks[taskId].category === activeCategory
    );
  }
  if (filterType === "updateOrder") {
    const taskElements = taskList.children;
    taskIds.forEach((taskId) => {
      const taskElement = document.querySelector(`.task-${taskId}`);
      const index = Array.from(taskElements).indexOf(taskElement);
      tasks[taskId].index = index;
    });
    const sortedTasks = Object.values(tasks).sort((a, b) => a.index - b.index);
    tasks = {};
    sortedTasks.forEach((task, index) => {
      tasks[index + 1] = { ...task };
    });
    taskIds = Object.keys(tasks);
  }
  activeCategory = "";
  const tasksCount = document.querySelector(".task-count");
  tasksCount.innerHTML = `${taskIds.length} task${
    taskIds.length > 1 ? "s" : ""
  }`;
  taskList.innerHTML = "";
  taskIds.forEach((taskId) => {
    const task = tasks[taskId];
    const taskElement = document.createElement("li");
    taskElement.classList.add("task");
    taskElement.classList.add(`task-${taskId}`);
    taskElement.draggable = true;
    taskElement.innerHTML = `
  <div class="task-items-container">
    <div class="description-actions-container">
      <div class="check-description-container">
        <label class="checkbox-label">
          <input type="checkbox" onclick="toggleChecked(${taskId})" class="task-checkbox" ${
      task.completed ? "checked" : ""
    } hidden />
          <span class="custom-checkbox"></span>
        </label>
        <p>${task.description}</p>
      </div>
      <div class="task-actions">
        <button class="task-category" style="background-color: ${
          categories[task.category].color
        }">${categories[task.category].name}</button>
        <button class="delete-task-button" onclick="deleteTask(${taskId})">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    </div>
      <div class="hr-container">
        <hr>
      </div>
  </div>
    `;
    taskList.appendChild(taskElement);
  });
}
function setupDragAndDrop() {
  const taskList = document.querySelector(".tasks-list");

  let draggedElement = null;

  taskList.addEventListener("dragstart", (e) => {
    draggedElement = e.target;
    e.target.classList.add("dragging");
  });

  taskList.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(taskList, e.clientY);
    if (afterElement == null) {
      taskList.appendChild(draggedElement);
    } else {
      taskList.insertBefore(draggedElement, afterElement);
    }
  });

  taskList.addEventListener("drop", (e) => {
    e.preventDefault();
    refreshTasks("updateOrder");
  });

  taskList.addEventListener("dragend", () => {
    draggedElement.classList.remove("dragging");
    draggedElement = null;
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".task:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

document.addEventListener("DOMContentLoaded", () => {
  setupDragAndDrop();
});

function addTask() {
  const input = document.querySelector(".tasks-modal-input");
  const selectedButton = document.querySelector(".task-modal-button.active");
  if (input.value.trim() == "") {
    input.classList.add("invalid");
    return;
  }
  if (!selectedButton) {
    return;
  }
  input.classList.remove("invalid");
  const clonedButton = selectedButton.cloneNode(true);
  clonedButton.innerHTML += `<button class="delete-task-button" onclick="deleteTask(${taskId})"> 
                                <i class="fa-solid fa-trash-can"></i>
                             </button>`;
  clonedButton.classList.add("task-modal-button");
  clonedButton.classList.remove("active");
  tasks[taskId++] = {
    description: input.value,
    category: selectedButton.dataset.categoryKey,
    completed: false,
  };
  removeHighlight();
  selectActiveFooter(".all-button");
  refreshTasks();
  input.value = "";
  selectedButton.classList.remove("active");
  closeTaskModal();
}

function deleteTask(taskId) {
  delete tasks[taskId];
  refreshTasks();
}

function deleteAllCompletedTasks() {
  const taskIds = Object.keys(tasks);
  taskIds.forEach((taskId) => {
    if (tasks[taskId].completed) {
      delete tasks[taskId];
    }
  });
  selectActiveFooter(".all-button");
  refreshTasks();
}

function toggleChecked(taskId) {
  tasks[taskId].completed = !tasks[taskId].completed;
  selectActiveFooter(".all-button");
  refreshTasks();
}

function removeHighlight() {
  const categoriesButtons = document.querySelectorAll(".category-view-button");
  categoriesButtons.forEach((button) => {
    button.classList.remove("active");
  });
}

function filterCompletedTasks() {
  removeHighlight();
  const taskIds = Object.keys(tasks);
  const completedTasks = {};
  taskIds.forEach((taskId) => {
    if (tasks[taskId].completed) {
      completedTasks[taskId] = tasks[taskId];
    }
  });
  refreshTasks("completed");
}

function filterAllTasks() {
  removeHighlight();
  refreshTasks();
}

function filterActiveCategoryTasks() {
  removeHighlight();
  refreshTasks("active");
}

function toggleTasksFooter() {
  const tasksListButtons = document.querySelectorAll(".footer-buttons button");
  tasksListButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tasksListButtons.forEach((button) => {
        button.classList.remove("footer-active");
      });
      button.classList.add("footer-active");
    });
  });
}
toggleTasksFooter();

function selectActiveFooter(selector) {
  const tasksListButtons = document.querySelectorAll(".footer-buttons button");
  const activeButton = document.querySelector(selector);
  tasksListButtons.forEach((button) => {
    button.classList.remove("footer-active");
  });
  activeButton.classList.add("footer-active");
}
