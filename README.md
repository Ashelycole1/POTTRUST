# PotTrust 

PotTrust is a comprehensive, role-based front-end application built for managing group savings (SACCOs). It provides a beautiful, modern, and responsive interface designed to handle group pots, member contributions, loans, trust scores, and an immutable audit log.

## Tech Stack
- **Framework:** React + Vite
- **Styling:** Vanilla CSS (Design tokens, custom gradients, CSS Grid/Flexbox)
- **Icons:** Lucide React
- **Routing:** React Router DOM

## Features
- **Responsive Layout:** 
  - **Mobile:** Card carousel, sticky bottom navigation.
  - **Desktop:** Persistent sidebar, expanded grid layout, and a sticky audit log panel.
- **Role-Based Access Control (RBAC):**
  - **Standard Member:** View the pot, personal contributions, active loans, and request new loans.
  - **Group Treasurer:** Verify and review payment proofs in a dedicated Review Queue.
  - **Group Chairperson:** Approve/reject loan requests and issue fines to members.
  - **System Admin:** Cross-group oversight, managing users, and platform configuration.
- **Dynamic Theming & UI Tokens:** Uses a centralized CSS variable system for consistent coloring (Paid = Green, Pending = Gold, Overdue = Coral).
- **Zero Emojis:** Professional and premium feel using scalable SVG icons.

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Ashelycole1/POTTRUST.git
   cd POTTRUST
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

## Deployment

This project is configured for seamless deployment on **Vercel**. 

1. Ensure all your files are at the root of the repository.
2. Push your code to GitHub.
3. Import your repository into Vercel.
4. Vercel will automatically detect **Vite**, run `npm run build`, and serve the `dist` directory. Client-side routing is handled via the included `vercel.json` file.

## Design Reference
For comprehensive details on the typography, colors, and layout metrics used across this app, refer to the included `design_1.md` specification file.
