import express from "express";
const router = express.Router();

import UsuarioController from "../controllers/user-controller.js";
import verificarToken from "../middleware/verificarToken.js";
import auth from "../middleware/auth.js";

// ✅ Rutas específicas primero
router.post("/register", UsuarioController.register);
router.post("/login", UsuarioController.loginUsuario);
router.post("/logout", UsuarioController.logOut);

// ✅ Verify ANTES de /:id
router.get("/verify", auth, UsuarioController.verificarToken);

// 🧑‍💻 CRUD
router.post("/", UsuarioController.crearUsuario);
router.get("/", UsuarioController.obtenerUsuarios);

// ⚠️ SIEMPRE al final
router.get("/:id", UsuarioController.obtenerUsuarioPorId);
router.put("/:id", UsuarioController.actualizarUsuario);
router.delete("/:id", UsuarioController.eliminarUsuario);
router.patch("/:id/aprobado", UsuarioController.cambiarEstadoAprobado);

export default router;
