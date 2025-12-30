# Deployment Guide (TripVenza Platform)

This guide details how to deploy the TripVenza platform to production using **Vercel** (recommended) or Docker.

## Option 1: Vercel (Recommended)

Vercel is ideal for this React + Node.js setup. You will deploy two separate projects: one for Backend, one for Frontend.

### Phase 1: Backend Deployment
1.  Push your code to **GitHub**.
2.  Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3.  Import your repository.
4.  **Configure Project**:
    *   **Root Directory**: `backend` (Important! Click "Edit" next to Root Directory and select `backend`).
    *   **Environment Variables**: Add these from your `.env`:
        *   `MONGO_URI`
        *   `JWT_SECRET`
        *   `RAZORPAY_KEY_ID`
        *   `RAZORPAY_KEY_SECRET`
        *   `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (if using email)
        *   `CLOUDINARY_...` (for storage)
5.  Click **Deploy**.
6.  **Copy the Domain**: Once deployed, copy the backend URL (e.g., `https://tripvenza-backend.vercel.app`).

### Phase 2: Frontend Deployment
1.  Go to Vercel Dashboard -> **"Add New Project"**.
2.  Import the **same repository**.
3.  **Configure Project**:
    *   **Root Directory**: Leave as `./` (Root).
    *   **Framework Preset**: Vite (should detect automatically).
    *   **Environment Variables**:
        *   `VITE_API_URL`: Paste your Backend URL from Phase 1 (e.g., `https://tripvenza-backend.vercel.app/api`).
        *   `VITE_RAZORPAY_KEY_ID`: Your Razorpay Test Key ID.
4.  Click **Deploy**.

---

## Option 2: Railway (Easiest for Backend)

Railway is excellent for the Backend because it keeps the server running continuously (unlike Vercel's serverless).

1.  **Sign Up**: Go to [Railway.app](https://railway.app) and login with GitHub.
2.  **New Project**: Click "New Project" -> "Deploy from GitHub repo".
3.  **Select Repo**: Choose your project.
4.  **Add Service**:
    *   Select `backend` folder as the Root Directory often requires a separate service or monorepo setup.
    *   **Easier Way**:
        1.  In Railway, create a service from the repo.
        2.  Go to **Settings** -> **Root Directory** -> set to `/backend`.
        3.  Go to **Variables** -> Add `MONGO_URI`, `JWT_SECRET`, etc.
        4.  Railway will auto-detect the `Dockerfile` or `package.json` and deploy.
5.  **Domain**: Go to Settings -> Generate Domain (e.g., `visa-backend-production.up.railway.app`).

### Recommendation
*   **Frontend**: Use **Vercel** (It's the best for React/Vite).
*   **Backend**: Use **Railway** (Simpler for Express) OR **Vercel** (Cheaper/Free for small scale).

## Option 3: Docker (VPS/DigitalOcean)

If you prefer a VPS, use the provided `Dockerfile` in the `backend` folder.

1.  **Build Image**:
    ```bash
    cd backend
    docker build -t tripvenza-api .
    ```
2.  **Run Container**:
    ```bash
    docker run -d -p 5000:5000 \
      -e MONGO_URI="..." \
      -e JWT_SECRET="..." \
      tripvenza-api
    ```
3.  **Frontend**: You will need to build the frontend (`npm run build`) and serve the `dist` folder using Nginx.

## Checklist Before Live
- [ ] **Razorpay Keys**: Ensure you are using Live keys for real money, or Test keys for verification.
- [ ] **MongoDB**: Ensure your Network Access in MongoDB Atlas allows connections from "Anywhere" (0.0.0.0/0) or Vercel IPs.
