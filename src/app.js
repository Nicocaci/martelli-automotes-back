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

// CONFIGURACION DE SOCKET
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://www.autosmartapp.com",
        //"http://localhost:5173",
        credentials: true,
    }
});

const PORT = process.env.PORT || 8080;

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("✅ Conectado a MongoDB"))
    .catch((err) => console.error("❌ Error al conectar con MongoDB:", err));


const allowedOrigins = [
    'https://www.autosmartapp.com',
    'https://autosmartapp.com'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


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
