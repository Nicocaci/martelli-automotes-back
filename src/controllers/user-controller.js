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
    const { agencia,dni , email, password, telefono, direccion } = req.body;
    try {
      const existeUsuario = await UsuarioModel.findOne({ email });
      if (existeUsuario) {
        return res.status(400).send('El email ya esta registrado');
      }

      const hashPassword = bcrypt.hashSync(password, 10);

      const nuevoUsuario = await UsuarioService.crearUsuario({
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
        return res.status(404).json({ message: "Usuario no encontrado" })
      }

      //Verificamos password

      const esValida = await bcrypt.compare(password, usuario.password);
      if (!esValida) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      //Generamos Token


      const token = generateToken({
        _id: usuario._id,
        email: usuario.email,
        agencia: usuario.agencia,
        rol: usuario.rol
      })
      res.cookie('acces_token', token, {
        httpOnly: false,  // 🔥 Esto evita que JS en el navegador acceda a la cookie
        secure: true,    // 🔥 Asegura que solo se envíe por HTTPS (funciona en Railway)
        sameSite: "None", // 🔥 Importante para que funcione en diferentes dominios
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        path: '/',
        // domain: ".railway.app", // Disponible en toda la app
      });

      return res.status(201).json({
        message: 'Login correcto',
        token
      });

    } catch (error) {
      res.status(500).json({ message: 'Error de Login' + error.message })
    }
  }

  async logOut(req, res) {
    res.clearCookie('acces_token', {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      // domain: ".railway.app",
      path: "/"
    });
    res.status(200).json({ message: "Logout exitoso" });
  }
}


export default new UsuarioController();
