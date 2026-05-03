# Frontend Status & Instructions

## Latest Changes
- Initialized React project with Vite and TypeScript.
- Integrated Tailwind CSS for styling.
- Set up React Router for navigation.
- Created core pages: Home, LevelSelector, and SubjectsPage.
- Configured TanStack Query for API data fetching.

## Current Configuration
- **Port:** 5173
- **URL:** http://localhost:5173
- **Framework:** React + Vite
- **Styling:** Tailwind CSS

## How to Run (Detailed)
1. **Open Terminal:** Open a *new* terminal window (different from the backend terminal).
2. **Navigate to Frontend:**
   ```powershell
   cd frontend
   ```
3. **Install Dependencies (if not already done):**
   ```powershell
   npm install
   ```
4. **Run Development Server:**
   ```powershell
   npm run dev
   ```

## Troubleshooting
- **Port already in use:** Vite will usually automatically try the next available port (e.g., 5174). Look at the terminal output to confirm the URL.
- **Dependencies Error:** If you see "command not found" or "module not found", try running `npm install` again.
