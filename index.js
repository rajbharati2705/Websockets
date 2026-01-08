import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
import mysql from "mysql2/promise";

// create MySQL connection pool
const db = await mysql.createPool({
  host: "localhost",
  user: "root",
  password: "12345",
  database: "chat_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// create messages table
await db.execute(`
  CREATE TABLE IF NOT EXISTS  messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_offset VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL
);
`);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {},
});

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

// io.on("connection", (socket) => {
//   console.log("A user connected", socket.id);
//   // socket.on("chat message", (msg)=>{
//   //     console.log("Message received: ", msg);
//   //     io.emit("chat message", msg);
//   //     // socket.broadcast.emit("chat message", msg);
//   // })

//   socket.on("chat message", async (msg) => {
//     let result;
//     try {
//       [result] = await db.execute("INSERT INTO messages(content) VALUES(?)", [
//         msg,
//       ]);
//       io.emit("chat message", msg, result.insertId);
//     } catch (error) {
//       console.error("Error inserting message: ", error);
//     }
//   });
//   socket.on("disconnect", () => {
//     console.log("User disconnected", socket.id);
//   });
// });
io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);

  // RECOVER missed messages
  if (!socket.recovered) {
    try {
      const [rows] = await db.execute(
        "SELECT id, content FROM messages WHERE id > ?",
        [socket.handshake.auth.serverOffset || 0]
      );

      for (const row of rows) {
        socket.emit("chat message", row.content, row.id);
      }
    } catch (err) {
      console.error("Recovery error:", err);
    }
  }

  socket.on("chat message", async (msg, clientOffset) => {
    try {
      const [result] = await db.execute(
        "INSERT INTO messages (content, client_offset) VALUES (?, ?)",
        [msg, clientOffset]
      );

      io.emit("chat message", msg, result.insertId);
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        console.log("Duplicate message ignored:", clientOffset);
      } else {
        console.error("Insert error:", err);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
