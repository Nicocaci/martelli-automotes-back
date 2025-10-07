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
const server = createServer(app);

// ✅ Detectar si estamos en desarrollo o producción
const isDev = process.env.NODE_ENV !== "production";

// ✅ Lista de orígenes permitidos
const allowedOrigins = [
  "https://www.autosmartapp.com",
  "https://autosmartapp.com",
];

// En desarrollo, agregamos localhost
if (isDev) {
  allowedOrigins.push("http://localhost:5173");
  allowedOrigins.push("http://127.0.0.1:5173");
}

// ⚠️ Redirección solo en producción
if (!isDev) {
  app.use((req, res, next) => {
    const forwardedHost = req.headers["x-forwarded-host"];
    const host = forwardedHost || req.headers.host;

    if (host && host !== "api.autosmartapp.com") {
      console.log(`🔁 Redirigiendo desde ${host} a api.autosmartapp.com`);
      return res.redirect(301, `https://api.autosmartapp.com${req.originalUrl}`);
    }
    next();
  });
}

// ✅ CORS configurado correctamente
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origen (como Postman) o de orígenes válidos
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

// ✅ Middlewares
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Configuración de Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Cliente conectado");

  socket.on("ofertaRealizada", (subastaId) => {
    io.emit("actualizarSubasta", subastaId);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Cliente desconectado");
  });
});

// ✅ Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error al conectar con MongoDB:", err));

// ✅ Rutas
app.get("/", (req, res) => {
  res.send("Estamos on");
});

app.use("/api/cars", carsRouter);
app.use("/api/usuarios", userRouter);
app.use("/api/subasta", subRouter);

// ✅ Servidor
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT} (${isDev ? "dev" : "prod"})`);
  console.log("🧠 Entorno actual:", process.env.NODE_ENV);
});


// ✅ Exportar io si se necesita
export { io };
