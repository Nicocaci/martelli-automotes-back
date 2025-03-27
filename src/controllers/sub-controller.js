import SubastaModel from '../dao/models/subastas-model.js';
import SubastaService from '../service/sub-service.js';
import { io } from '../app.js';
import UsuarioModel from '../dao/models/usuario-model.js';


class SubastaController {
  // Crear una nueva subasta
  async crearSubasta(req, res) {
    try {
      const subastaData = req.body;
      const nuevaSubasta = await SubastaService.crearSubasta(subastaData);
      res.status(201).send(nuevaSubasta);
    } catch (error) {
      res.status(500).json({ message: 'Error al crear subasta: ' + error.message });
    }
  }

  // Obtener una subasta por su ID
  async obtenerSubastaPorId(req, res) {
    try {
      const subastaId = req.params.id;
      const subasta = await SubastaService.obtenerSubastaPorId(subastaId);
      if (!subasta) {
        return res.status(404).json({ message: 'Subasta no encontrada' });
      }
      res.json(subasta);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener subasta: ' + error.message });
    }
  }

  // Obtener todas las subastas
  async obtenerSubastas(req, res) {
    try {
      const subasta = await SubastaService.obtenerSubastas();
      res.status(200).json(subasta);  // Cambiado a 200 OK
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener subastas: ' + error.message });
    }
  }

  // Actualizar una subasta por ID
  async actualizarSubasta(req, res) {
    try {
      const subastaId = req.params.id;
      const subastaData = req.body;
      const subastaActualizada = await SubastaService.actualizarSubasta(subastaId, subastaData);
      if (!subastaActualizada) {
        return res.status(404).json({ message: 'Subasta no encontrada para actualizar' });
      }
      res.status(200).json(subastaActualizada);
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar subasta: ' + error.message });
    }
  }

  // Eliminar una subasta por ID
  async eliminarSubasta(req, res) {
    try {
      const subastaId = req.params.id;
      const subastaEliminada = await SubastaService.eliminarSubasta(subastaId);
      if (!subastaEliminada) {
        return res.status(404).json({ message: 'Subasta no encontrada para eliminar' });
      }
      res.status(200).json({message: 'Subasta eliminada correctamente '});
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar subasta: ' + error.message });
    }
  }
  // SubastaController.js

// SubastaController.js
async agregarOferta(req, res) {
  try {
    const subastaId = req.params.id;
    const ofertaData = req.body; 

    // Lógica para agregar la oferta
    const subasta = await SubastaService.agregarOferta(subastaId, ofertaData);

    // Si la subasta tiene tiempo extra y no está finalizada, reiniciamos el tiempo extra
    if (subasta.tiempoExtraRestante !== null && !subasta.finalizada) {
      subasta.tiempoExtraRestante = 60; // Reiniciamos a 60 segundos
      await subasta.save();
    }

    // Emitir evento de actualización a través de WebSocket
    io.emit('subastaActualizada', {
      subastaId: subasta._id,
      tiempoExtraRestante: subasta.tiempoExtraRestante,
      finalizada: subasta.finalizada
    });

    res.status(200).json(subasta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}


async finalizarSubasta(req, res) {
  const { id } = req.params;
  try {
      const subasta = await SubastaModel.findById(id);
      if (!subasta) {
          return res.status(404).json({ message: "Subasta no encontrada" });
      }
      
      let ganadorAgencia = "Sin ganador";

      // Obtener la oferta más alta y asignar al ganador
      if (subasta.ofertadores.length > 0) {
          const ofertaGanadora = subasta.ofertadores.reduce((max, oferta) =>
              oferta.monto > max.monto ? oferta : max
          );

          const usuarioGanador = await UsuarioModel.findById(ofertaGanadora.usuario); // 🔥 Populamos usuario
          
          if (usuarioGanador) {
              subasta.ganador = usuarioGanador._id; // Guarda el ID en la base de datos
              ganadorAgencia = usuarioGanador.agencia; // Enviamos el nombre de la agencia
          }
      } else {
          subasta.ganador = null;
      }
      
      subasta.finalizada = true;
      subasta.tiempoExtraRestante = null; // Resetear el tiempo extra
      await subasta.save();

      console.log("Emitido evento subastaFinalizada con datos:", {
          subastaId: subasta._id,
          ganador: ganadorAgencia,
      });
      
      io.emit("subastaFinalizada", {
          subastaId: subasta._id,
          ganador: ganadorAgencia, // 🔥 Ahora enviamos la agencia en lugar del ID
      });

      res.status(200).json({ message: "Subasta finalizada correctamente", ganador: ganadorAgencia });
  } catch (error) {
      console.error("Error en finalizarSubasta:", error);
      res.status(500).json({ message: "Error al finalizar la subasta", error });
  }
}


async activarTiempoExtra(req, res) {
  const { id } = req.params;
  try {
      const subasta = await SubastaModel.findById(id);
      if (!subasta) {
          return res.status(404).json({ message: "Subasta no encontrada" });
      }

      // ✅ Si el tiempo extra no existe o ya está en progreso, no lo reiniciamos
      if (subasta.tiempoExtraRestante === null || subasta.tiempoExtraRestante <= 0) {
          subasta.tiempoExtraRestante = 60;
          await subasta.save();
      }

      res.status(200).json({ tiempoExtraRestante: subasta.tiempoExtraRestante });
  } catch (error) {
      res.status(500).json({ message: "Error al activar tiempo extra", error });
  }
}


async reducirTiempoExtra(req, res) {
  const { id } = req.params;
  try {
      const subasta = await SubastaModel.findById(id);
      if (!subasta) {
          return res.status(404).json({ message: "Subasta no encontrada" });
      }

      if (subasta.tiempoExtraRestante > 0) {
          subasta.tiempoExtraRestante -= 1;
          await subasta.save();
      } else if (subasta.tiempoExtraRestante === 0 && !subasta.finalizada) {
          subasta.finalizada = true; 
          subasta.tiempoExtraRestante = null;
          await subasta.save();
      }

      res.status(200).json({ 
          tiempoExtraRestante: subasta.tiempoExtraRestante, 
          finalizada: subasta.finalizada 
      });
  } catch (error) {
      res.status(500).json({ message: "Error al reducir tiempo extra", error });
  }
}


  

}

export default new SubastaController();
