# SpyDock
SpyDock is a thrilling multiplayer social deduction game where players must identify the spy among them. Built with Node.js, Express, Socket.IO, and Vite, SpyDock offers real-time gameplay with a sleek, responsive interface.
view the live project - https://spydock.onrender.com
And By the Way Nova and Knox are my PetNames

![Screenshot 2025-04-30 131023](https://github.com/user-attachments/assets/0f4b5512-8f3a-432d-a9b0-e736be046fad)

![Screenshot 2025-04-30 131321](https://github.com/user-attachments/assets/9ff96b39-da93-4423-9c5d-9510c5c52e88)

# SpyDock Architecture

## Overview
SpyDock is a client-server application built for real-time multiplayer gaming. The backend handles game state, player management, and real-time communication, while the frontend provides an interactive UI.

## Components
- **Backend (server.js)**:
  - Built with Express and Socket.IO.
  - Manages game creation, player joining, role assignment, voting, and timer logic.
  - Stores game state in memory (`games` object).
- **Frontend (app.js, index.html, styles.css)**:
  - Uses Vite for development and build.
  - Handles UI rendering, user interactions, and Socket.IO communication.
  - Responsive design with CSS and Font Awesome.
- **Word Pairs (words.js)**:
  - Contains word pairs for regular players and spies, categorized by themes (e.g., Food, Sports).

## Data Flow
1. Players connect via Socket.IO.
2. The server assigns roles and words, broadcasting updates to clients.
3. Clients render UI based on server events (e.g., game start, timer updates, voting results).
4. Voting and chat messages are sent to the server, which broadcasts them to all players.

## Deployment
- Deployed on Render with CORS configured for the production URL.
- Static files served via Express.

- To run this Project you just need to downlaod and you need to install node js in your platform and start the server with this server line code "node server.js" and open the site in your browser "localhost:3000"
