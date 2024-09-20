// Import the required modules
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Create an Express app and an HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO by attaching it to the HTTP server
const io = new Server(server);

// Serve the index.html file on root access
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Handle client connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for the 'submit name' event from the client
    socket.on('submit name', (name) => {
        console.log(`Received name: ${name}`);
        socket.username = name; // Store username on socket
        // Respond to the specific client with "Hello, {given name}"
        socket.emit('greet user', `Hello, ${name}`);
        // Broadcast the message to all connected clients
        socket.broadcast.emit('new user', `${name} has joined the chat.`);
    });

    // Handle chat messages
    socket.on('chat message', (msg) => {
        // Include username in the chat message
        const messageWithUser = `${socket.username}: ${msg}`;
        io.emit('chat message', messageWithUser);
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
        if (socket.username) {
            io.emit('user left', `${socket.username} has left the chat.`);
        }
    });
});

// Start the server on port 5000
server.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});
