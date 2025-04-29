import SubastaModel from '../dao/models/subastas-model.js';
import SubastaService from '../service/sub-service.js';
import { io } from '../app.js';
import UsuarioModel from '../dao/models/usuario-model.js';
import { enviarCorreoGanador } from '../service/email-service.js';


class SubastaController {
  // Crear una nueva subasta
// SubastaController.js
async crearSubasta(req, res) {
  try {
    const { nombre, motor, modelo,kilometros , ubicacion, descripcion, precioInicial, fechaFin } = req.body;

    const imagenes = req.files?.img?.map(file => file.filename) || [];
    const peritajes = req.files?.peritaje?.map(file => file.filename) || [];


    if (!imagenes || imagenes.length === 0) {
      return res.status(400).json({ message: 'Debe subir al menos una imagen del auto' });
    }

    const nuevaSubasta = await SubastaModel.create({
      autos: {
        nombre,
        motor,
        modelo,
        kilometros,
        ubicacion,
        descripcion,
        img: imagenes, // Array de strings
        peritaje: peritajes,
      },
      precioInicial: Number(precioInicial),
      fechaFin,
      ofertadores: [],
      finalizada:false,
    });

    res.status(201).json(nuevaSubasta);
  } catch (error) {
    console.error('Error al crear subasta:', error);
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

    //Obtener la oferta mas alta y el usuario que la hizo
    const highestOffer = subasta.ofertadores.reduce((max, o) => (o.monto > max.monto ? o : max), subasta.ofertadores[0]);
    
    // Emitir evento de actualización a través de WebSocket
    io.emit('subastaActualizada', {
      subastaId: subasta._id,
      highestBid:highestOffer.monto,
      highestBidder: highestOffer.usuario,
      tiempoExtraRestante: subasta.tiempoExtraRestante,
      finalizada: subasta.finalizada
    });

    //console.log("Enviando evento 'nueva-oferta-realizada' para el usuario:", highestOffer.usuario._id || highestOffer.usuario);

    io.emit("nueva-oferta-realizada", {
      usuarioId: highestOffer.usuario._id?.toString() || highestOffer.usuario.toString()
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
    const subasta = await SubastaModel.findById(id).populate("autos");
    if (!subasta) {
      return res.status(404).json({ message: "Subasta no encontrada" });
    }

    let ganadorAgencia = "Sin ganador";
    let emailGanador = null;
    let usuarioGanador = null; // 🔥 Definir fuera del bloque para evitar errores

    if (subasta.ofertadores.length > 0) {
      const ofertaGanadora = subasta.ofertadores.reduce((max, oferta) =>
        oferta.monto > max.monto ? oferta : max
      );

      usuarioGanador = await UsuarioModel.findById(ofertaGanadora.usuario); // Ahora es accesible en todo el bloque

      if (usuarioGanador) {
        subasta.ganador = usuarioGanador._id;
        ganadorAgencia = usuarioGanador.agencia;
        emailGanador = usuarioGanador.email; 
      }
    } else {
      subasta.ganador = null;
    }

    subasta.finalizada = true;
    subasta.tiempoExtraRestante = null;

    // 📩 Solo enviar email si no fue enviado antes y hay un ganador
    if (!subasta.emailEnviado && usuarioGanador) {
      await enviarCorreoGanador(emailGanador,  subasta.autos.nombre);
      subasta.emailEnviado = true; // 🔥 Marcamos como enviado
    }

    await subasta.save();

    io.emit("subastaFinalizada", {
      subastaId: subasta._id,
      ganador: ganadorAgencia,
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
