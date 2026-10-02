const STORAGE_KEY = "todos";
const btn = document.querySelector("#btn");
const nameInput = document.querySelector("#task-name");
const dateInput = document.querySelector("#due-date");
const todoArea = document.querySelector("#todos");
// Load tasks from localStorage, migrating the legacy string-only format.
const loadTodos = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
        return [];
    try {
        const data = JSON.parse(raw);
        if (!Array.isArray(data))
            return [];
        return data.flatMap((item) => {
            if (typeof item === "string") {
                // Legacy entry: a plain task name with no due date.
                return [{ id: 0, name: item, dueDate: "", completed: false }];
            }
            if (typeof item === "object" && item !== null) {
                const stored = item;
                return [{
                        id: typeof stored.id === "number" ? stored.id : 0,
                        name: typeof stored.name === "string" ? stored.name : "",
                        dueDate: typeof stored.dueDate === "string" ? stored.dueDate : "",
                        completed: stored.completed === true,
                    }];
            }
            return [];
        });
    }
    catch {
        return [];
    }
};
let todos = loadTodos();
// Make sure every task has a unique, positive id (legacy entries were stored without ids).
const maxId = todos.reduce((max, todo) => Math.max(max, todo.id), 0);
todos = todos.map((todo, index) => ({
    ...todo,
    id: todo.id > 0 ? todo.id : maxId + index + 1,
}));
const saveTodos = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
};
const formatDueDate = (isoDate) => {
    const date = new Date(`${isoDate}T00:00:00`);
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};
const isOverdue = (todo) => {
    if (todo.completed || todo.dueDate === "")
        return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(`${todo.dueDate}T00:00:00`);
    return dueDate < today;
};
const addTodo = () => {
    const name = nameInput.value.trim();
    if (name === "")
        return;
    todos.push({
        id: Date.now(),
        name,
        dueDate: dateInput.value,
        completed: false,
    });
    saveTodos();
    displayTodos();
    // Reset the form for the next task.
    nameInput.value = "";
    dateInput.value = "";
    nameInput.focus();
};
const toggleTodo = (id, completed) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo)
        return;
    todo.completed = completed;
    saveTodos();
    displayTodos();
};
const deleteTodo = (id) => {
    todos = todos.filter((t) => t.id !== id);
    saveTodos();
    displayTodos();
};
const displayTodos = () => {
    todoArea.innerHTML = "";
    if (todos.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-message";
        emptyMessage.textContent = "No tasks yet — add your first one above!";
        todoArea.appendChild(emptyMessage);
        return;
    }
    const list = document.createElement("ul");
    list.className = "todo-list";
    todos.forEach((todo) => {
        const item = document.createElement("li");
        item.className = "todo-item";
        if (todo.completed)
            item.classList.add("completed");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "checkbox";
        checkbox.checked = todo.completed;
        checkbox.addEventListener("change", () => {
            toggleTodo(todo.id, checkbox.checked);
        });
        const name = document.createElement("span");
        name.className = "task-name";
        name.textContent = todo.name;
        const dueDateLabel = document.createElement("span");
        dueDateLabel.className = "due-date";
        if (todo.dueDate !== "") {
            dueDateLabel.textContent = `Due ${formatDueDate(todo.dueDate)}`;
            if (isOverdue(todo))
                dueDateLabel.classList.add("overdue");
        }
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "✕";
        deleteButton.setAttribute("aria-label", `Delete task "${todo.name}"`);
        deleteButton.addEventListener("click", () => {
            deleteTodo(todo.id);
        });
        item.append(checkbox, name, dueDateLabel, deleteButton);
        list.appendChild(item);
    });
    todoArea.appendChild(list);
};
btn.addEventListener("click", addTodo);
// Pressing Enter inside the task name input also adds the task.
nameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter")
        addTodo();
});
// Display saved tasks as soon as the page loads.
displayTodos();
export {};
//# sourceMappingURL=logic.js.map