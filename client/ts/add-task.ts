(() => {
  const ADD_TASK_API_BASE = "http://localhost:3600/api";

  interface TaskResponse {
    success: boolean;
    message: string;
    task?: {
      _id: string;
      title: string;
      description: string;
      dueDate: string;
      category: string;
      reminderChannels: string[];
      status: string;
    };
    error?: string;
  }

  const addTaskToken = localStorage.getItem("token");

  if (!addTaskToken) {
    window.location.href = "login.html";
    return;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });

  const taskForm = document.getElementById("taskForm") as HTMLFormElement | null;
  const messageBox = document.getElementById("messageBox") as HTMLDivElement | null;
  const pageTitle = document.getElementById("pageTitle") as HTMLHeadingElement | null;
  const pageSubtitle = document.getElementById("pageSubtitle") as HTMLParagraphElement | null;
  const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement | null;

  const urlParams = new URLSearchParams(window.location.search);
  const taskId = urlParams.get("id");
  const isEditMode = Boolean(taskId);

  const showMessage = (message: string, type: "success" | "error"): void => {
    if (!messageBox) return;
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
  };

  const convertToISOString = (localDateTime: string): string => {
    return new Date(localDateTime).toISOString();
  };

  const convertToLocalDateTime = (isoDate: string): string => {
    const date = new Date(isoDate);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  const populateForm = (task: NonNullable<TaskResponse["task"]>): void => {
    (document.getElementById("title") as HTMLInputElement).value = task.title || "";
    (document.getElementById("description") as HTMLTextAreaElement).value = task.description || "";
    (document.getElementById("dueDate") as HTMLInputElement).value = convertToLocalDateTime(task.dueDate);
    (document.getElementById("category") as HTMLSelectElement).value = task.category || "other";
    (document.getElementById("emailReminder") as HTMLInputElement).checked = task.reminderChannels.includes("email");
    (document.getElementById("browserReminder") as HTMLInputElement).checked = task.reminderChannels.includes("browser");
  };

  const loadTaskForEdit = async (): Promise<void> => {
    if (!taskId) return;

    try {
      const response = await fetch(`${ADD_TASK_API_BASE}/tasks/${taskId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${addTaskToken}`
        }
      });

      const data: TaskResponse = await response.json();

      if (data.success && data.task) {
        populateForm(data.task);

        if (pageTitle) pageTitle.textContent = "Edit Task";
        if (pageSubtitle) pageSubtitle.textContent = "Update your task details and reminder settings.";
        if (submitBtn) submitBtn.textContent = "Update Task";
      } else {
        showMessage(data.message || "Failed to load task.", "error");
      }
    } catch (error) {
      console.error(error);
      showMessage("Cannot load task details.", "error");
    }
  };

  if (taskForm) {
    taskForm.addEventListener("submit", async (e: Event) => {
      e.preventDefault();

      const title = (document.getElementById("title") as HTMLInputElement).value.trim();
      const description = (document.getElementById("description") as HTMLTextAreaElement).value.trim();
      const dueDateInput = (document.getElementById("dueDate") as HTMLInputElement).value;
      const category = (document.getElementById("category") as HTMLSelectElement).value;
      const emailReminder = (document.getElementById("emailReminder") as HTMLInputElement).checked;
      const browserReminder = (document.getElementById("browserReminder") as HTMLInputElement).checked;

      const reminderChannels: string[] = [];
      if (emailReminder) reminderChannels.push("email");
      if (browserReminder) reminderChannels.push("browser");

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

        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${addTaskToken}`
          },
          body: JSON.stringify(payload)
        });

        const data: TaskResponse = await response.json();

        if (data.success) {
          showMessage(
            isEditMode ? "Task updated successfully." : "Task created successfully.",
            "success"
          );

          if (!isEditMode) {
            taskForm.reset();
          } else {
            setTimeout(() => {
              window.location.href = "history.html";
            }, 1000);
          }
        } else {
          showMessage(data.message || "Failed to save task.", "error");
        }
      } catch (error) {
        console.error(error);
        showMessage("Cannot connect to backend server.", "error");
      }
    });
  }

  if (isEditMode) {
    loadTaskForEdit();
  }
})();