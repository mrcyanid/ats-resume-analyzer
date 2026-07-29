# AI-Powered Resume ATS Analyzer

Full-stack app: React (Vite) frontend + Node/Express backend + MongoDB + Gemini AI.

## Folder Structure
```
project/
├── server/    # Express backend
└── client/    # React frontend
```

---

## PART 1 — Local Setup

### Prerequisites
- Node.js installed (v18+): check with `node -v`
- A MongoDB Atlas account (free tier is fine): https://www.mongodb.com/cloud/atlas
- A Gemini API key (free): https://aistudio.google.com/app/apikey
- VS Code (or any code editor)

### Step 1: Backend Setup
```bash
cd project/server
npm install
```

Create a `.env` file in `server/` (copy `.env.example` and fill in real values):
```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=any_long_random_string
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

**Getting MONGO_URI:**
1. Go to MongoDB Atlas → Create a free cluster
2. Database Access → Add a database user (username + password)
3. Network Access → Add IP `0.0.0.0/0` (allow from anywhere, for dev)
4. Clusters → Connect → "Connect your application" → copy the URI
5. Replace `<username>` and `<password>` in the URI with your actual credentials

**Getting GEMINI_API_KEY:**
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google, click "Create API Key"
3. Copy and paste into `.env`

Run the backend:
```bash
npm run dev
```
You should see: `MongoDB connected` and `Server running on port 5000`

### Step 2: Frontend Setup
Open a **new terminal**:
```bash
cd project/client
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## PART 2 — Testing the App

1. Open `http://localhost:5173` in your browser
2. Click **Register** → create an account (name, email, password)
3. You'll be redirected to **Login** → log in with the same credentials
4. You'll land on **Your Resumes** page
5. Upload a PDF resume, paste a job description in the textarea
6. Click **Upload & Analyze**
7. A modal should appear showing:
   - ATS keyword match score
   - Matched/missing skills
   - Optimization tips
   - Bullet point improvement suggestions

### Common Issues
| Problem | Fix |
|---|---|
| "MongoDB connection error" | Check MONGO_URI, check Network Access allows your IP |
| "GEMINI_API_KEY is undefined" | Check `.env` file exists in `server/` folder, restart `npm run dev` |
| CORS error in browser console | Make sure CLIENT_URL in server `.env` matches your frontend URL exactly |
| "No token, authorization denied" | Log out and log back in — token may have expired or not been saved |
| PDF upload fails | Make sure file is an actual PDF, under 5MB |

---

## PART 3 — Deployment

### Backend (Render.com — free tier)
1. Push your `server/` folder to a GitHub repo
2. Go to https://render.com → New → Web Service → connect your repo
3. Root directory: `server` (if server+client are in one repo)
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables in Render dashboard: `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLIENT_URL` (set this to your deployed frontend URL once you have it)
7. Deploy → you'll get a URL like `https://your-app.onrender.com`

### Frontend (Vercel or Netlify — free tier)
1. Push your `client/` folder to GitHub (same or separate repo)
2. Before deploying, update `client/src/config.js`:
   ```js
   export const API_BASE_URL = "https://your-app.onrender.com";
   ```
3. Go to https://vercel.com → New Project → import your repo
4. Root directory: `client`
5. Build command: `npm run build`, Output directory: `dist`
6. Deploy → you'll get a URL like `https://your-app.vercel.app`

### Final Step
Go back to Render dashboard → update `CLIENT_URL` env variable to your Vercel URL → redeploy backend so CORS allows requests from your live frontend.

---

## Try It Yourself (Extensions)
- Add a "Your History" page using the `/resume/history` endpoint (already built) to show past analyses
- Add password strength validation on Register
- Add a loading skeleton instead of plain "Analyzing..." text
- Add file size/type validation error messages before upload
