import mongoose from "mongoose";

const usuarioSchema = mongoose.Schema({
  agencia:{
    type: String,
    required: true,
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
