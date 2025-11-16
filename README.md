🏨 Smart Hotel System
---------------------

This repository contains the foundations of a **Smart Hotel System**, built around three modular components:

*   **AI Concierge** – an AI-powered guest-facing assistant.
    
*   **Tasks API** – a Node.js + Express REST service for hotel tasks, backed by Supabase.
    
*   **Back Office Dashboard** – a web-based dashboard for hotel staff.

🚀 Fast Start

This quick guide helps you run all three components of the Smart Hotel System in just a few minutes.

1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

2️⃣ Start the AI Concierge
```bash
cd ai_concierge
npm install
```

Create an .env file:
```bash
OPENAI_API_KEY=your_openai_api_key
```

Run the web interface:

npm run web


Or run the CLI version:
```bash
npm run chat
```
3️⃣ Start the Tasks API
```bash
cd tasks_api
npm install
```

Create .env:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
```

Start the server:
```bash
npm start
```

API default URL:
```arduino
http://localhost:3001
```
4️⃣ Start the Back Office Dashboard

From the project root:
```bash
cd back_office
npx serve .
```

Open:

http://localhost:3000/home.html

✔ You're Ready!

You now have:

AI Concierge → running and accepting guest requests

Tasks API → operational backend connected to Supabase

Back Office → dashboard UI for hotel staff

The system is fully modular — each part can run alone or together.
    

Each component lives in its own folder and can be developed and deployed independently.

📁 Project Structure
--------------------

```text
.
├── ai_concierge/
│   └── # AI-powered concierge service (OpenAI Agents, Express/TS)
├── tasks_api/
│   └── # REST API for Tasks table (Node.js, Express, Supabase)
└── back_office/
    └── # Static operational dashboard for hotel staff (HTML/JS/CSS)
```

1️⃣ AI Concierge (ai\_concierge/)
---------------------------------

The **AI Concierge** provides a conversational interface for hotel guests. It is built with TypeScript and integrates the OpenAI Agents SDK, with both CLI and web-based interfaces available.

### ⚙️ Tech Stack

*   **Runtime:** Node.js
    
*   **Language:** TypeScript
    
*   **Framework:** Express
    
*   **AI:** OpenAI Agents SDK
    
*   **UI:** Simple web UI (static assets in public/)
    

### 🗂️ Current Contents

**Folder/FileDescription**package.json, tsconfig.jsonTypeScript + Node.js config.src/Main TypeScript source code:    agent/Agent configuration and tools integration.    server/Server setup and routing for chat endpoints.    tools/Domain-specific tools (e.g., housekeeping, spa, etc.).data/JSON data for menus, events, activity hours, etc.public/Static web UI (HTML, JS, CSS) for the chat interface.README.md, QUICKSTART.md, etc.Documentation files.

### 🚀 Setup & Run

1.  Bashcd ai\_conciergenpm install
    
2.  PlaintextOPENAI\_API\_KEY=your\_openai\_api\_key
    
3.  Bashnpm run web
    
4.  Bashnpm run chat_(Exact scripts and ports are defined in ai\_concierge/package.json.)_
    

2️⃣ Tasks API (tasks\_api/)
---------------------------

The **Tasks API** is a Node.js + Express REST service that exposes hotel task data stored in **Supabase**.

### ⚙️ Tech Stack

*   **Runtime:** Node.js
    
*   **Framework:** Express
    
*   **Database:** Supabase JavaScript client
    
*   **Utilities:** dotenv, CORS
    

### 🗂️ Current Contents

*   **server.js**: Express app entrypoint (GET /health, mounts tasks router at /api/tasks).
    
*   **routes/tasks.js**: All task-related routes (CRUD operations).
    
*   **supabaseClient.js**: Supabase client setup.
    
*   **.env**: Local configuration file (not to be committed).
    
*   **package.json**: Dependencies and scripts.

## 📊 Tasks Table Schema (SQL)

```sql
CREATE TABLE Tasks (
  task_id               SERIAL PRIMARY KEY,
  room_number           TEXT NOT NULL,
  request_type          TEXT NOT NULL,
  assigned_department   TEXT NOT NULL,
  status                TEXT DEFAULT 'open',
  priority              TEXT DEFAULT 'Normal',
  assigned_employee_id  INTEGER,
  request_details       TEXT,
  opening_channel       TEXT,
  created_at            TIMESTAMP,
  updated_at            TIMESTAMP,
  closed_at             TIMESTAMP
);
```


### 🔑 Environment Variables

Create a .env file inside tasks\_api/:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
```

> **Note:** The SUPABASE\_SERVICE\_ROLE\_KEY must remain server-side only.

### 🚀 Install & Run

1.  Bashcd tasks\_apinpm install
    
2.  Bashnpm start_(The API will listen on http://localhost:3001 by default.)_
    

### 🌐 Core Endpoints

**MethodPathDescription**
- GET/healthHealthcheck endpoint
- GET/api/tasksList tasks (supports filtering, sorting, pagination)
- GET/api/tasks/:task\_idRetrieve a single task
- POST/api/tasksCreate a new task
- PATCH/api/tasks/:task\_idPartially update a task
- DELETE/api/tasks/:task\_idDelete a task.

3️⃣ Back Office Dashboard (back\_office/)
-----------------------------------------

The **Back Office Dashboard** is a static web UI aimed at hotel staff (e.g., front desk, housekeeping).

### ⚙️ Tech Stack

*   **Frontend:** HTML, CSS, **Vanilla JavaScript**
    

### 🗂️ Current Contents

*   **HTML Pages:** home.html, tasks.html, task-details.html, guests.html, rooms.html, messages.html, login.html.
    
*   **JavaScript:** home.js, tasks.js, task-details.js, messages.js.
    
*   **Styles:** css/ directory.
    
*   **Assets:** assets/ (images, icons, logo files).
    

### 🚀 Running the Dashboard Locally

Use any static file server (e.g., serve):

1.  Bashcd back\_officenpx serve .
    
2.  Plaintexthttp://localhost:3000/home.html
    

🔗 How Components Fit Together
------------------------------

The system is designed for modular integration:

1.  The **AI Concierge** interprets guest requests (e.g., "I need more towels in room 102").
    
2.  The **Tasks API** provides a structured backend for storing and querying these requests.
    
3.  The **Back Office Dashboard** is the operational interface for staff to manage tasks and view data.
    

### 🔮 Future Integration

*   Wire the AI Concierge tools to call the tasks\_api endpoints directly (e.g., to create a new task).
    
*   Connect the Back Office Dashboard to consume data via the Tasks API.
    

🚀 Development Notes
--------------------

*   Use a recent **Node.js LTS** version (e.g., Node 18+) for the backend services.
    
*   **Do not commit .env files** or any secrets to version control.
    
*   Each subproject has its own lifecycle and can be developed independently.
