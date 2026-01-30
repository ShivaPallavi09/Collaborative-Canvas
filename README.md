# Collaborative Canvas

A real-time, multi-user drawing application built with **Node.js**, **Socket.io**, and **Vanilla HTML5 Canvas**.

## Features
* **Real-time Collaboration:** Multiple users can draw simultaneously.
* **Live Presence:** See other users' cursors and names in real-time.
* **Global Undo:** A robust undo system that handles conflicting states by replaying history.
* **High-DPI Support:** Crisp rendering on Retina/4K displays.
* **Latency Compensation:** Optimistic updates for the local user.

## Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/ShivaPallavi09/Collaborative-Canvas.git
    cd collaborative-canvas
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run the Server**
    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    Visit `http://localhost:3000`

## Architecture
* **Frontend:** Vanilla JavaScript (No libraries). Uses the HTML5 Canvas API for rendering and raw DOM manipulation for cursors.
* **Backend:** Node.js + Express.
* **Communication:** Socket.io for bi-directional event streaming (draw events, cursor movements, state sync).
* **State Management:** The server acts as the "Single Source of Truth." The Undo feature uses an Event Sourcing pattern, replaying the valid history stack to ensure consistency across all clients.

## Time Spent
Approx. 3 hours.
