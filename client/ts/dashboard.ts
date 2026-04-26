export {}
(() => {
  const DASHBOARD_API_BASE = window.location.origin + "/api";

  interface User {
    _id: string;
    name: string;
    email: string;
  }

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
  }

  interface TaskResponse {
    success: boolean;
    count: number;
    tasks: Task[];
  }

  const dashboardToken = localStorage.getItem("token");
  const dashboardUserData = localStorage.getItem("user");

  if (!dashboardToken) {
    window.location.href = "login.html";
    return;
  }

  if (dashboardUserData) {
    const user: User = JSON.parse(dashboardUserData);
    const userName = document.getElementById("userName");
    if (userName) {
      userName.textContent = user.name;
    }
  }

  const dashboardLogoutBtn = document.getElementById("logoutBtn");
  dashboardLogoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const renderRecentTasks = (tasks: Task[]): void => {
    const recentTasks = document.getElementById("recentTasks");
    if (!recentTasks) return;

    if (tasks.length === 0) {
      recentTasks.innerHTML = `
        <div class="empty-state">
          <p>No tasks found yet.</p>
        </div>
      `;
      return;
    }

    recentTasks.innerHTML = tasks.map(task => `
      <div class="task-item">
        <div class="task-left">
          <h3>${task.title}</h3>
          <p>${task.description || "No description"} • ${formatDate(task.dueDate)}</p>
        </div>
        <div class="task-right">
          <span class="badge ${task.aiPriority?.level || "low"}">${task.aiPriority?.level || "low"}</span>
          <span class="badge">${task.status}</span>
        </div>
      </div>
    `).join("");
  };

  const fetchTasks = async (): Promise<void> => {
    try {
      const response = await fetch(`${DASHBOARD_API_BASE}/tasks`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${dashboardToken}`
        }
      });

      const data: TaskResponse = await response.json();

      if (!data.success) return;

      const tasks = data.tasks || [];

      const totalTasks = document.getElementById("totalTasks");
      const pendingTasks = document.getElementById("pendingTasks");
      const completedTasks = document.getElementById("completedTasks");
      const highPriorityTasks = document.getElementById("highPriorityTasks");

      if (totalTasks) totalTasks.textContent = String(tasks.length);
      if (pendingTasks) pendingTasks.textContent = String(tasks.filter(t => t.status === "pending").length);
      if (completedTasks) completedTasks.textContent = String(tasks.filter(t => t.status === "completed").length);
      if (highPriorityTasks) highPriorityTasks.textContent = String(tasks.filter(t => t.aiPriority?.level === "high").length);

      renderRecentTasks(tasks.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  };

  fetchTasks();
})();