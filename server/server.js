const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../client')));

let drawingHistory = [];

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    const userColor = '#' + Math.floor(Math.random()*16777215).toString(16);

    // 1. Send Init Data
    socket.emit('init', { 
        color: userColor,
        history: drawingHistory 
    });

    // 2. Handle Drawing
    socket.on('draw', (data) => {
        const action = { ...data, id: socket.id };
        drawingHistory.push(action);
        socket.broadcast.emit('draw', data);
    });

    // 3. Handle Undo (UPDATED LOGIC)
    socket.on('undo', () => {
        // A. Find the last action by this user
        let lastActionIndex = -1;
        for (let i = drawingHistory.length - 1; i >= 0; i--) {
            if (drawingHistory[i].id === socket.id) {
                lastActionIndex = i;
                break;
            }
        }

        if (lastActionIndex !== -1) {
            // B. Get the Stroke ID of that last action
            const lastStrokeId = drawingHistory[lastActionIndex].strokeId;

            // C. Filter out ALL actions with that Stroke ID
            // This removes the *entire* line, not just one pixel
            if (lastStrokeId) {
                drawingHistory = drawingHistory.filter(item => item.strokeId !== lastStrokeId);
            } else {
                // Fallback for old data without strokeId (remove just one)
                drawingHistory.splice(lastActionIndex, 1);
            }

            // D. Refresh everyone
            io.emit('board_refresh', drawingHistory);
        }
    });

    // 4. Handle Cursor
    socket.on('cursor', (data) => {
        socket.broadcast.emit('cursor', { 
            id: socket.id, 
            x: data.x, 
            y: data.y,
            color: userColor,
            name: `User ${socket.id.substr(0, 4)}` 
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        io.emit('user_disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});