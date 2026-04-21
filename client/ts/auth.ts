const AUTH_API_BASE = "http://localhost:3600/api";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  error?: string;
}

const signupForm = document.getElementById("signupForm") as HTMLFormElement | null;
const loginForm = document.getElementById("loginForm") as HTMLFormElement | null;

if (signupForm) {
  signupForm.addEventListener("submit", async (e: Event) => {
    e.preventDefault();

    const name = (document.getElementById("name") as HTMLInputElement).value.trim();
    const email = (document.getElementById("email") as HTMLInputElement).value.trim();
    const password = (document.getElementById("password") as HTMLInputElement).value.trim();

    try {
      const response = await fetch(`${AUTH_API_BASE}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "dashboard.html";
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      alert("Cannot connect to backend server.");
      console.error(error);
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e: Event) => {
    e.preventDefault();

    const email = (document.getElementById("email") as HTMLInputElement).value.trim();
    const password = (document.getElementById("password") as HTMLInputElement).value.trim();

    try {
      const response = await fetch(`${AUTH_API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "dashboard.html";
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      alert("Cannot connect to backend server.");
      console.error(error);
    }
  });
}