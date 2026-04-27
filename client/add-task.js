var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(() => {
    const ADD_TASK_API_BASE = window.location.origin + "/api";
    const addTaskToken = localStorage.getItem("token");
    if (!addTaskToken) {
        window.location.href = "login.html";
        return;
    }
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn === null || logoutBtn === void 0 ? void 0 : logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });
    const taskForm = document.getElementById("taskForm");
    const messageBox = document.getElementById("messageBox");
    const pageTitle = document.getElementById("pageTitle");
    const pageSubtitle = document.getElementById("pageSubtitle");
    const submitBtn = document.getElementById("submitBtn");
    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get("id");
    const isEditMode = Boolean(taskId);
    const showMessage = (message, type) => {
        if (!messageBox)
            return;
        messageBox.textContent = message;
        messageBox.className = `message-box ${type}`;
    };
    const convertToISOString = (localDateTime) => {
        return localDateTime;
    };

    const convertToLocalDateTime = (date) => {
        return date.slice(0, 16);
    };
    const populateForm = (task) => {
        document.getElementById("title").value = task.title || "";
        document.getElementById("description").value = task.description || "";
        document.getElementById("dueDate").value = convertToLocalDateTime(task.dueDate);
        document.getElementById("category").value = task.category || "other";
        document.getElementById("emailReminder").checked = task.reminderChannels.includes("email");
        document.getElementById("browserReminder").checked = task.reminderChannels.includes("browser");
    };
    const loadTaskForEdit = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!taskId)
            return;
        try {
            const response = yield fetch(`${ADD_TASK_API_BASE}/tasks/${taskId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${addTaskToken}`
                }
            });
            const data = yield response.json();
            if (data.success && data.task) {
                populateForm(data.task);
                if (pageTitle)
                    pageTitle.textContent = "Edit Task";
                if (pageSubtitle)
                    pageSubtitle.textContent = "Update your task details and reminder settings.";
                if (submitBtn)
                    submitBtn.textContent = "Update Task";
            }
            else {
                showMessage(data.message || "Failed to load task.", "error");
            }
        }
        catch (error) {
            console.error(error);
            showMessage("Cannot load task details.", "error");
        }
    });
    if (taskForm) {
        taskForm.addEventListener("submit", (e) => __awaiter(void 0, void 0, void 0, function* () {
            e.preventDefault();
            const title = document.getElementById("title").value.trim();
            const description = document.getElementById("description").value.trim();
            const dueDateInput = document.getElementById("dueDate").value;
            const category = document.getElementById("category").value;
            const emailReminder = document.getElementById("emailReminder").checked;
            const browserReminder = document.getElementById("browserReminder").checked;
            const reminderChannels = [];
            if (emailReminder)
                reminderChannels.push("email");
            if (browserReminder)
                reminderChannels.push("browser");
            if (!title || !dueDateInput) {
                showMessage("Title and due date are required.", "error");
                return;
            }
            if (reminderChannels.length === 0) {
                showMessage("Please select at least one reminder channel.", "error");
                return;
            }
            const payload = {
                title,
                description,
                dueDate: convertToISOString(dueDateInput),
                category,
                reminderChannels,
                aiGenerated: false
            };
            try {
                const endpoint = isEditMode
                    ? `${ADD_TASK_API_BASE}/tasks/${taskId}`
                    : `${ADD_TASK_API_BASE}/tasks`;
                const method = isEditMode ? "PUT" : "POST";
                const response = yield fetch(endpoint, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${addTaskToken}`
                    },
                    body: JSON.stringify(payload)
                });
                const data = yield response.json();
                if (data.success) {
                    showMessage(isEditMode ? "Task updated successfully." : "Task created successfully.", "success");
                    if (!isEditMode) {
                        taskForm.reset();
                    }
                    else {
                        setTimeout(() => {
                            window.location.href = "history.html";
                        }, 1000);
                    }
                }
                else {
                    showMessage(data.message || "Failed to save task.", "error");
                }
            }
            catch (error) {
                console.error(error);
                showMessage("Cannot connect to backend server.", "error");
            }
        }));
    }
    if (isEditMode) {
        loadTaskForEdit();
    }
})();
export { };
