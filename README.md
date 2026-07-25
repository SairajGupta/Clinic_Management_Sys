# Clinic Management System 🏥

A comprehensive and modern Clinic Management System built with a React frontend and FastAPI backend. This platform provides specialized dashboards for doctors, receptionists, and administrators, along with a seamless appointment booking system for patients.

## 🚀 Features

### User Roles & Dashboards
*   **👨‍⚕️ Doctor Dashboard:** Manage patient records, view daily schedules, and write prescriptions.
*   **👩‍💼 Receptionist Dashboard:** Handle appointment scheduling, patient registrations, and front-desk operations.
*   **🛡️ Admin Dashboard:** System management, user access control, and overarching analytics.

### Patient Facing Features
*   **📅 Appointment Booking:** Intuitive interface for patients to book consultations.
*   **📝 Prescriptions:** View and download digital prescriptions.
*   **ℹ️ General Info:** Services, FAQ, Testimonials, About, and Contact pages.

### Technical Highlights
*   **Global i18n:** Multi-language support out of the box.
*   **Responsive UI:** Beautiful, modern interface powered by Tailwind CSS.
*   **Robust Backend:** FastAPI for high performance with PostgreSQL and SQLAlchemy.
*   **Security:** Rate-limiting, CORS, and strong authentication mechanisms.

---

## 🛠️ Tech Stack

### Frontend
*   [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
*   [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
*   [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework
*   [React Router](https://reactrouter.com/) - Navigation
*   [i18next](https://www.i18next.com/) - Internationalization
*   [Lucide React](https://lucide.dev/) - Beautiful icons

### Backend
*   [FastAPI](https://fastapi.tiangolo.com/) - High performance web framework
*   [Python 3](https://www.python.org/)
*   [SQLAlchemy](https://www.sqlalchemy.org/) - ORM
*   [Alembic](https://alembic.sqlalchemy.org/en/latest/) - Database migrations
*   [PostgreSQL](https://www.postgresql.org/) - Relational database
*   [Passlib](https://passlib.readthedocs.io/en/stable/) / Bcrypt - Password hashing

---

## ⚙️ Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [Python](https://www.python.org/) (v3.9 or higher)
*   [PostgreSQL](https://www.postgresql.org/) running locally or via Docker

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd Backend
```

Create a virtual environment and activate it:
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

Install the dependencies:
```bash
pip install -r requirements.txt
```

Set up your environment variables:
```bash
cp .env.example .env
# or copy manually
```
*Edit `.env` and add your database URL and secret keys.*

Run database migrations:
```bash
alembic upgrade head
```

Start the backend server:
```bash
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`. You can view the interactive API documentation at `http://localhost:8000/docs`.

### 2. Frontend Setup

Navigate to the frontend directory:
```bash
cd Frontend
```

Install the dependencies:
```bash
npm install
```

Set up your environment variables:
```bash
cp .env.example .env
# or copy manually
```
*Ensure `VITE_API_URL` points to your backend server (default is `http://localhost:8000`).*

Start the development server:
```bash
npm run dev
```
The frontend application will be available at `http://localhost:5173`.

---

## 🔒 Environment Variables

### Backend (`Backend/.env`)
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name

# Frontend URLs for CORS (comma separated)
FRONTEND_URLS=http://localhost:5173,http://localhost:3000

# Auth Configuration
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
```

### Frontend (`Frontend/.env`)
```env
# API URL for Backend (e.g. http://localhost:8000 for local, or https://api.yourdomain.com for production)
VITE_API_URL=http://localhost:8000
```
