# 🔬 UB's Research Portal

> *because every resource should be available in one place*

A full-stack academic research platform where students submit papers, teachers review them, and admins keep everything from falling apart. 

---

## ✨ What This App Can Do

**UB's Research Portal** is a role-based research portal system that lets:

- 🎓 **Students** — submit papers, track review status, build a research portfolio
- 👩‍🏫 **Teachers** — review submissions, give feedback, manage their department's work
- 🛡️ **Admins** — oversee everything, manage users, moderate content, assign papers and teachers to departments

---

## 🛠️ Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| Backend | Node.js + Express | Fast, flexible REST APIs |
| Database | PostgreSQL | Relational data done right |
| ORM | TypeORM | Entities > raw SQL (usually) |
| Frontend | React | Because we needed component-based UI  |
| Auth | JWT | Stateless, secure, industry standard |

---

## 🚀 How to Run

> Make sure you have **Node.js** and **PostgreSQL** installed first.

**Step 1** — Open the project folder in VS Code

**Step 2** — Open two terminals

**Step 3** — In terminal one:
```bash
cd backend
npm install
npm run dev
```

**Step 4** — In terminal two:
```bash
cd frontend
npm install
npm start
```

**Step 5** — Open your browser at `http://localhost:3000` and hope there are no errors

> 💡 The database sets itself up automatically via TypeORM — no manual table creation needed. Just make sure PostgreSQL is running and your connection config is correct.

---

## 👥 Roles & What They Can Do

### 🎓 Student
- Register and log in
- Submit research papers (with file upload)
- View submission status and teacher feedback
- Browse the Hall of Fame (top accepted papers)
- Search and filter papers by keyword, category, date

### 👩‍🏫 Teacher
- Review assigned student submissions
- Accept, reject, or request revisions
- Leave detailed feedback
- Manage papers within their department

### 🛡️ Admin
- Full dashboard with platform stats
- Manage all users (create, update, blacklist)
- Assign teachers & papers to departments
- Oversee all submissions across departments
- Manage department structure
- Moderate content platform-wide

---

## 🗂️ Project Structure

```
UBs-Research-Portal/
├── backend/
│   ├── src/
│   │   ├── api/            ← Has Axios.js
│   │   ├── config/         ← Configures database 
│   │   ├── entities/       ← TypeORM database models
│   │   ├── routes/         ← Express API routes
│   │   ├── middleware/     ← JWT auth, role guards
│   ├── uploads
│   ├── howtorun.txt
│   ├── index.js 
│   └── package.json
│   ├── package-lock.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/     ← Reusable UI pieces
    │   ├── pages/          ← Role-based views
    │   ├── context/        ← Auth state
    │   └── App.js         ← Router + layout
    │   ├── App.css
    │   ├── index.js
    │   ├── index.css
    └── package.json
    └── package-lock.json
```

---

## 🔐 Auth & Security

- Passwords hashed with **bcrypt** — no plaintext ever
- **JWT tokens** on every protected route
- Role checks enforced at the **API level**, not just the frontend
- Blacklisted users get bounced at the middleware layer

---

## 🔍 Search & Filtering

Papers can be filtered by:
- 🔎 Keyword search (title + abstract)
- 🏷️ Category / research domain
- 📅 Date range
- 📊 Status (pending / accepted / rejected)
- Pagination 

---

## 🏆 Core Entities

```
User ──< Submission >── Paper
 │                        │
 └── Department ──────────┘
```

- **User** — students, teachers, admins with role-based permissions
- **Paper / Submission** — the core research artifact with metadata, file, status
- **Department** — groups teachers and scopes submissions

---

## 📝 Notes

- This was built for the App Dev Lab capstone (Jan 2026 term)
- Database auto-migrates on startup — no manual setup needed
- File uploads stored locally (no S3)
- The "Hall of Fame" feature was genuinely fun to build

---

## 🙈 Known Things

- Mobile view is... optimistic
- Error messages are honest if not always polite
- If something breaks, check that PostgreSQL is actually running

---

*Made by Urjaswi Banerjee · ADL Jan 2026 · UB's Research Portal*
