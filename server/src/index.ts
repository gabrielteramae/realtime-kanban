import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";
import { BoardStore, pickColor } from "./board.js";
import type { CreateCardPayload, MoveCardPayload, UpdateCardPayload, User } from "./types.js";

const PORT = Number(process.env.PORT ?? 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/socket.io")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (error) => {
    if (error) next();
  });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN, methods: ["GET", "POST"] },
});

const board = new BoardStore();
const users = new Map<string, User>();

function presence(): User[] {
  return [...users.values()];
}

io.on("connection", (socket) => {
  socket.on("join", (payload: { name?: string }) => {
    const name = payload?.name?.trim().slice(0, 32) || "Visitante";
    const user: User = {
      id: socket.id,
      name,
      color: pickColor(users.size),
    };
    users.set(socket.id, user);
    socket.data.user = user;
    socket.emit("board:sync", { cards: board.snapshot(), users: presence() });
    socket.broadcast.emit("presence:join", user);
  });

  socket.on("card:create", (payload: CreateCardPayload) => {
    const actor = socket.data.user?.name as string | undefined;
    const card = board.create(payload, actor);
    io.emit("card:created", { card, actor });
  });

  socket.on("card:update", (payload: UpdateCardPayload) => {
    const actor = socket.data.user?.name as string | undefined;
    const card = board.update(payload, actor);
    if (card) io.emit("card:updated", { card, actor });
  });

  socket.on("card:move", (payload: MoveCardPayload) => {
    const actor = socket.data.user?.name as string | undefined;
    const card = board.move(payload, actor);
    if (card) io.emit("board:sync", { cards: board.snapshot(), users: presence() });
    if (card) io.emit("activity", { type: "move", card, actor });
  });

  socket.on("card:delete", (payload: { id: string }) => {
    const actor = socket.data.user?.name as string | undefined;
    const card = board.delete(payload.id);
    if (card) io.emit("card:deleted", { id: card.id, actor });
  });

  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    users.delete(socket.id);
    if (user) io.emit("presence:leave", { id: user.id, name: user.name });
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor em http://localhost:${PORT}`);
});
