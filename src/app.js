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
const io = new Server(server, {
    cors: {
        origin: // "https://martelli-automotores-front-dev-production.up.railway.app"
        "http://localhost:5173" ,
        credentials: true,
    }
});

const PORT = process.env.PORT || 8080;

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("✅ Conectado a MongoDB"))
    .catch((err) => console.error("❌ Error al conectar con MongoDB:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: //"https://martelli-automotores-front-dev-production.up.railway.app"
            "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// WebSockets
io.on("connection", (socket) => {
    console.log("🔌 Cliente conectado");
    
    socket.on("ofertaRealizada", (subastaId) => {
        io.emit("actualizarSubasta", subastaId);
    });
    
    socket.on("disconnect", () => {
        console.log("🔌 Cliente desconectado");
    });
});

// Rutas
app.get("/", (req, res) => {
    res.send("Estamos on");
});
app.use("/api/cars", carsRouter);
app.use("/api/usuarios", userRouter);
app.use("/api/subasta", subRouter);

// Servidor escuchando
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

export { io };
