import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import carsRouter from "./routes/cars-router.js";
import userRouter from "./routes/user-router.js";
import subRouter from "./routes/sub-router.js";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const server = createServer(app);

const isDev = process.env.NODE_ENV !== "production";

const allowedOrigins = [
  "https://www.autosmartapp.com",
  "https://autosmartapp.com",
];

if (isDev) {
  allowedOrigins.push("http://localhost:5173");
  allowedOrigins.push("http://127.0.0.1:5173");
}

// ✅ CORS
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("⛔ Bloqueado por CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use("/uploads", express.static("uploads"));


// Socket.IO
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

io.on("connection", (socket) => {
  console.log("🔌 Cliente conectado");
  socket.on("ofertaRealizada", (subastaId) => {
    io.emit("actualizarSubasta", subastaId);
  });
  socket.on("disconnect", () => console.log("🔌 Cliente desconectado"));
});

// MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error MongoDB:", err));

// Rutas
app.get("/", (req, res) => res.send("Estamos on"));
app.use("/api/cars", carsRouter);
app.use("/api/usuarios", userRouter);
app.use("/api/subasta", subRouter);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Puerto ${PORT} (${isDev ? "dev" : "prod"})`);
});

export { io };