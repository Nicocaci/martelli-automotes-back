import express from "express";
const router = express.Router();
import UsuarioController from "../controllers/user-controller.js";

// ✅ Rutas específicas primero
router.post('/register', UsuarioController.register);
router.post('/login', UsuarioController.loginUsuario);
router.post('/logout', UsuarioController.logOut);

// 🧑‍💻 CRUD
router.post('/', UsuarioController.crearUsuario);
router.get('/', UsuarioController.obtenerUsuarios);

// ⚠️ Rutas con params al final
router.get('/:id', UsuarioController.obtenerUsuarioPorId);
router.put('/:id', UsuarioController.actualizarUsuario);
router.delete('/:id', UsuarioController.eliminarUsuario);
router.patch('/:id/aprobado', UsuarioController.cambiarEstadoAprobado);

export default router;