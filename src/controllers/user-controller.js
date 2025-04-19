import UsuarioService from '../service/user-service.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UsuarioModel from '../dao/models/usuario-model.js';
import generateToken from '../utils/jsonwebtoken.js';
import cookieParser from 'cookie-parser';





class UsuarioController {
  // Crear un nuevo usuario
  async crearUsuario(req, res) {
    try {
      const userData = req.body;
      const nuevoUsuario = await UsuarioService.crearUsuario(userData);
      res.status(201).json(nuevoUsuario);
    } catch (error) {
      res.status(500).json({ message: 'Error al crear usuario: ' + error.message });
    }
  }

  // Obtener un usuario por su ID
  async obtenerUsuarioPorId(req, res) {
    try {
      const usuarioId = req.params.id;
      const usuario = await UsuarioService.obtenerUsuarioPorId(usuarioId);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener usuario: ' + error.message });
    }
  }

  // Obtener todos los usuarios
  async obtenerUsuarios(req, res) {
    try {
      const usuarios = await UsuarioService.obtenerUsuarios();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener usuarios: ' + error.message });
    }
  }

  // Cambiar el estado de "aprobado"
async cambiarEstadoAprobado(req, res) {
  try {
    const { id } = req.params;
    const usuario = await UsuarioModel.findById(id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    usuario.aprobado = !usuario.aprobado; // toggle
    await usuario.save();

    res.json({ message: 'Estado actualizado', aprobado: usuario.aprobado });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar el estado: ' + error.message });
  }
}

  // Actualizar un usuario por ID
  async actualizarUsuario(req, res) {
    try {
      const usuarioId = req.params.id;
      const userData = req.body;
      const usuarioActualizado = await UsuarioService.actualizarUsuario(usuarioId, userData);
      if (!usuarioActualizado) {
        return res.status(404).json({ message: 'Usuario no encontrado para actualizar' });
      }
      res.status(200).json(usuarioActualizado);
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar usuario: ' + error.message });
    }
  }

  // Eliminar un usuario por ID
  async eliminarUsuario(req, res) {
    try {
      const usuarioId = req.params.id;
      const usuarioEliminado = await UsuarioService.eliminarUsuario(usuarioId);
      if (!usuarioEliminado) {
        return res.status(404).json({ message: 'Usuario no encontrado para eliminar' });
      }
      res.status(204).json({ message: 'Usuario eliminado correctamente' });  // Usando 204 No Content
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar usuario: ' + error.message });
    }
  }


  async register(req, res) {
    const {nombre, razonSocial, agencia,dni , email, password, telefono, direccion } = req.body;
    try {
      const existeUsuario = await UsuarioModel.findOne({ email });
      if (existeUsuario) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }

      const hashPassword = bcrypt.hashSync(password, 10);

      const nuevoUsuario = await UsuarioService.crearUsuario({
        nombre,
        razonSocial,
        agencia,
        dni,
        email,
        telefono,
        password: hashPassword,
        direccion
      });
      return res.status(201).json({
        message: 'Usuario registrado con éxito',
        usuario: nuevoUsuario,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error del servidor' + error })
    }
  }

  async loginUsuario(req, res) {
    try {
      const { email, password } = req.body;
      const usuario = await UsuarioModel.findOne({ email });
  
      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      // ✅ Validamos si está aprobado
      if (!usuario.aprobado) {
        return res.status(403).json({ message: "Tu cuenta aún no fue aprobada por un administrador." });
      }
  
      // 🔐 Verificamos password
      const esValida = await bcrypt.compare(password, usuario.password);
      if (!esValida) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }
  
      // 🪪 Generamos token
      const token = generateToken({
        _id: usuario._id,
        email: usuario.email,
        agencia: usuario.agencia,
        rol: usuario.rol
      });
  
      res.cookie('acces_token', token, {
        httpOnly: false,
        secure: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
        domain: ".railway.app",
      });
  
      return res.status(201).json({
        message: 'Login correcto',
        token
      });
  
    } catch (error) {
      res.status(500).json({ message: 'Error de Login: ' + error.message });
    }
  }
  

  async logOut(req, res) {
    res.clearCookie('acces_token', {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      domain: ".railway.app",
      path: "/"
    });
    res.status(200).json({ message: "Logout exitoso" });
  }
}


export default new UsuarioController();
