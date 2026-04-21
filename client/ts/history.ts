(() => {
  const HISTORY_API_BASE = "http://localhost:3600/api";

  interface Task {
    _id: string;
    title: string;
    description: string;
    dueDate: string;
    category: string;
    status: string;
    reminderSent: boolean;
    aiGenerated: boolean;
    aiPriority: {
      level: string;
      score: number;
      reason: string;
    };
    createdAt: string;
    updatedAt: string;
  }

  interface HistoryResponse {
    success: boolean;
    count: number;
    history: Task[];
  }

  const historyToken = localStorage.getItem("token");

  if (!historyToken) {
    window.location.href = "login.html";
    return;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });

  const historyList = document.getElementById("historyList") as HTMLDivElement | null;
  const filterButtons = document.querySelectorAll(".filter-btn");

  let allTasks: Task[] = [];
  let currentFilter = "all";

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const markTaskCompleted = async (taskId: string): Promise<void> => {
    try {
      const response = await fetch(`${HISTORY_API_BASE}/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${historyToken}`
        },
        body: JSON.stringify({ status: "completed" })
      });

      const data = await response.json();

      if (data.success) {
        await fetchHistory();
        applyFilter(currentFilter);
      } else {
        alert(data.message || "Failed to update task status.");
      }
    } catch (error) {
      console.error("Failed to mark task completed", error);
      alert("Cannot connect to backend server.");
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    const confirmDelete = confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${HISTORY_API_BASE}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${historyToken}`
        }
      });

      const data = await response.json();

      if (data.success) {
        await fetchHistory();
        applyFilter(currentFilter);
      } else {
        alert(data.message || "Failed to delete task.");
      }
    } catch (error) {
      console.error("Failed to delete task", error);
      alert("Cannot connect to backend server.");
    }
  };

  const renderTasks = (tasks: Task[]): void => {
    if (!historyList) return;

    if (tasks.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <p>No task history found.</p>
        </div>
      `;
      return;
    }

    historyList.innerHTML = tasks.map(task => `
      <div class="task-card">
        <div class="task-left">
          <h3>${task.title}</h3>
          <p>${task.description || "No description"}</p>
          <p><strong>Due:</strong> ${formatDate(task.dueDate)}</p>
          <p><strong>Category:</strong> ${task.category}</p>
          <p><strong>Priority Reason:</strong> ${task.aiPriority?.reason || "No reason"}</p>
        </div>

        <div class="task-right">
          <span class="badge ${task.aiPriority?.level || "low"}">${task.aiPriority?.level || "low"}</span>
          <span class="badge ${task.status}">${task.status}</span>
          ${task.aiGenerated ? `<span class="badge ai">AI Generated</span>` : ""}
          <div class="action-buttons">
            ${
              task.status === "pending"
                ? `<button class="action-btn complete-btn" data-id="${task._id}">Mark Completed</button>`
                : ""
            }
            <button class="action-btn edit-btn" data-id="${task._id}">Edit</button>
            <button class="action-btn delete-btn" data-id="${task._id}">Delete</button>
          </div>
        </div>
      </div>
    `).join("");

    const completeButtons = document.querySelectorAll(".complete-btn");
    completeButtons.forEach(button => {
      button.addEventListener("click", async () => {
        const taskId = button.getAttribute("data-id");
        if (taskId) {
          await markTaskCompleted(taskId);
        }
      });
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
      button.addEventListener("click", async () => {
        const taskId = button.getAttribute("data-id");
        if (taskId) {
          await deleteTask(taskId);
        }
      });
    });
  };

  const applyFilter = (filter: string): void => {
    currentFilter = filter;
    let filteredTasks = allTasks;

    if (filter === "pending") {
      filteredTasks = allTasks.filter(task => task.status === "pending");
    } else if (filter === "completed") {
      filteredTasks = allTasks.filter(task => task.status === "completed");
    } else if (filter === "ai") {
      filteredTasks = allTasks.filter(task => task.aiGenerated === true);
    }

    renderTasks(filteredTasks);
  };

  const fetchHistory = async (): Promise<void> => {
    try {
      const response = await fetch(`${HISTORY_API_BASE}/tasks/history/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${historyToken}`
        }
      });

      const data: HistoryResponse = await response.json();

      if (!data.success) {
        renderTasks([]);
        return;
      }

      allTasks = data.history || [];
    } catch (error) {
      console.error("Failed to fetch task history", error);
      allTasks = [];
    }
  };

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      const filter = button.getAttribute("data-filter") || "all";
      applyFilter(filter);
    });
  });

  const init = async (): Promise<void> => {
    await fetchHistory();
    applyFilter("all");
  };

  init();
})();