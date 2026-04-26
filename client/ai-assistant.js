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
    const AI_API_BASE = window.location.origin + "/api";
    const aiToken = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!aiToken) {
        window.location.href = "login.html";
        return;
    }
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn === null || logoutBtn === void 0 ? void 0 : logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });
    const registeredEmail = document.getElementById("registeredEmail");
    if (registeredEmail && userData) {
        const user = JSON.parse(userData);
        registeredEmail.textContent = user.email;
    }
    const chatForm = document.getElementById("chatForm");
    const chatInput = document.getElementById("chatInput");
    const chatMessages = document.getElementById("chatMessages");
    const createdTasksList = document.getElementById("createdTasksList");
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };
    const appendMessage = (text, sender) => {
        if (!chatMessages)
            return;
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${sender}`;
        const bubbleDiv = document.createElement("div");
        bubbleDiv.className = "bubble";
        bubbleDiv.innerHTML = text.replace(/\n/g, "<br>");
        messageDiv.appendChild(bubbleDiv);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };
    const renderCreatedTasks = (tasks) => {
        if (!createdTasksList)
            return;
        if (!tasks.length) {
            createdTasksList.innerHTML = `<p class="placeholder-text">No AI-generated tasks yet.</p>`;
            return;
        }
        createdTasksList.innerHTML = tasks.map(task => {
            var _a;
            return `
      <div class="created-task">
        <h4>${task.title}</h4>
        <p>${task.description || "No description"}</p>
        <p><strong>Due:</strong> ${formatDate(task.dueDate)}</p>
        <p><strong>Priority:</strong> ${((_a = task.aiPriority) === null || _a === void 0 ? void 0 : _a.level) || "low"}</p>
        <p><strong>Reminder:</strong> ${(task.reminderChannels || []).join(", ")}</p>
      </div>
    `;
        }).join("");
    };
    if (chatForm && chatInput) {
        chatForm.addEventListener("submit", (e) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            e.preventDefault();
            const message = chatInput.value.trim();
            if (!message)
                return;
            appendMessage(message, "user");
            chatInput.value = "";
            try {
                const response = yield fetch(`${AI_API_BASE}/chat/message`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${aiToken}`
                    },
                    body: JSON.stringify({ message })
                });
                const data = yield response.json();
                if (data.success) {
                    const taskCount = ((_a = data.createdTasks) === null || _a === void 0 ? void 0 : _a.length) || 0;
                    const extraNote = taskCount > 0
                        ? `\n\nReminder email will be sent to your registered email address.`
                        : "";
                    appendMessage((data.aiReply || "AI response generated.") + extraNote, "assistant");
                    renderCreatedTasks(data.createdTasks || []);
                }
                else {
                    appendMessage(data.message || "Something went wrong.", "assistant");
                }
            }
            catch (error) {
                console.error(error);
                appendMessage("Cannot connect to backend server.", "assistant");
            }
        }));
    }
})();
export {};
