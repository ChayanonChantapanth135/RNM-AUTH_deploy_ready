# Deployment Guide: RNM Task Management

1. Frontend: Deploy on Vercel
- Root Directory: frontend
- Framework Preset: Vite
- Environment Variable: VITE_API_URL=https://your-backend.onrender.com
- vercel.json is already created to handle client-side routing

2. Backend: Deploy on Render / Railway
- Root Directory: server
- Environment Variables: See server/.env.example
- Handles Cron Task Scheduler and WebSockets seamlessly