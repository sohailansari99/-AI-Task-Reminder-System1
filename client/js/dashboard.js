"use strict";
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
    const DASHBOARD_API_BASE = "http://localhost:3600/api";
    const dashboardToken = localStorage.getItem("token");
    const dashboardUserData = localStorage.getItem("user");
    if (!dashboardToken) {
        window.location.href = "login.html";
        return;
    }
    if (dashboardUserData) {
        const user = JSON.parse(dashboardUserData);
        const userName = document.getElementById("userName");
        if (userName) {
            userName.textContent = user.name;
        }
    }
    const dashboardLogoutBtn = document.getElementById("logoutBtn");
    dashboardLogoutBtn === null || dashboardLogoutBtn === void 0 ? void 0 : dashboardLogoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };
    const renderRecentTasks = (tasks) => {
        const recentTasks = document.getElementById("recentTasks");
        if (!recentTasks)
            return;
        if (tasks.length === 0) {
            recentTasks.innerHTML = `
        <div class="empty-state">
          <p>No tasks found yet.</p>
        </div>
      `;
            return;
        }
        recentTasks.innerHTML = tasks.map(task => {
            var _a, _b;
            return `
      <div class="task-item">
        <div class="task-left">
          <h3>${task.title}</h3>
          <p>${task.description || "No description"} • ${formatDate(task.dueDate)}</p>
        </div>
        <div class="task-right">
          <span class="badge ${((_a = task.aiPriority) === null || _a === void 0 ? void 0 : _a.level) || "low"}">${((_b = task.aiPriority) === null || _b === void 0 ? void 0 : _b.level) || "low"}</span>
          <span class="badge">${task.status}</span>
        </div>
      </div>
    `;
        }).join("");
    };
    const fetchTasks = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${DASHBOARD_API_BASE}/tasks`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${dashboardToken}`
                }
            });
            const data = yield response.json();
            if (!data.success)
                return;
            const tasks = data.tasks || [];
            const totalTasks = document.getElementById("totalTasks");
            const pendingTasks = document.getElementById("pendingTasks");
            const completedTasks = document.getElementById("completedTasks");
            const highPriorityTasks = document.getElementById("highPriorityTasks");
            if (totalTasks)
                totalTasks.textContent = String(tasks.length);
            if (pendingTasks)
                pendingTasks.textContent = String(tasks.filter(t => t.status === "pending").length);
            if (completedTasks)
                completedTasks.textContent = String(tasks.filter(t => t.status === "completed").length);
            if (highPriorityTasks)
                highPriorityTasks.textContent = String(tasks.filter(t => { var _a; return ((_a = t.aiPriority) === null || _a === void 0 ? void 0 : _a.level) === "high"; }).length);
            renderRecentTasks(tasks.slice(0, 5));
        }
        catch (error) {
            console.error("Failed to fetch tasks", error);
        }
    });
    fetchTasks();
})();
