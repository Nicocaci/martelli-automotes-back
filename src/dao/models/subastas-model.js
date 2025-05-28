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
    kilometros: {
      type: Number,
      required: true,
    }
    ,
    ubicacion: {
      type: String,
      required: true
    },
    img: {
      type: [String], // array de strings
      default: [],
    },
    descripcion: {
      type: String,
      required:true,
    },
    peritaje: {
      type: [String],
      default: [],
    }
  },
fechaInicio: {
  type: Date,
  default: () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000); // hora local como si fuera UTC
  }
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
  },
  emailEnviado: { type: Boolean, default: false } // 🔥 Nuevo campo
});



const SubastaModel = mongoose.model("subastas", subastaSchema);

export default SubastaModel;

