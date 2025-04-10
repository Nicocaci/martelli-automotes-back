import mongoose from "mongoose";

const usuarioSchema = mongoose.Schema({
  nombre:{
    type: String,
  },
  agencia:{
    type: String,
    required: true,
  },
  razonSocial: {
    type: String,
    require: true,
  },
  dni:{
    type: Number,
    required: true
  },
  telefono:{
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  direccion: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  aprobado: {
    type: Boolean,
    default: false
  },
  ofertasHechas: [
    {
      subasta:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "subastas"
      },
      monto: {
        type: Number,
        required: true
      }
    }
  ],
});


const UsuarioModel = mongoose.model("usuarios", usuarioSchema);

export default UsuarioModel;
