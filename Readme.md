# Real-Time Chat Application

A real-time chat application built with **Socket.IO**, **Express**, and **MySQL**. This project demonstrates WebSocket communication with persistent message storage and automatic message recovery on reconnection.

## 🚀 Features

- **Real-Time Messaging**: Instant message delivery using Socket.IO WebSockets
- **Message Persistence**: All messages stored in MySQL database
- **Connection Recovery**: Automatic recovery of missed messages when reconnecting
- **Duplicate Prevention**: Client-side offset tracking prevents duplicate messages
- **Connect/Disconnect Toggle**: Users can manually disconnect and reconnect
- **Responsive UI**: Modern, clean chat interface with backdrop blur effects

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL Server running locally
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajbharati2705/Websockets.git
   cd Websockets2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup MySQL Database**
   - Create a database named `chat_db`
   - Update database credentials in `index.js` if needed (default: root/12345)
   ```sql
   CREATE DATABASE chat_db;
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   or
   ```bash
   node index.js
   ```

5. **Open in browser**
   - Navigate to `http://localhost:3000`

## 📦 Dependencies

```json
{
  "express": "^4.22.1",
  "socket.io": "^4.8.3",
  "mysql2": "^3.16.0"
}
```

## 🏗️ Project Structure

```
Websockets2/
├── index.html          # Frontend chat interface
├── index.js            # Backend server setup
├── package.json        # Project dependencies
└── Readme.md           # This file
```

## 📝 File Descriptions

### `index.js` - Backend Server
- Initializes Express server and Socket.IO
- Manages MySQL connection pool
- Handles socket events:
  - `connection`: New user connects
  - `chat message`: Receive and store messages
  - `disconnect`: User disconnection logging
- Implements message recovery for reconnected clients

### `index.html` - Frontend Interface
- Chat message display list
- Input form for sending messages
- Connect/Disconnect toggle button
- Socket.IO client initialization with server offset tracking

## 🔌 Socket.IO Events

### Server Events
- **`connection`**: Emitted when a new client connects
- **`chat message`**: Receive message from client, store in DB, broadcast to all
- **`disconnect`**: Emitted when client disconnects

### Client Events
- **`chat message`**: Send message to server
- **Automatic recovery**: On reconnect, missing messages are recovered from DB

## 🗄️ Database Schema

### `messages` Table
```sql
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_offset VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL
);
```

- **id**: Unique message identifier
- **client_offset**: Prevents duplicate messages (format: `socket_id-counter`)
- **content**: Message text

## 🔧 Configuration

Edit credentials in `index.js` (lines 8-14):
```javascript
const db = await mysql.createPool({
  host: "localhost",
  user: "root",
  password: "12345",
  database: "chat_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
```

## 🚦 How It Works

1. **User connects** → Socket.IO establishes WebSocket connection
2. **Server recovers messages** → Fetches any missed messages from DB
3. **User sends message** → Client emits `chat message` event with unique offset
4. **Server stores message** → Inserts into MySQL with duplicate check
5. **Broadcast to all** → Server emits to all connected clients
6. **On disconnect/reconnect** → Connection recovery feature restores messages

## 💡 Key Features Explained

### Connection State Recovery
Prevents message loss during temporary disconnections. When a client reconnects, the server fetches all messages after their `serverOffset`.

### Duplicate Prevention
Uses `client_offset` (socket.id + counter) to ensure the same message isn't inserted twice.

### Message Broadcasting
All connected clients receive messages in real-time via Socket.IO.

## 📚 Usage Example

```javascript
// Client-side (index.html)
socket.emit("chat message", "Hello!", clientOffset);

// Server-side (index.js)
socket.on("chat message", async (msg, clientOffset) => {
  // Insert into DB and broadcast
  io.emit("chat message", msg, result.insertId);
});
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Cannot connect to database | Ensure MySQL is running and credentials are correct |
| Port already in use | Change port in `index.js` or kill process on port 3000 |
| Duplicate messages | Server is handling this automatically with `client_offset` |
| Messages not persisting | Check MySQL connection and `messages` table exists |

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

Created by rajbharati2705

---

**Last Updated**: January 8, 2026
