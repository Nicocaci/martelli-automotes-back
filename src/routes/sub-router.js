import express from "express";
import SubastaController from "../controllers/sub-controller.js";
import verificarToken from "../utils/jsonwebtoken.js";
import upload from "../config/multerConfig.js"; // ⬅️ Importá la config de multer

const router = express.Router();

// 👉 Ruta modificada para permitir subida de imagen
router.post('/', upload.array("img", 5), SubastaController.crearSubasta); 

router.get('/:id', SubastaController.obtenerSubastaPorId);
router.get('/', SubastaController.obtenerSubastas);
router.put('/:id', SubastaController.actualizarSubasta);
router.delete('/:id', SubastaController.eliminarSubasta);
router.put('/:id/ofertadores', SubastaController.agregarOferta);
router.put('/finalizar/:id', SubastaController.finalizarSubasta);
router.put('/:id/activar-tiempo-extra', SubastaController.activarTiempoExtra);
router.put('/:id/reducir-tiempo-extra', SubastaController.reducirTiempoExtra);

export default router;
