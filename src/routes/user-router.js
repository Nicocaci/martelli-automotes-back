import express from "express";
const router = express.Router();
import UsuarioController from "../controllers/user-controller.js";


router.post('/', UsuarioController.crearUsuario);
router.post('/register', UsuarioController.register);
router.post('/login', UsuarioController.loginUsuario);
router.post('/logout', UsuarioController.logOut);
router.get('/:id', UsuarioController.obtenerUsuarioPorId);
router.get('/usuarios', UsuarioController.obtenerUsuarios);
router.put('/:id', UsuarioController.actualizarUsuario);
router.delete('/:id',UsuarioController.eliminarUsuario);

export default router;