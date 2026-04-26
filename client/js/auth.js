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
const AUTH_API_BASE = window.location.origin + "/api";
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
if (signupForm) {
    signupForm.addEventListener("submit", (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        try {
            const response = yield fetch(`${AUTH_API_BASE}/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });
            const data = yield response.json();
            if (data.success && data.token && data.user) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                window.location.href = "dashboard.html";
            }
            else {
                alert(data.error || data.message || "Signup failed");
            }
        }
        catch (error) {
            alert("Cannot connect to backend server.");
            console.error(error);
        }
    }));
}
if (loginForm) {
    loginForm.addEventListener("submit", (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        try {
            const response = yield fetch(`${AUTH_API_BASE}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });
            const data = yield response.json();
            if (data.success && data.token && data.user) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                window.location.href = "dashboard.html";
            }
            else {
                alert(data.error || data.message || "Login failed");
            }
        }
        catch (error) {
            alert("Cannot connect to backend server.");
            console.error(error);
        }
    }));
}
