import SubastaRepository from '../repository/sub-repository.js';
import SubastaModel from '../dao/models/subastas-model.js';
import UsuarioModel from '../dao/models/usuario-model.js';

class SubastaService {
  // 🔹 Crear una nueva subasta
  async crearSubasta(subastaData) {
    try {
      return await SubastaRepository.crearSubasta(subastaData);
    } catch (error) {
      throw new Error(`Error en el servicio de subastas: ${error.message}`);
    }
  }

  // 🔹 Obtener una subasta por ID (con nombres de ofertadores)
  async obtenerSubastaPorId(subastaId) {
    try {
      return await SubastaModel.findById(subastaId)
        .populate("ofertadores.usuario", "nombre"); // ✅ Trae los nombres
    } catch (error) {
      throw new Error(`Error en el servicio de subastas: ${error.message}`);
    }
  }

  // 🔹 Obtener todas las subastas (con nombres de ofertadores)
  async obtenerSubastas() {
    try {
      return await SubastaModel.find()
        .populate("ofertadores.usuario", "agencia"); // ✅ Incluye los nombres en todas
    } catch (error) {
      throw new Error(`Error en el servicio de subastas: ${error.message}`);
    }
  }

  // 🔹 Actualizar una subasta
  async actualizarSubasta(subastaId, subastaData) {
    try {
      return await SubastaRepository.actualizarSubasta(subastaId, subastaData);
    } catch (error) {
      throw new Error(`Error en el servicio de subastas: ${error.message}`);
    }
  }

  // 🔹 Eliminar una subasta y limpiar referencias en usuarios
  async eliminarSubasta(subastaId) {
    try {
      const subasta = await SubastaModel.findById(subastaId);
      if (!subasta) return null;

      await SubastaModel.findByIdAndDelete(subastaId);
      await UsuarioModel.updateMany(
        { "ofertasHechas.subasta": subastaId },
        { $pull: { ofertasHechas: { subasta: subastaId } } }
      );

      return subasta;
    } catch (error) {
      throw new Error(`Error al eliminar subasta y limpiar referencias: ${error.message}`);
    }
  }

  // 🔹 Agregar o actualizar oferta en una subasta
  async agregarOferta(subastaId, ofertaData) {
    try {
      const { usuario, monto } = ofertaData;

      // ✅ Verificar si el usuario existe
      const usuarioExistente = await UsuarioModel.findById(usuario);
      if (!usuarioExistente) throw new Error("El usuario no existe");

      // ✅ Verificar si la subasta existe
      const subasta = await SubastaModel.findById(subastaId);
      if (!subasta) throw new Error("Subasta no encontrada");

      // ✅ Revisar si el usuario ya ofertó
      const ofertaExistente = subasta.ofertadores.find(o => o.usuario.toString() === usuario);
      if (ofertaExistente) {
        ofertaExistente.monto = monto; // 🔹 Actualizar monto
      } else {
        subasta.ofertadores.push({ usuario, monto }); // 🔹 Nueva oferta
      }

      await subasta.save();

      // ✅ Actualizar las ofertas en el perfil del usuario
      const ofertaUsuario = usuarioExistente.ofertasHechas.find(o => o.subasta.toString() === subastaId);
      if (ofertaUsuario) {
        ofertaUsuario.monto = monto;
      } else {
        usuarioExistente.ofertasHechas.push({ subasta: subastaId, monto });
      }

      await usuarioExistente.save();

      return await subasta.populate("ofertadores.usuario", "agencia"); // ✅ Devolver con nombres
    } catch (error) {
      throw new Error(`Error al agregar la oferta: ${error.message}`);
    }
  }
}

export default new SubastaService();