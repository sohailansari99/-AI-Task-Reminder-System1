# 🚀 AI Task Reminder System

An intelligent full-stack productivity application that combines **AI-powered task management**, **automated reminders**, and **smart scheduling** to help users organize their daily activities efficiently.

---

## 🧠 Overview

The AI Task Reminder System allows users to interact using **natural language** to:

- Create reminders  
- Generate study plans  
- Manage tasks automatically  
- Get AI-based guidance  

It integrates **AI (via OpenRouter)** with a robust backend to deliver a seamless productivity experience.

---

## ✨ Key Features

### 🤖 AI Chat Assistant
- Understands natural language input  
- Provides intelligent responses using OpenRouter AI  
- Acts as a personal productivity assistant  

---

### ⏰ Smart Reminder System
- Create reminders using simple text  
- Supports flexible date & time parsing  
- Sends notifications via email & browser  

---

### 📚 AI Study Plan Generator
- Automatically generates multi-day study plans  
- Supports subjects like AI, DBMS, OS, Java, etc.  

---

### ⚡ Automatic Task Creation
- Converts user messages into structured tasks  
- Stores tasks in MongoDB  

---

### 🎯 Intelligent Priority System
- Assigns priority based on:
  - deadlines  
  - keywords  
  - task category  

---

### 🔐 Authentication System
- JWT-based login & registration  
- Protected routes  

---

### 🗂️ Chat History Management
- Stores user conversations  
- Retrieve and clear history  

---

### 🔄 Automation (Cron Jobs)
- Reminder scheduler  
- Priority updater  

---

## 🛠️ Tech Stack

### Backend
- Node.js  
- Express.js  

### Frontend
- HTML, CSS, JavaScript (Vanilla + TypeScript)

### Database
- MongoDB (Mongoose)

### AI Integration
- OpenRouter API  

### Tools
- JWT Authentication  
- Nodemailer  
- Node-Cron  

---

## 📂 Project Structure
AI-Task-Reminder/
├── client/
├── server/
│ └── src/
│ ├── config/
│ ├── controllers/
│ ├── routes/
│ ├── services/
│ ├── models/
│ ├── middleware/
│ ├── jobs/
│ └── utils/

## 📡 API Endpoints

### Chat

POST /api/chat/message
GET /api/chat/history
DELETE /api/chat/history

### Tasks

POST /api/tasks
GET /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id

### Auth

POST /api/auth/register
POST /api/auth/login

## 💡 Example Usage

### Create Reminder
"Set a reminder tomorrow at 8 PM for AI revision"
### Generate Study Plan
"Make a 3 day study plan for DBMS"
### AI Assistance
"How should I prepare for exams?"

## 🔐 Environment Variables

PORT=
MONGODB_URI=
JWT_SECRET=
EMAIL_USER=
EMAIL_PASS=
OPENROUTER_API_KEY=


---

## 🚀 Deployment

- Backend: Render  
- Database: MongoDB Atlas  

---

## 👨‍💻 Author

**Sohail Ansari**  
Full Stack Developer | AI Enthusiast  

---

## ⭐ Why This Project Stands Out

- Combines AI + Backend + Automation  
- Real-world productivity system  
- Clean architecture (MVC)  
- Deployment-ready  

---
