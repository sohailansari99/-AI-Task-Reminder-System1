(() => {
  const AI_API_BASE = window.location.origin + "/api";

  interface UserData {
    _id: string;
    name: string;
    email: string;
  }

  interface CreatedTask {
    _id: string;
    title: string;
    description: string;
    dueDate: string;
    category: string;
    status: string;
    aiPriority: {
      level: string;
      score: number;
      reason: string;
    };
    reminderChannels: string[];
  }

  interface ChatResponse {
    success: boolean;
    message: string;
    aiReply: string;
    createdTasks: CreatedTask[];
    error?: string;
  }

  const aiToken = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (!aiToken) {
    window.location.href = "login.html";
    return;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });

  const registeredEmail = document.getElementById("registeredEmail");
  if (registeredEmail && userData) {
    const user: UserData = JSON.parse(userData);
    registeredEmail.textContent = user.email;
  }

  const chatForm = document.getElementById("chatForm") as HTMLFormElement | null;
  const chatInput = document.getElementById("chatInput") as HTMLInputElement | null;
  const chatMessages = document.getElementById("chatMessages") as HTMLDivElement | null;
  const createdTasksList = document.getElementById("createdTasksList") as HTMLDivElement | null;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const appendMessage = (text: string, sender: "user" | "assistant"): void => {
    if (!chatMessages) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;

    const bubbleDiv = document.createElement("div");
    bubbleDiv.className = "bubble";
    bubbleDiv.innerHTML = text.replace(/\n/g, "<br>");

    messageDiv.appendChild(bubbleDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const renderCreatedTasks = (tasks: CreatedTask[]): void => {
    if (!createdTasksList) return;

    if (!tasks.length) {
      createdTasksList.innerHTML = `<p class="placeholder-text">No AI-generated tasks yet.</p>`;
      return;
    }

    createdTasksList.innerHTML = tasks.map(task => `
      <div class="created-task">
        <h4>${task.title}</h4>
        <p>${task.description || "No description"}</p>
        <p><strong>Due:</strong> ${formatDate(task.dueDate)}</p>
        <p><strong>Priority:</strong> ${task.aiPriority?.level || "low"}</p>
        <p><strong>Reminder:</strong> ${(task.reminderChannels || []).join(", ")}</p>
      </div>
    `).join("");
  };

  if (chatForm && chatInput) {
    chatForm.addEventListener("submit", async (e: Event) => {
      e.preventDefault();

      const message = chatInput.value.trim();
      if (!message) return;

      appendMessage(message, "user");
      chatInput.value = "";

      try {
        const response = await fetch(`${AI_API_BASE}/chat/message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${aiToken}`
          },
          body: JSON.stringify({ message })
        });

        const data: ChatResponse = await response.json();

        if (data.success) {
          const taskCount = data.createdTasks?.length || 0;

          const extraNote =
            taskCount > 0
              ? `\n\nReminder email will be sent to your registered email address.`
              : "";

          appendMessage((data.aiReply || "AI response generated.") + extraNote, "assistant");
          renderCreatedTasks(data.createdTasks || []);
        } else {
          appendMessage(data.message || "Something went wrong.", "assistant");
        }
      } catch (error) {
        console.error(error);
        appendMessage("Cannot connect to backend server.", "assistant");
      }
    });
  }
})();