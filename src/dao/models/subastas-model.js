import mongoose from "mongoose";

const subastaSchema = new mongoose.Schema({
  autos: {
    nombre: {
      type: String,
      required: true
    },
    motor: {
      type: String,
      required: true
    },
    modelo: {
      type: String,
      required: true
    },
    ubicacion: {
      type: String,
      required: true
    },
    img: {
      type: String,
    }
  },
  fechaInicio: {
    type: Date,
    default: () => Date.now()
  },
  fechaFin: {
    type: Date,
    required: true
  },
  precioInicial: {
    type: Number,
    required: true
  },
  ofertadores: [
    {
      usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "usuarios",
        required: true
      },
      monto: {
        type: Number,
        required: true
      }
    }
  ],
  finalizada: { 
    type: Boolean, 
    default: false // Nueva propiedad para saber si la subasta terminó
  },
  tiempoExtraRestante: { 
    type: Number, 
    default: null
  },
  ganador: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "usuarios", 
    default: null 
  }
});



const SubastaModel = mongoose.model("subastas", subastaSchema);

export default SubastaModel;

