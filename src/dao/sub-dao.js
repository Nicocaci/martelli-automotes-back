import SubastaModel from './models/subastas-model.js';

class SubastaDAO {
  async   crearSubasta(subastaData) {
    try {
      const nuevaSubasta = new SubastaModel(subastaData);
      await nuevaSubasta.save();
      return nuevaSubasta;
    } catch (error) {
      throw new Error('Error al crear subasta: ' + error.message);
    }
  }

  async obtenerSubastaPorId(subastaId) {
    try {
      const subasta = await SubastaModel.findById(subastaId).populate("ofertadores.usuario");
      if (!subasta) throw new Error("Subasta no encontrada");
      return subasta;
    } catch (error) {
      throw new Error('Error al obtener subasta: ' + error.message);
    }
  }

  async obtenerSubastas() {
    try {
      const subastas = await SubastaModel.find();
      return subastas;
    } catch (error) {
      throw new Error('Error al obtener subastas: ' + error.message);
    }
  }

  async actualizarSubasta(subastaId, subastaData) {
    try {
      const subastaActualizada = await SubastaModel.findByIdAndUpdate(subastaId, subastaData, { new: true });
      if (!subastaActualizada) throw new Error("Subasta no encontrada");
      return subastaActualizada;
    } catch (error) {
      throw new Error('Error al actualizar subasta: ' + error.message);
    }
  }

  async eliminarSubasta(subastaId) {
    try {
      const subastaEliminada = await SubastaModel.findByIdAndDelete(subastaId);
      if (!subastaEliminada) throw new Error("Subasta no encontrada");
      return subastaEliminada;
    } catch (error) {
      throw new Error('Error al eliminar subasta: ' + error.message);
    }
  }
}

export default new SubastaDAO();
