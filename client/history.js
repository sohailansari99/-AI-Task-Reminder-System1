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
    const HISTORY_API_BASE = window.location.origin + "/api";
    const historyToken = localStorage.getItem("token");
    if (!historyToken) {
        window.location.href = "login.html";
        return;
    }
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn === null || logoutBtn === void 0 ? void 0 : logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });
    const historyList = document.getElementById("historyList");
    const filterButtons = document.querySelectorAll(".filter-btn");
    let allTasks = [];
    let currentFilter = "all";
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };
    const markTaskCompleted = (taskId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${HISTORY_API_BASE}/tasks/${taskId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${historyToken}`
                },
                body: JSON.stringify({ status: "completed" })
            });
            const data = yield response.json();
            if (data.success) {
                yield fetchHistory();
                applyFilter(currentFilter);
            }
            else {
                alert(data.message || "Failed to update task status.");
            }
        }
        catch (error) {
            console.error("Failed to mark task completed", error);
            alert("Cannot connect to backend server.");
        }
    });
    const deleteTask = (taskId) => __awaiter(void 0, void 0, void 0, function* () {
        const confirmDelete = confirm("Are you sure you want to delete this task?");
        if (!confirmDelete)
            return;
        try {
            const response = yield fetch(`${HISTORY_API_BASE}/tasks/${taskId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${historyToken}`
                }
            });
            const data = yield response.json();
            if (data.success) {
                yield fetchHistory();
                applyFilter(currentFilter);
            }
            else {
                alert(data.message || "Failed to delete task.");
            }
        }
        catch (error) {
            console.error("Failed to delete task", error);
            alert("Cannot connect to backend server.");
        }
    });
    const renderTasks = (tasks) => {
        if (!historyList)
            return;
        if (tasks.length === 0) {
            historyList.innerHTML = `
        <div class="empty-state">
          <p>No task history found.</p>
        </div>
      `;
            return;
        }
        historyList.innerHTML = tasks.map(task => {
            var _a, _b, _c;
            return `
      <div class="task-card">
        <div class="task-left">
          <h3>${task.title}</h3>
          <p>${task.description || "No description"}</p>
          <p><strong>Due:</strong> ${formatDate(task.dueDate)}</p>
          <p><strong>Category:</strong> ${task.category}</p>
          <p><strong>Priority Reason:</strong> ${((_a = task.aiPriority) === null || _a === void 0 ? void 0 : _a.reason) || "No reason"}</p>
        </div>

        <div class="task-right">
          <span class="badge ${((_b = task.aiPriority) === null || _b === void 0 ? void 0 : _b.level) || "low"}">${((_c = task.aiPriority) === null || _c === void 0 ? void 0 : _c.level) || "low"}</span>
          <span class="badge ${task.status}">${task.status}</span>
          ${task.aiGenerated ? `<span class="badge ai">AI Generated</span>` : ""}
          <div class="action-buttons">
            ${task.status === "pending"
                ? `<button class="action-btn complete-btn" data-id="${task._id}">Mark Completed</button>`
                : ""}
            <button class="action-btn edit-btn" data-id="${task._id}">Edit</button>
            <button class="action-btn delete-btn" data-id="${task._id}">Delete</button>
          </div>
        </div>
      </div>
    `;
        }).join("");
        const completeButtons = document.querySelectorAll(".complete-btn");
        completeButtons.forEach(button => {
            button.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
                const taskId = button.getAttribute("data-id");
                if (taskId) {
                    yield markTaskCompleted(taskId);
                }
            }));
        });
        const editButtons = document.querySelectorAll(".edit-btn");
        editButtons.forEach(button => {
            button.addEventListener("click", () => {
                const taskId = button.getAttribute("data-id");
                if (taskId) {
                    window.location.href = `add-task.html?id=${taskId}`;
                }
            });
        });
        const deleteButtons = document.querySelectorAll(".delete-btn");
        deleteButtons.forEach(button => {
            button.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
                const taskId = button.getAttribute("data-id");
                if (taskId) {
                    yield deleteTask(taskId);
                }
            }));
        });
    };
    const applyFilter = (filter) => {
        currentFilter = filter;
        let filteredTasks = allTasks;
        if (filter === "pending") {
            filteredTasks = allTasks.filter(task => task.status === "pending");
        }
        else if (filter === "completed") {
            filteredTasks = allTasks.filter(task => task.status === "completed");
        }
        else if (filter === "ai") {
            filteredTasks = allTasks.filter(task => task.aiGenerated === true);
        }
        renderTasks(filteredTasks);
    };
    const fetchHistory = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${HISTORY_API_BASE}/tasks/history/all`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${historyToken}`
                }
            });
            const data = yield response.json();
            if (!data.success) {
                renderTasks([]);
                return;
            }
            allTasks = data.history || [];
        }
        catch (error) {
            console.error("Failed to fetch task history", error);
            allTasks = [];
        }
    });
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            const filter = button.getAttribute("data-filter") || "all";
            applyFilter(filter);
        });
    });
    const init = () => __awaiter(void 0, void 0, void 0, function* () {
        yield fetchHistory();
        applyFilter("all");
    });
    init();
})();
export {};
