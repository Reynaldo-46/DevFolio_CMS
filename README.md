# DevFolio CMS

"Create stunning developer portfolios in minutes, not hours."

## 🚀 Overview

DevFolio is a modern portfolio CMS that enables developers to build, customize, and publish their personal portfolio websites effortlessly — with GitHub auto‑import, blog system, analytics, and custom domains.

## ✨ Core Features (MVP)

* **User Authentication** — Email/Password + GitHub OAuth
* **Portfolio Builder** — Templates, live preview, theme customization
* **Project Management** — Manual + GitHub auto‑import
* **Blog System** — Markdown editor, tags, publishing
* **Custom Domains** — `username.devfolio.dev` or custom
* **Portfolio Analytics** — Views, traffic sources, top projects

## 🏗️ Tech Stack

**Frontend:** React (Vite), Tailwind, Axios, React Router
**Backend:** Django REST Framework, PostgreSQL, JWT Auth
**DevOps:** Docker, GitHub Actions CI/CD, Vercel/Render

## 📁 Project Structure

```
devfolio-frontend/          # React SPA
 └── src/components/...      # Auth, dashboard, editor, etc.

devfolio-backend/           # Django REST API
 └── apps/users, projects, portfolios, blog, analytics
```

## 📡 API Examples

```
POST /api/auth/login        # Login
GET  /api/portfolio/:user   # Public portfolio
POST /api/projects          # Create project
```

## 🌍 Roadmap

* ✅ MVP launch
* ⏳ Client-side template marketplace
* ⏳ AI-assisted portfolio generation

## 🧑‍💻 Author & Contribution

Open for contributions — PRs welcomed.

MIT License • Built for developers, by developers.

---

## 📸 Preview / UI Screenshots

*(Coming soon — will showcase Dashboard, Template Editor, Live Preview, Portfolio Site)*

## ⚙️ Installation & Setup

### 1️⃣ Frontend (React + Vite)

```bash
git clone https://github.com/yourname/devfolio-cms.git
cd devfolio-frontend
npm install
npm run dev
```

### 2️⃣ Backend (Django REST Framework)

```bash
cd devfolio-backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## 🔐 Environment Variables (.env)

**Frontend**

```
VITE_API_URL=http://localhost:8000
```

**Backend**

```
SECRET_KEY=your_secret_key
DATABASE_URL=postgres://user:pass@localhost:5432/devfolio
GITHUB_CLIENT_ID=xxxx
GITHUB_CLIENT_SECRET=xxxx
```

## 🛠️ Contributing

* Fork & Star this repo
* Create a feature branch
* Follow ESLint + Django best practices
* Submit a pull request 🚀

## 🗺️ Roadmap

* ✅ MVP (Auth, Portfolio, Projects, Blog, Analytics)
* 🚧 AI Portfolio Generator
* 🚧 Template Marketplace
* 🚧 Team Collab / Multi-user Admin

## 💡 Project Purpose

DevFolio was built to solve the pain of manually building unique developer portfolios — instead, generate and customize instantly.

## 🌐 Deployment Guide

* **Frontend**: Vercel / Netlify
* **Backend**: Render / Railway / DigitalOcean
* **PostgreSQL**: Neon / Supabase
* **CDN/Uploads**: AWS S3 or Cloudinary
