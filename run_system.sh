#!/bin/bash

# Civic AI Shield - Multi-Server Startup Script

# 1. Start Backend
echo "🚀 Starting FastAPI Backend..."
cd backend
source venv/bin/activate
export PYTHONPATH=$PYTHONPATH:.
python -m backend.main &
BACKEND_PID=$!

# 2. Start Frontend
echo "💻 Starting React Frontend..."
cd ../civic-ai-shield
npm run dev &
FRONTEND_PID=$!

echo "------------------------------------------------"
echo "🛡️  Civic AI Shield is now running!"
echo "------------------------------------------------"
echo "🔗 Frontend: http://localhost:5173"
echo "🔗 Backend API: http://localhost:8000"
echo "🔗 Documentation: http://localhost:8000/docs"
echo "------------------------------------------------"
echo "Press Ctrl+C to stop all servers."

# Wait for exit
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
