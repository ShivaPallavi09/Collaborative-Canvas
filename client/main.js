const socket = io();
const statusDiv = document.getElementById('status');
const appDiv = document.getElementById('app');
const cursors = {};

// 1. Setup Undo Button
const toolbar = document.querySelector('.toolbar');
const undoBtn = document.createElement('button');
undoBtn.innerText = 'Undo';
undoBtn.style.marginLeft = '10px';
undoBtn.style.padding = '5px 10px';
undoBtn.style.cursor = 'pointer';
toolbar.appendChild(undoBtn);

undoBtn.addEventListener('click', () => {
    console.log('Undo clicked'); // Debug log
    socket.emit('undo');
});

// 2. Initialize Whiteboard
const whiteboard = new Whiteboard(
    'whiteboard',
    (data) => {
        socket.emit('draw', data);
    },
    (cursorData) => {
        socket.emit('cursor', cursorData);
    }
);

// 3. Socket Listeners
socket.on('init', (data) => {
    whiteboard.color = data.color;
    if (data.history) {
        data.history.forEach(item => whiteboard.drawRemote(item));
    }
});

socket.on('draw', (data) => {
    whiteboard.drawRemote(data);
});

socket.on('board_refresh', (fullHistory) => {
    whiteboard.clear();
    fullHistory.forEach(item => whiteboard.drawRemote(item));
});

socket.on('cursor', (data) => {
    if (!cursors[data.id]) {
        const cursor = document.createElement('div');
        cursor.className = 'cursor';
        cursor.style.backgroundColor = data.color;
        const label = document.createElement('span');
        label.innerText = data.name;
        label.className = 'cursor-label';
        cursor.appendChild(label);
        appDiv.appendChild(cursor);
        cursors[data.id] = cursor;
    }
    const cursor = cursors[data.id];
    cursor.style.left = `${data.x}px`;
    cursor.style.top = `${data.y}px`;
});

socket.on('user_disconnected', (id) => {
    if (cursors[id]) {
        cursors[id].remove();
        delete cursors[id];
    }
});

socket.on('connect', () => {
    statusDiv.innerText = 'Connected: ' + socket.id;
    statusDiv.style.color = 'green';
});

socket.on('disconnect', () => {
    statusDiv.innerText = 'Disconnected';
    statusDiv.style.color = 'red';
});