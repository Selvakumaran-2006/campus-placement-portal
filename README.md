# EduHire — College Campus Placement Portal

EduHire is a highly polished, full-stack **Campus Placement Portal** designed specifically for a college's Training and Placement (T&P) cell. It allows students to manage profiles, build text-based resume files, browse posted job vacancies with eligibility screening, and apply in a single click. Companies can post job openings and track student pipelines through status milestones, while Placement Officers get high-level analytical overviews.

This project utilizes a modern full-stack architecture with **React (with Tailwind CSS and Lucide Icons)** on the frontend, and a **Node.js + Express** backend serving a secure API with **JWT Token Authorization** and **Bcrypt hashing**.

---

## 🚀 Key Features

### 🎓 For Students
- **Personal Profile Builder**: Save roll numbers, select departments, log current cumulative CGPA, and list skill badges.
- **Dynamic Text Resume**: Keep a plaintext resume snapshot that recruiters can instantly screen.
- **Placement & Internship Explore Feed**: Search and filter opportunities by keyword, role, location, format, or eligibility status.
- **Eligibility Screening**: Immediate visual indicators specifying if the student meets the recruiter's minimum eligibility criteria (CGPA match).
- **One-Click Application**: Instantly apply to eligible vacancies with a single click.
- **Application Pipeline Tracker**: Real-time tracker for each job showing progress milestones: `Pending` ➔ `Shortlisted` ➔ `Interview Scheduled` ➔ `Offered` (or `Rejected`).

### 💼 For Corporate Recruiters
- **Company Credentials Management**: Define corporate branding, description, website, and recruitment contacts.
- **Opportunity Posting Engine**: Create job listings with role title, description, skills required, location, salary package, and minimum eligibility CGPA.
- **Pipeline Evaluation Dashboard**: Read candidate resumes, screen CGPA levels, post review feedback notes, and update statuses.

### 🛡️ For Placement Officers (Admins)
- **Analytics Dashboard**: Instant statistics on total students registered, total students placed, overall placement rate, and salary distributions.
- **Institutional Student Directory**: View and search the college-wide student academic database with easy department and CGPA sorting.

---

## 🛠️ Stack & Technical Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express, ESBuild compiler.
- **Authentication**: JSON Web Token (JWT) Bearer Authorization, Password Cryptography (Bcrypt.js).
- **Database / Persistence**:
  - Out of the box, the app runs on a robust, atomic file-system JSON database (`db.json`) ensuring persistent data inside container workloads.
  - Ready to easily configure with **MongoDB (MERN Stack)** for production workloads by providing the `MONGODB_URI` environment variable.

---

## ⚙️ Environment Variables Config

Create a `.env` file in the root directory and configure the following parameters:

```env
# Server Ingress URL 
APP_URL="http://localhost:3000"

# Cryptography Secrets
JWT_SECRET="YOUR_SECURE_JWT_SECRET_KEY"

# Database Configuration (Production MERN Stack Setup)
# Set this to your MongoDB Atlas connection string to switch to MongoDB in production
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/placement_portal"
```

---

## 📦 Getting Started & Local Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Steps to Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/campus-placement-portal.git
   cd campus-placement-portal
   ```

2. **Install all dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   *This starts the Express server running on port `3000` which mounts Vite development middleware on the fly.*

4. **Access the application**:
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🚀 Production Build & Deployment

To build and compile the application for deployment (e.g., to Heroku, Render, or AWS):

1. **Build and bundle the assets**:
   ```bash
   npm run build
   ```
   *This builds the static React SPA into `/dist`, and bundles the TypeScript backend server into a single, highly performant, self-contained `dist/server.cjs` file.*

2. **Launch production server**:
   ```bash
   npm run start
   ```

### Deploying to Render / Heroku
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Environment variables**: Supply your environment variables (`JWT_SECRET`, `MONGODB_URI`) directly in the host dashboard.
