# HealthAI Copilot

An AI-powered health dashboard and conversational agent built with React, Vite, and Tailwind CSS. 

## Getting Started

To run this project locally on your machine using VS Code:

1. **Install Dependencies**
   Make sure you have Node.js installed, then run:
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory and add your Google Gemini API key (needed for the AI Copilot to work):
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the Development Server**
   Start the local Vite dev server:
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:3000` to see the application running.

## Features
- **Dashboard:** Data visualization for vitals and sleep logs using Recharts.
- **Copilot:** AI conversational interface using the Gemini 2.5 Pro API.
- **Log Data Workspace:** Manual entry points for syncing biometric data.
- **Settings & Terminal:** Mock integration panel for wearables (HealthKit, Fit, etc.) and a functional developer terminal.
